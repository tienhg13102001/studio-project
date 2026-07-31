import type {
  Schema,
  Query,
  MongooseDistinctQueryMiddleware,
  MongooseQueryAndDocumentMiddleware,
} from "mongoose";

/**
 * Thùng rác: xoá là đánh dấu, không mất hẳn.
 *
 * VÌ SAO CẦN: trong portal, bấm Xoá là dữ liệu bay vĩnh viễn ngay lập tức. Một
 * dự án gồm 30 ảnh và 1 video lỡ tay xoá là phải nhập lại từ đầu, mà ảnh gốc
 * nhiều khi không còn.
 *
 * CÁCH LÀM: thêm mốc thời gian xoá vào bản ghi, rồi tự động lọc bản đã xoá ra
 * khỏi MỌI truy vấn đọc. Chọn cách này thay vì sửa tay từng chỗ đọc vì trong mã
 * nguồn có gần 30 chỗ đọc dữ liệu — sửa tay chắc chắn sót, mà sót một chỗ nghĩa
 * là dữ liệu đã xoá vẫn hiện ra cho khách. Bộ lọc chạy cả với populate, nên
 * trang dịch vụ không kéo theo dự án đã nằm trong thùng rác.
 *
 * Sau 30 ngày, cơ sở dữ liệu tự dọn hẳn (chỉ dọn bản đã đánh dấu; bản đang dùng
 * có mốc rỗng nên không bao giờ bị đụng tới).
 */

/** Giữ trong thùng rác bao lâu trước khi xoá hẳn. */
export const TRASH_TTL_DAYS = 30;

/** Đặt cờ này lên truy vấn để CỐ Ý đọc cả bản đã xoá (dùng cho màn Thùng rác). */
export const WITH_DELETED = "withDeleted";

/** Thao tác chỉ tồn tại ở dạng truy vấn — gắn hook thẳng, không sợ nhầm. */
const QUERY_OPS: MongooseDistinctQueryMiddleware[] = [
  "countDocuments",
  "distinct",
  "find",
  "findOne",
  "findOneAndDelete",
  "findOneAndReplace",
  "findOneAndUpdate",
  "replaceOne",
  "updateMany",
];

/**
 * Hai tên này vừa là thao tác của truy vấn vừa là phương thức của bản ghi. Chỉ
 * gắn cho dạng truy vấn, vì với bản ghi thì `this` không phải truy vấn và hook
 * sẽ ném lỗi.
 *
 * `deleteMany` CỐ Ý không nằm trong danh sách: nó chỉ được dùng bởi script dọn
 * sạch dữ liệu để nạp lại từ đầu, mà "dọn sạch" thì phải sạch thật.
 */
const QUERY_OR_DOC_OPS: MongooseQueryAndDocumentMiddleware[] = ["updateOne", "deleteOne"];

export type SoftDeleteFields = { deletedAt?: Date | null };

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
      index: true,
      // Cơ sở dữ liệu tự xoá hẳn sau ngần này giây kể từ mốc đã đánh dấu. Bản
      // chưa xoá có giá trị rỗng nên bị bỏ qua — đây là hành vi sẵn có của Mongo.
      expires: TRASH_TTL_DAYS * 24 * 60 * 60,
    },
  });

  // Hàm đồng bộ, KHÔNG nhận tham số `next`: từ Mongoose 9, middleware của truy
  // vấn không còn được truyền callback nữa — gọi next() sẽ ném lỗi ngay lần đọc
  // đầu tiên, tức là sập toàn bộ website.
  function hideDeleted(this: Query<unknown, unknown>): void {
    // Cho phép bỏ qua bộ lọc khi cần đọc chính thùng rác.
    if (this.getOptions()[WITH_DELETED]) return;

    const filter = this.getFilter();
    // Nếu nơi gọi đã tự nói rõ về trường này thì tôn trọng, không đè lên.
    if (!("deletedAt" in filter)) this.where({ deletedAt: null });
  }

  for (const op of QUERY_OPS) schema.pre(op, hideDeleted);
  for (const op of QUERY_OR_DOC_OPS) {
    schema.pre(op, { query: true, document: false }, hideDeleted);
  }

  /** Đánh dấu đã xoá thay vì xoá hẳn. Trả về null nếu không tìm thấy. */
  schema.statics.softDeleteById = async function (id: string) {
    return this.findOneAndUpdate(
      { _id: id },
      { deletedAt: new Date() },
      { returnDocument: "after" },
    );
  };

  /** Bỏ đánh dấu để đưa bản ghi trở lại. */
  schema.statics.restoreById = async function (id: string) {
    return this.findOneAndUpdate(
      { _id: id },
      { deletedAt: null },
      { returnDocument: "after" },
    ).setOptions({ [WITH_DELETED]: true });
  };

  /** Xoá hẳn một bản ĐANG nằm trong thùng rác (không đụng tới bản đang dùng). */
  schema.statics.purgeById = async function (id: string) {
    return this.findOneAndDelete({ _id: id, deletedAt: { $ne: null } }).setOptions({
      [WITH_DELETED]: true,
    });
  };

  /** Danh sách đang nằm trong thùng rác, mới xoá xếp trước. */
  schema.statics.findDeleted = function () {
    return this.find({ deletedAt: { $ne: null } })
      .sort({ deletedAt: -1 })
      .setOptions({ [WITH_DELETED]: true });
  };
}

/** Kiểu bổ sung cho model có dùng thùng rác. */
export type SoftDeleteModel<T> = {
  softDeleteById(id: string): Promise<T | null>;
  restoreById(id: string): Promise<T | null>;
  purgeById(id: string): Promise<T | null>;
  /** Bản ghi trong thùng rác chắc chắn có mốc xoá, nên kiểu trả về nói rõ điều đó. */
  findDeleted(): Query<(T & { deletedAt: Date })[], T>;
};
