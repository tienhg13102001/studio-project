import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import { softDeletePlugin, type SoftDeleteModel } from "../lib/softDelete.ts";
import type { IService } from "./Service.ts";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

/**
 * Nhận xét của khách hàng.
 *
 * VÌ SAO CÓ BẢNG RIÊNG thay vì nhét vào phần Cài đặt web: nhận xét là thứ thêm
 * dần theo thời gian, cần bật/tắt từng cái, cần đổi thứ tự, và cần gắn với đúng
 * mảng dịch vụ. Nhồi vào một ô văn bản trong Cài đặt thì mọi việc đó phải sửa
 * tay và không ai dám đụng.
 *
 * KHÔNG CÓ CHỖ NÀO CHO KHÁCH TỰ GỬI NHẬN XÉT LÊN. Cố ý: mọi câu ở đây đều do
 * quản trị nhập sau khi đã hỏi khách, nên không cần khâu kiểm duyệt và cũng
 * không có đường để người lạ đẩy chữ lên web.
 */
export interface ITestimonial extends Document {
  /** Lời khách nói. Bỏ trống bản tiếng Anh thì web tự hiện bản tiếng Việt. */
  quote: { en?: string; vi?: string };
  /** Tên người nói. Để trống = nhận xét ẩn danh, web không hiện dòng tên. */
  authorName?: string;
  /** Chức danh + nơi làm việc, ví dụ "Giám đốc Marketing, OWEN". */
  authorTitle?: string;
  /**
   * Mảng dịch vụ mà nhận xét này thuộc về — dùng để hiện đúng nhận xét trên
   * đúng trang dịch vụ. Để trống thì nhận xét chỉ xuất hiện ở trang chủ (nếu
   * được bật nổi bật).
   */
  service?: PopulatedDoc<IService> | null;
  /** Hiện ở trang chủ. Trang chủ chỉ nên để 3 cái — nhiều quá thì khách lướt hết. */
  featured: boolean;
  order: number;
  /** Tắt tạm mà không xoá — dùng khi khách xin gỡ xuống. */
  active: boolean;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    quote: { type: localizedString, required: true },
    authorName: { type: String, trim: true, default: "" },
    authorTitle: { type: String, trim: true, default: "" },
    // `default: null` chứ không bỏ trống: thiếu nó thì bản ghi không có trường
    // `service` nào cả, và truy vấn lọc theo dịch vụ ở giao diện phải xử lý
    // thêm một trường hợp "không tồn tại" bên cạnh "bằng null".
    service: { type: Schema.Types.ObjectId, ref: "Service", default: null },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
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

// Trang chủ và trang dịch vụ đều đọc theo đúng hai bộ lọc này, mỗi lần khách
// vào web — nên đánh chỉ mục để khỏi quét cả bảng.
testimonialSchema.index({ active: 1, featured: 1, order: 1 });
testimonialSchema.index({ active: 1, service: 1, order: 1 });

// Bật thùng rác: xoá là đánh dấu, tự dọn hẳn sau 30 ngày.
testimonialSchema.plugin(softDeletePlugin);

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema) as
  mongoose.Model<ITestimonial> & SoftDeleteModel<ITestimonial>;
