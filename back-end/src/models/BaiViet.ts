import mongoose, { Schema, type Document } from "mongoose";
import { softDeletePlugin, type SoftDeleteModel } from "../lib/softDelete.ts";

/**
 * Bài viết (mục /bai-viet trên web, 24/11/2026 — mục C4 lộ trình SEO).
 *
 * VÌ SAO CÓ: khách và trợ lý AI hỏi những câu kiểu "chi phí sản xuất TVC bao
 * nhiêu", "quay hội nghị cần mấy máy". Đối thủ chiếm các câu đó bằng bài viết
 * (vài trăm tới cả nghìn bài); trang dịch vụ không trả lời được chúng.
 *
 * CHỈ TIẾNG VIỆT: bài nhắm từ khoá tiếng Việt, khách tìm bằng tiếng Việt. Khi
 * nào có bản /en thật (mục G12) thì mới tính thêm.
 *
 * NỘI DUNG LÀ MARKDOWN chứ không phải HTML: Hoàn và team gõ được không cần biết
 * thẻ, và giao diện tự chặn HTML thô (xem front-end/src/lib/baiViet.ts) nên ô
 * này không thành đường lén chèn mã lên web.
 */
export interface IBaiViet extends Document {
  /** Đường dẫn: /bai-viet/<slug>. Chữ thường không dấu, gạch nối. Đổi là gãy link đã chia sẻ. */
  slug: string;
  /** Tiêu đề bài, cũng là H1 và <title>. */
  tieuDe: string;
  /** Mô tả ngắn cho Google và thẻ chia sẻ (~150 ký tự). */
  moTa: string;
  /** Thân bài, Markdown. */
  noiDung: string;
  /** Ảnh bìa (link ảnh đã tải lên). Để trống thì dùng ảnh chia sẻ mặc định của web. */
  anhBia: string;
  /** "nhap" = chỉ Portal thấy; "dang" = lên web. */
  trangThai: "nhap" | "dang";
  /** Lần đầu bấm Đăng. Giữ nguyên khi sửa về sau, để Google thấy ngày đăng thật. */
  ngayDang: Date | null;
  /** Slug dịch vụ liên quan — cuối bài hiện nút sang đúng trang dịch vụ đó. */
  dichVu: string;
  createdAt: Date;
  updatedAt: Date;
}

const baiVietSchema = new Schema<IBaiViet>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 120,
    },
    tieuDe: { type: String, required: true, trim: true, maxlength: 200 },
    moTa: { type: String, trim: true, default: "", maxlength: 320 },
    noiDung: { type: String, default: "" },
    anhBia: { type: String, trim: true, default: "" },
    trangThai: { type: String, enum: ["nhap", "dang"], default: "nhap" },
    ngayDang: { type: Date, default: null },
    dichVu: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)["_id"];
        return ret;
      },
    },
  },
);

// Không `unique` cứng: bài trong thùng rác vẫn giữ slug, và chỉ mục unique sẽ
// chặn tạo lại bài cùng tên đường dẫn. Trùng slug kiểm ở route (chỉ bài còn sống).
baiVietSchema.index({ slug: 1 });
baiVietSchema.index({ trangThai: 1, ngayDang: -1 });

// Thùng rác 30 ngày như mọi loại dữ liệu khác.
baiVietSchema.plugin(softDeletePlugin);

export const BaiViet = mongoose.model<IBaiViet>("BaiViet", baiVietSchema) as mongoose.Model<IBaiViet> &
  SoftDeleteModel<IBaiViet>;
