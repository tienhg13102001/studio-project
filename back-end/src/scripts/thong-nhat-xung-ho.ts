/**
 * Thống nhất xưng hô + tên thương hiệu trong chữ của 6 trang dịch vụ.
 * Hoàn chốt 19/08/2026: gọi khách là "bạn", viết tên là "Bee Z", nói "team".
 *
 * VÌ SAO CẦN: chữ trên web đang xưng bốn kiểu — "chúng tôi", "Bee Z", "Studio",
 * "Đội ngũ" — và tệ nhất là 8 câu hỏi gọi CHÍNH BEE Z là "bạn" ("Bạn có cung
 * cấp dịch vụ tạo hình món ăn không?"), trong khi mọi chỗ khác "bạn" là KHÁCH.
 * Đó là "Do you offer...?" dịch thẳng. Đọc xong không biết ai đang nói với ai.
 *
 * CHỈ ĐỔI CÁCH XƯNG VÀ TÊN. Không viết lại câu, không đụng số, không bỏ ý —
 * phần soát lại văn phong là việc khác, Hoàn chưa duyệt.
 *
 * Kèm một lỗi chính tả đang hiện trên web: câu hỏi 1 trang Lookbook mở đầu
 * bằng "tudio" (mất chữ S).
 *
 * Sao lưu trước khi chạy: Marketing/backup/6-dich-vu-truoc-xung-ho.json
 *
 *   npx tsx src/scripts/thong-nhat-xung-ho.ts --thu   # xem trước, không ghi
 *   npx tsx src/scripts/thong-nhat-xung-ho.ts         # ghi thật
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Service } from "../models/Service.ts";

const CHI_XEM = process.argv.includes("--thu");

/** Câu hỏi viết lại — chỉ sửa vai xưng, giữ nguyên nội dung hỏi. */
const CAU_HOI: Record<string, string> = {
  "Bạn có cung cấp dịch vụ tạo hình món ăn không?":
    "Bee Z có làm tạo hình món ăn (food styling) không?",
  "Bạn có thể quay tại nhà hàng của chúng tôi không?":
    "Bee Z có quay ngay tại nhà hàng không?",
  "Các bạn có thiết bị gì đặc biệt để quay đồ ăn không?":
    "Bee Z có thiết bị gì đặc biệt để quay đồ ăn không?",
  "tudio có hỗ trợ lên ý tưởng (concept) và định hướng nghệ thuật (styling) không?":
    "Bee Z có hỗ trợ lên ý tưởng (concept) và định hướng nghệ thuật (styling) không?",
  "Các bạn có kinh nghiệm quay chụp ngoại cảnh phức tạp không?":
    "Bee Z có kinh nghiệm quay chụp ngoại cảnh khó không?",
  "Bạn tạo nội dung cho những nền tảng nào?":
    "Bee Z làm nội dung cho những nền tảng nào?",
  "Mỗi tháng bạn có thể sản xuất bao nhiêu video?":
    "Mỗi tháng Bee Z sản xuất được bao nhiêu video?",
  "Bạn có cung cấp kịch bản và ý tưởng không?":
    "Bee Z có viết kịch bản và lên ý tưởng không?",
  "Ekip có tuân thủ quy định về trang phục của sự kiện không?":
    "Team có tuân thủ quy định về trang phục của sự kiện không?",
  "Studio có cung cấp cả gói chụp ảnh cưới (pre-wedding) và chụp phóng sự ngày cưới không?":
    "Bee Z có cả gói chụp pre-wedding và phóng sự ngày cưới không?",
  // "chúng tôi" ở đây là KHÁCH tự xưng, "các bạn" là Bee Z — ngược hẳn quy ước.
  "Chúng tôi rất ngại ống kính, các bạn sẽ hướng dẫn như thế nào?":
    "Ngại ống kính thì Bee Z hướng dẫn thế nào?",
};

/**
 * Thay trong phần trả lời / mô tả / thẻ điểm mạnh.
 * Mọi "chúng tôi" trong dữ liệu hiện tại đều là Bee Z tự xưng — đã soát tay
 * từng chỗ. Câu duy nhất "chúng tôi" là khách nằm ở CÂU HỎI, xử riêng ở trên.
 */
const THAY: [RegExp, string][] = [
  [/\bChúng tôi\b/g, "Bee Z"],
  [/\bchúng tôi\b/g, "Bee Z"],
  [/\bEkip\b/g, "Team"],
  [/\bekip\b/g, "team"],
  [/\bBeeZ\b/g, "Bee Z"],
  [/\bquý khách\b/g, "bạn"],
  [/\bQuý khách\b/g, "Bạn"],
];

const sua = (s: string): string => THAY.reduce((v, [re, moi]) => v.replace(re, moi), s);

async function chay(): Promise<void> {
  await connectDB();
  const ds = await Service.find({});
  let doi = 0;

  for (const sv of ds) {
    const ghi: string[] = [];

    const capNhatLoi = (o: { vi?: string } | undefined, ten: string): void => {
      if (!o?.vi) return;
      const moi = sua(o.vi);
      if (moi !== o.vi) {
        ghi.push(`      ${ten}`);
        if (!CHI_XEM) o.vi = moi;
        doi++;
      }
    };

    capNhatLoi(sv.description, "mô tả");
    capNhatLoi(sv.heroTagline, "dòng phụ");
    // Nhãn ô số liệu cũng là chữ khách đọc — trang Nội dung ngắn đang ghi
    // "Nhân sự Ekip chuyên môn".
    sv.stats.forEach((x, i) => capNhatLoi(x.label, `ô số ${i + 1} — nhãn`));
    sv.highlights.forEach((h, i) => {
      capNhatLoi(h.title, `thẻ ${i + 1} — tiêu đề`);
      capNhatLoi(h.desc, `thẻ ${i + 1} — nội dung`);
    });
    sv.faqs.forEach((f, i) => {
      const q = f.question?.vi;
      if (q && CAU_HOI[q]) {
        ghi.push(`      câu ${i + 1}: "${q}"\n              -> "${CAU_HOI[q]}"`);
        if (!CHI_XEM) f.question.vi = CAU_HOI[q];
        doi++;
      } else {
        capNhatLoi(f.question, `câu ${i + 1} — câu hỏi`);
      }
      capNhatLoi(f.answer, `câu ${i + 1} — trả lời`);
    });

    if (ghi.length) {
      console.log(`\n${CHI_XEM ? "»" : "+"} ${sv.tag}`);
      ghi.forEach((g) => console.log(g));
      if (!CHI_XEM) {
        sv.markModified("description");
        sv.markModified("heroTagline");
        sv.markModified("highlights");
        sv.markModified("stats");
        sv.markModified("faqs");
        await sv.save();
      }
    }
  }

  console.log(`\n${CHI_XEM ? "[CHI XEM] " : ""}Tong cong ${doi} cho.`);
  await disconnectDB();
}

chay().catch((e: unknown) => {
  console.error("Loi:", e);
  process.exit(1);
});
