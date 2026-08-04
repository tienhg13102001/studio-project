import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import { softDeletePlugin, type SoftDeleteModel } from "../lib/softDelete.ts";
import { slugPlugin } from "../lib/slug.ts";
import type { IService } from "./Service.ts";
import type { IUser } from "./User.ts";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

// Ba phần của câu chuyện dự án — xem `ICaseStudy` ngay dưới để biết vì sao có.
const caseStudySchema = new Schema(
  {
    challenge: { type: localizedString, required: false },
    approach:  { type: localizedString, required: false },
    result:    { type: localizedString, required: false },
  },
  { _id: false },
);

/**
 * Câu chuyện dự án — thứ biến bộ sưu tập thành bằng chứng năng lực.
 *
 * Trước đây mỗi dự án chỉ có tên, ảnh, video và ngày quay. Khách xem xong biết
 * Bee Z quay đẹp, nhưng không biết Bee Z GIẢI QUYẾT ĐƯỢC VẤN ĐỀ GÌ — mà khách
 * thuê TVC thì mua kết quả chứ không mua đoạn phim đẹp.
 *
 * Cả ba phần đều KHÔNG bắt buộc: chỉ vài dự án mạnh nhất mới đáng viết đầy đủ,
 * số còn lại giữ nguyên như cũ và phần này tự ẩn đi.
 */
export interface ICaseStudy {
  /** Khách cần gì, khó ở chỗ nào. */
  challenge?: { en?: string; vi?: string };
  /** Bee Z làm gì khác với cách làm thông thường. */
  approach?: { en?: string; vi?: string };
  /** Đo được gì — nên có số. */
  result?: { en?: string; vi?: string };
}

export interface IProject extends Document {
  /** Tên đường dẫn đọc được, sinh một lần lúc tạo — xem `lib/slug.ts`. */
  slug?: string;
  caseStudy?: ICaseStudy;
  layout: "vertical" | "horizontal";
  service: PopulatedDoc<IService>;
  thumbnailImage: string;
  title: string;
  subtitle: { en: string; vi: string };
  prominent: boolean;
  video?: string; // optional, path to video file
  photos?: string[]; // optional, list of product photo paths
  shootDate?: Date; // optional, date the project was shot
  shootLocation?: string; // optional, Vietnamese province/city where it was shot
  members?: PopulatedDoc<IUser>[]; // optional, references to team members who worked on the project
}

const projectSchema = new Schema<IProject>(
  {
    layout:         { type: String, enum: ["vertical", "horizontal"], required: true },
    service:        { type: Schema.Types.ObjectId, ref: "Service", required: true },
    thumbnailImage: { type: String, required: true },
    title:          { type: String, required: true },
    subtitle:       { type: localizedString, required: true },
    prominent:      { type: Boolean, default: false },
    video:          { type: String, required: false }, // path to video file (optional)
    photos:         { type: [String], required: false }, // array of product photo paths (optional)
    shootDate:      { type: Date, required: false }, // date the project was shot (optional)
    shootLocation:  { type: String, required: false }, // VN province/city (optional)
    members:        [{ type: Schema.Types.ObjectId, ref: "User" }], // team members who worked on the project
    caseStudy:      { type: caseStudySchema, required: false },
  },
  {
    // Cần cho sitemap: khai báo ngày cập nhật gần nhất của từng trang để
    // máy tìm kiếm biết nội dung nào vừa đổi. Không có dòng này thì updatedAt
    // luôn rỗng.
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (ret as Record<string, unknown>)["_id"];
        return ret;
      },
    },
  },
);

// Bật thùng rác: xoá là đánh dấu, tự dọn hẳn sau 30 ngày.
projectSchema.plugin(softDeletePlugin);

// Địa chỉ đọc được: /du-an/vf9-teaser-the-mark-of-leadership
projectSchema.plugin(slugPlugin((doc) => (doc as { title?: string }).title ?? ""));

export const Project = mongoose.model<IProject>("Project", projectSchema) as
  mongoose.Model<IProject> & SoftDeleteModel<IProject>;
