/**
 * Mở rộng trang "Đồ Ăn & Sản Phẩm" ra cả mỹ phẩm và hàng tiêu dùng.
 * Hoàn 20/08: "dịch vụ chụp đồ ăn tao muốn sửa cả nội dung bên trong để phù hợp
 * cho đồ ăn và các sản phẩm như mỹ phẩm luôn, sửa lại text và các mô tả".
 *
 * Tiêu đề trang đã là "Đồ Ăn & Sản Phẩm" nhưng toàn bộ chữ bên trong vẫn chỉ
 * nói món ăn: mô tả, ba thẻ điểm mạnh, cả bốn câu hỏi. Khách tìm "quay chụp mỹ
 * phẩm" vào đây đọc xong vẫn không biết Bee Z có làm hay không.
 *
 * KHÔNG ĐỔI `slug` (`do-an-thuc-uong-f-b`) và KHÔNG ĐỔI `tag` (`F&B`):
 *   · đổi slug là gãy mọi link đã chia sẻ và mất thứ hạng tìm kiếm của trang;
 *   · `tag` là khoá tra dòng vàng trong H1 (`heroAccentByTag` ở i18n) và là
 *     khoá gắn dự án vào dịch vụ — đổi là dòng H1 lùi về câu chung.
 *
 * KHÔNG ĐỘNG dòng phụ: Hoàn đã bác bản viết lại và yêu cầu giữ nguyên câu cũ.
 * KHÔNG ĐỘNG ô số liệu: Hoàn bảo "để đó đi".
 *
 * NGUỒN CHỮ: dữ kiện đã có sẵn trên chính trang (stylist nội bộ, quay tại quán,
 * một ngày quay / bàn giao 5–7 ngày, máy 4K-6K + macro + đèn công suất lớn).
 * Phần mở sang mỹ phẩm dựa trên đúng bộ thiết bị đó — ống kính macro và đèn
 * công suất lớn dùng cho kết cấu kem, son, chai lọ cũng y như dùng cho món ăn.
 *
 * BỐN CÂU LÀ SUY LUẬN NGHỀ CỦA CLAUDE, KHÔNG PHẢI HOÀN KỂ — đánh dấu [SUY LUẬN]
 * ở dưới. Sai thì Hoàn sửa hoặc bỏ, đừng để nguyên.
 *
 * Sao lưu: Marketing/backup/6-dich-vu-truoc-xung-ho.json
 *
 *   npx tsx src/scripts/mo-rong-do-an-san-pham.ts --thu   # xem trước
 *   npx tsx src/scripts/mo-rong-do-an-san-pham.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";

const CHI_XEM = process.argv.includes("--thu");
const vi = (s: string) => ({ vi: s });

const MO_TA =
  "Bee Z quay chụp đồ ăn, đồ uống, mỹ phẩm và hàng tiêu dùng cho nhà hàng, quán, chuỗi F&B và các thương hiệu bán lẻ. Quay ngay tại quán hoặc tại chỗ của bạn, thiết bị gọn nên không làm gián đoạn khách đang ngồi. Có stylist làm trực tiếp với món ăn hoặc sản phẩm trước mỗi buổi quay. Hầu hết buổi quay gọn trong một ngày, bàn giao sau 5–7 ngày làm việc.";

const DIEM_MANH = [
  {
    icon: "SparkleIcon",
    title: "Stylist làm trực tiếp trên set",
    // [SUY LUẬN] phần "lau, xoay, canh nhãn" là việc ai làm ảnh sản phẩm cũng
    // phải làm, nhưng Hoàn chưa xác nhận đây là cách team đang làm.
    desc: "Món ăn được dựng lại từng đĩa trước khi vào khung. Sản phẩm được lau sạch vân tay, xoay và canh nhãn cho chữ đọc được đúng hướng. Làm ngay tại chỗ, không để dồn sang khâu hậu kỳ.",
  },
  {
    icon: "CameraIcon",
    title: "Ống kính macro và đèn công suất lớn",
    desc: "Máy quay 4K/6K, ống kính macro siêu cận và hệ đèn công suất lớn. Cùng bộ đó lấy được làn khói, giọt nước đọng trên ly, và kết cấu bề mặt của kem hay son — những chi tiết máy phổ thông sẽ trôi mất.",
  },
  {
    icon: "DeviceMobileIcon",
    title: "Một buổi quay, đủ bài đăng nhiều nơi",
    // [SUY LUẬN] "nói từ khâu brief vì nó đổi cỡ khung" là nguyên tắc nghề,
    // đã dùng ở trang TVC và Hoàn duyệt rồi.
    desc: "Cùng một set-up ra được ảnh tĩnh cho menu và trang bán hàng, kèm các bản cắt dọc cho TikTok/Reels. Nói nhu cầu này ngay từ khâu brief, vì nó đổi cách chọn cỡ khung lúc quay.",
  },
];

const CAU_HOI = [
  {
    q: "Ngoài đồ ăn, Bee Z có quay mỹ phẩm và sản phẩm không?",
    // [SUY LUẬN] "quay chung một buổi" là suy ra từ việc cùng thiết bị, cùng
    // studio — Hoàn xác nhận lại xem thực tế có nhận ghép buổi như vậy không.
    a: "Có. Cùng bộ thiết bị và cùng cách làm: ống kính macro cho chi tiết bề mặt, đèn công suất lớn để kiểm soát phản chiếu trên chai lọ và bao bì bóng. Mỹ phẩm, đồ uống đóng chai và hàng tiêu dùng đều quay được, và quay chung một buổi với món ăn nếu bạn cần cả hai.",
  },
  {
    q: "Bee Z có làm tạo hình món ăn và sản phẩm không?",
    a: "Có. Bee Z có stylist nội bộ làm trực tiếp với món ăn hoặc sản phẩm của bạn trước mỗi buổi quay, chứ không chỉ bấm máy thứ bạn mang tới.",
  },
  {
    q: "Bee Z có quay tại nhà hàng hoặc tại chỗ của bạn không?",
    a: "Được. Bee Z mang theo bộ thiết bị gọn, dựng nhanh và không chiếm chỗ, nên quán vẫn đón khách bình thường trong lúc quay. Sản phẩm thì quay tại kho, showroom hay văn phòng của bạn đều được.",
  },
  {
    q: "Một buổi quay thông thường mất bao lâu?",
    a: "Hầu hết buổi quay gọn trong một ngày, bàn giao trong 5–7 ngày làm việc. Số món hoặc số sản phẩm càng nhiều thì càng nên chốt danh sách sớm, vì mỗi thứ vào khung là một lần dựng lại ánh sáng.",
  },
  {
    q: "Bee Z dùng thiết bị gì để quay đồ ăn và sản phẩm?",
    a: "Máy quay 4K/6K chuyên dụng, ống kính macro siêu cận và đèn công suất lớn. Dải sáng và độ nét đó là thứ quyết định có thấy được làn khói, giọt nước, hay kết cấu bề mặt của sản phẩm hay không.",
  },
];

async function chay(): Promise<void> {
  await connectDB();
  const sv = await Service.findOne({ tag: "F&B" });
  if (!sv) throw new Error("Khong thay dich vu tag=F&B");

  const dau = CHI_XEM ? "»" : "+";
  console.log(`${dau} tieu de   : "${sv.title.vi}" (GIU NGUYEN)`);
  console.log(`${dau} slug      : ${sv.slug} (GIU NGUYEN)`);
  console.log(`${dau} dong phu  : GIU NGUYEN theo yeu cau cua Hoan`);
  console.log(`${dau} o so lieu : GIU NGUYEN theo yeu cau cua Hoan`);
  console.log(`${dau} mo ta     : ${sv.description.vi?.length} -> ${MO_TA.length} ky tu`);
  console.log(`${dau} diem manh : ${sv.highlights.length} -> ${DIEM_MANH.length}`);
  console.log(`${dau} cau hoi   : ${sv.faqs.length} -> ${CAU_HOI.length}`);

  if (!CHI_XEM) {
    sv.description.vi = MO_TA;
    sv.highlights = DIEM_MANH.map((h) => ({
      icon: h.icon,
      title: vi(h.title),
      desc: vi(h.desc),
    })) as never;
    sv.faqs = CAU_HOI.map((c) => ({ question: vi(c.q), answer: vi(c.a) })) as never;
    sv.markModified("description");
    sv.markModified("highlights");
    sv.markModified("faqs");
    await sv.save();
  }

  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Xong.`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
