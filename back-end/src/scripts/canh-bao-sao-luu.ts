import "dotenv/config";
import { sendMail, isMailConfigured, LEAD_NOTIFY_TO, escapeHtml } from "../lib/mailer.ts";

/**
 * Báo động khi bản sao lưu quá cũ hoặc quá nhỏ.
 *
 * VÌ SAO CÓ SCRIPT NÀY: cùng một bài học với chứng chỉ HTTPS hồi 17/08/2026 —
 * cơ chế tự gia hạn chạy đủ mỗi ngày, thất bại mỗi ngày, và KHÔNG BÁO CHO AI,
 * tới đúng ngày hết hạn mới lộ ra với toàn bộ khách hàng.
 *
 * Sao lưu còn nguy hơn thế. Chứng chỉ hỏng thì khách thấy ngay và kêu; sao lưu
 * hỏng thì KHÔNG AI THẤY GÌ CẢ cho tới ngày cần lấy dữ liệu ra — mà đúng ngày
 * đó thì đã muộn. Một việc tự động thất bại trong im lặng thì bằng không có.
 *
 * Ngày 22/08/2026 kiểm máy chủ: `scripts/backup.sh` đã nằm sẵn từ 31/07 nhưng
 * KHÔNG CÓ cron nào gọi nó, và chưa từng chạy lần nào. Thư mục sao lưu rỗng.
 *
 * VÌ SAO NHẬN SỐ LIỆU QUA THAM SỐ chứ không tự đi đọc thư mục: bản sao lưu nằm
 * ở `/var/backups/beezvn` trên MÁY CHỦ, còn script này chạy trong container —
 * nó không nhìn thấy thư mục đó. `scripts/kiem-sao-luu.sh` ở ngoài đo rồi
 * truyền số vào. Không mount thêm thư mục nào vào container để khỏi phải sửa
 * docker-compose của một hệ thống đang chạy.
 *
 * Cách chạy:
 *   docker exec beez-backend npx tsx src/scripts/canh-bao-sao-luu.ts <tuổi-ngày> <số-file> <MB>
 *
 * Xem thử email trông thế nào mà KHÔNG gửi thật:
 *   ... canh-bao-sao-luu.ts 5 0 0 --khong-gui
 *
 * Gửi THẬT một email thử (để chắc đường báo động thông tới hộp thư):
 *   ... canh-bao-sao-luu.ts 5 0 0 --thu
 *
 * VÌ SAO CÓ CỜ `--thu`: ngày 22/08/2026 tao gửi một email thử với số liệu
 * bịa, và Hoàn nhận được thì tưởng sao lưu hỏng thật — vì email thử với
 * email thật trông y hệt nhau. Một hệ thống báo động mà kêu nhầm vài lần là
 * người ta thôi không tin nữa, rồi tới lần kêu thật cũng bỏ qua nốt.
 */

const THAM_SO = process.argv.slice(2);
const KHONG_GUI = THAM_SO.includes("--khong-gui");
/** Gửi thật nhưng đánh dấu rõ là email thử, để không ai tưởng có sự cố. */
const LA_THU = THAM_SO.includes("--thu");
const so = THAM_SO.filter((x) => !x.startsWith("--"));

/** Quá ngần này ngày không có bản mới là hỏng. Sao lưu chạy hằng ngày, cho trượt 1 ngày. */
const NGUONG_NGAY = 2;
/** Bản kết xuất nhỏ hơn mức này gần như chắc chắn là rỗng hoặc dở dang. */
const NGUONG_KB = 10;

const tuoiNgay = Number(so[0]);
const soFile = Number(so[1]);
const dbKB = Number(so[2]);

function than(loi: string[]): string {
  const dauThu = LA_THU
    ? `<p style="background:#fff8e1;border-left:4px solid #f5b800;padding:10px 14px;margin:0 0 14px">
         <b>ĐÂY LÀ EMAIL THỬ.</b> Số liệu bên dưới là số bịa để kiểm xem đường báo
         động có thông không. Sao lưu vẫn đang bình thường — không cần làm gì cả.
       </p>`
    : "";
  return `${dauThu}
    <p><b>Sao lưu beezvn.com đang có vấn đề.</b></p>
    <ul>${loi.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    <p>Số liệu đo được lúc kiểm:</p>
    <ul>
      <li>Bản kết xuất mới nhất: <b>${escapeHtml(String(tuoiNgay))} ngày tuổi</b>, ${escapeHtml(String(dbKB))} KB</li>
      <li>Ảnh và video đã chép: <b>${escapeHtml(String(soFile))} file</b></li>
    </ul>
    <p>Cách xem chuyện gì xảy ra — đăng nhập máy chủ rồi chạy:</p>
    <pre>tail -50 /var/log/beez-sao-luu.log
cd /home/studio-project &amp;&amp; ./scripts/backup.sh --check</pre>
    <p>Hướng dẫn phục hồi: <code>docs/sao-luu.md</code> trong kho mã nguồn.</p>
  `;
}

async function chay(): Promise<void> {
  console.log("── Kiểm bản sao lưu ──────────────────────────────────────");

  if (so.length < 3 || [tuoiNgay, soFile, dbKB].some((n) => !Number.isFinite(n))) {
    console.error("Thiếu tham số. Cần: <tuổi-ngày> <số-file> <MB>");
    process.exit(2);
  }

  const loi: string[] = [];
  if (tuoiNgay < 0) loi.push("KHÔNG TÌM THẤY bản kết xuất cơ sở dữ liệu nào.");
  else if (tuoiNgay > NGUONG_NGAY)
    loi.push(`Bản mới nhất đã ${tuoiNgay} ngày tuổi — sao lưu đáng lẽ chạy mỗi ngày.`);
  if (tuoiNgay >= 0 && dbKB < NGUONG_KB)
    loi.push(`Bản kết xuất chỉ ${dbKB} KB — gần như chắc chắn rỗng hoặc dở dang.`);
  if (soFile <= 0) loi.push("Chưa chép được ảnh/video nào.");

  console.log(`   bản mới nhất: ${tuoiNgay} ngày · ${dbKB} KB · ${soFile} file ảnh/video`);

  if (loi.length === 0) {
    console.log("   mọi thứ bình thường, không gửi email.");
    return;
  }

  loi.forEach((x) => console.log(`   ✗ ${x}`));

  const tieuDe = LA_THU
    ? "[THỬ — không phải sự cố] Sao lưu beezvn.com"
    : "⚠ Sao lưu beezvn.com có vấn đề";
  if (KHONG_GUI) {
    console.log(`   (--khong-gui) tiêu đề: ${tieuDe}`);
    return;
  }
  if (!isMailConfigured() || !LEAD_NOTIFY_TO) {
    console.log("   (chưa cấu hình SMTP hoặc thiếu LEAD_NOTIFY_TO — không gửi được email)");
    return;
  }
  const gui = await sendMail({ to: LEAD_NOTIFY_TO, subject: tieuDe, html: than(loi) });
  console.log(gui ? `   đã gửi email tới ${LEAD_NOTIFY_TO}` : "   GỬI EMAIL THẤT BẠI");
}

chay().catch((e) => {
  console.error(e);
  process.exit(1);
});
