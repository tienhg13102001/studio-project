import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

/**
 * Sửa dự án Cheese Coffee — tên sai chính tả và mô tả chỉ là cái tên.
 *
 * PHÁT HIỆN NGÀY 22/08/2026 khi rà vì sao Search Console còn 96 địa chỉ chưa
 * lập chỉ mục. Đo cả 66 trang dự án: 65 trang có thẻ mô tả dài 100–200 ký tự,
 * RIÊNG trang này đúng 13 ký tự — "Cheese Coffee", chính là cái tên.
 *
 * NGUYÊN NHÂN GỐC KHÔNG PHẢI Ở MÔ TẢ. `prerender-meta.mjs` đã có sẵn cơ chế
 * chống nội dung mỏng: phụ đề nào trùng với tên dự án thì bỏ, dựng mô tả từ
 * mảng + địa điểm + tháng quay. Nhưng nó so bằng cách này:
 *
 *     phuDe.toLowerCase() !== tenGoc.trim().toLowerCase()
 *
 * Tên đang là "Cheese Coffe" (THIẾU MỘT CHỮ E), phụ đề là "Cheese Coffee".
 * Lệch đúng một ký tự nên phép so kết luận "đây là phụ đề thật", và cái tên
 * lọt thẳng vào thẻ mô tả. Một lỗi chính tả làm hỏng cả cơ chế phòng vệ.
 *
 * Nên sửa CẢ HAI:
 *   1. Tên: "Cheese Coffe" → "Cheese Coffee" (lỗi này khách cũng nhìn thấy)
 *   2. Phụ đề: viết mô tả thật, rút từ chính bài case study đã có trong cơ sở
 *      dữ liệu — không bịa thêm dữ kiện nào.
 *
 * Sửa xong tên thì cơ chế phòng vệ kia cũng hoạt động trở lại: lỡ sau này phụ
 * đề bị xoá, nó sẽ tự dựng mô tả ghép thay vì rơi về cái tên.
 *
 * LƯU Ý: thẻ mô tả được sinh lúc DỰNG giao diện, nên đổi cơ sở dữ liệu thôi
 * chưa đủ — phải dựng lại front-end thì `prerender-meta.mjs` mới đọc số liệu
 * mới. Xem phần cuối file bàn giao.
 *
 *   npx tsx src/scripts/sua-cheese-coffee.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/sua-cheese-coffee.ts         # ghi thật
 */

const CHI_XEM = process.argv.includes("--thu");

const SLUG = "cheese-coffe";
const TEN_MOI = "Cheese Coffee";

/**
 * Rút từ chính bài case study đang có: "campaign chứ không phải một video",
 * "phần lớn khung hình quay tại chỗ, giữ nguyên ánh sáng và chất liệu của
 * quán", "một ly cà phê chỉ đẹp trong vài phút". Không thêm dữ kiện mới.
 */
const PHU_DE_MOI =
  "Bộ hình campaign cho chuỗi Cheese Coffee — quay tại quán, giữ nguyên ánh sáng " +
  "và chất liệu của không gian, với đồ uống lạnh chỉ đẹp trong vài phút.";

await connectDB();

const p = await Project.findOne({ slug: SLUG });
if (!p) throw new Error(`khong tim thay du an co slug "${SLUG}"`);

const dau = CHI_XEM ? "»" : "+";
console.log(`${dau} tên`);
console.log(`     cũ : ${JSON.stringify(p.title)}`);
console.log(`     mới: ${JSON.stringify(TEN_MOI)}`);
console.log(`${dau} phụ đề (thứ đi thẳng vào thẻ mô tả)`);
console.log(`     cũ : ${JSON.stringify(p.subtitle?.vi)}  (${(p.subtitle?.vi ?? "").length} ký tự)`);
console.log(`     mới: ${JSON.stringify(PHU_DE_MOI)}  (${PHU_DE_MOI.length} ký tự)`);

if (!CHI_XEM) {
  p.title = TEN_MOI;
  if (p.subtitle) {
    p.subtitle.vi = PHU_DE_MOI;
    // Tiếng Anh vẫn đang là "Cheese Coffe" — cũng chỉ là cái tên và cũng sai
    // chính tả. Để trống thì lớp hiển thị tự lùi về bản tiếng Việt, còn hơn là
    // giữ một chuỗi vừa sai vừa rỗng nghĩa.
    if ((p.subtitle.en ?? "").trim().toLowerCase().startsWith("cheese coff")) p.subtitle.en = "";
  }
  p.markModified("subtitle");
  await p.save();
}

console.log(`\n${CHI_XEM ? "[CHỈ XEM] " : ""}Xong.`);
await disconnectDB();
