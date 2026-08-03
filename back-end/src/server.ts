import "dotenv/config";
import { connectDB } from "./lib/db.ts";
import app from "./app.ts";
import { backfillSlugs } from "./lib/slug.ts";
import { Service } from "./models/Service.ts";
import { Project } from "./models/Project.ts";

const PORT = Number(process.env.PORT) || 5002;

/**
 * Điền tên đường dẫn cho dữ liệu tạo từ trước khi có tính năng này.
 *
 * Chạy TRƯỚC khi mở cổng, để không có khoảnh khắc nào máy chủ nhận yêu cầu mà
 * dự án chưa có địa chỉ. Chỉ vài chục bản ghi nên rất nhanh, và lần khởi động
 * sau sẽ không còn gì để làm nên tự bỏ qua. Hàm tự nuốt lỗi bên trong: hỏng thì
 * ghi log rồi đi tiếp, không được phép chặn máy chủ khởi động.
 */
async function dienTenDuongDan(): Promise<void> {
  await backfillSlugs(
    Service,
    (d) => {
      const t = (d as { title?: { vi?: string; en?: string } }).title;
      return t?.vi || t?.en || "";
    },
    "dịch vụ",
  );
  await backfillSlugs(Project, (d) => (d as { title?: string }).title ?? "", "dự án");
}

connectDB()
  .then(dienTenDuongDan)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 BeeZ API running on http://localhost:${PORT}`);
      console.log(`   GET /api/health`);
      console.log(`   GET /api/landing`);
      console.log(`   GET /api/services`);
      console.log(`   GET /api/projects`);
    });
  });
