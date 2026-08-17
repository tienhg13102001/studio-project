import "dotenv/config";
import tls from "node:tls";
import { sendMail, isMailConfigured, LEAD_NOTIFY_TO } from "../lib/mailer.ts";

/**
 * Cảnh báo trước khi chứng chỉ HTTPS hết hạn.
 *
 * VÌ SAO CÓ SCRIPT NÀY: ngày 17/08/2026 chứng chỉ hết hạn và cả web hiện màn
 * cảnh báo đỏ cho mọi khách. Cơ chế tự gia hạn đã hỏng suốt 3 tháng trước đó —
 * nó chạy đủ mỗi ngày, thất bại mỗi ngày, và KHÔNG BÁO CHO AI. Chứng chỉ còn hạn
 * nên không có dấu hiệu gì, tới đúng ngày hết hạn mới lộ, và lộ với toàn bộ
 * khách hàng cùng lúc.
 *
 * Sửa cơ chế gia hạn là điều kiện cần. Thứ này là điều kiện đủ: một việc tự động
 * thất bại trong im lặng thì bằng không có.
 *
 * ĐO TỪ NGOÀI VÀO, không đọc file chứng chỉ trên đĩa: thứ đáng quan tâm là
 * chứng chỉ mà KHÁCH thật nhận được. File trên đĩa có thể đã gia hạn xong mà
 * nginx chưa nạp lại — lúc đó đọc file sẽ báo "ổn" trong khi khách vẫn thấy lỗi.
 *
 * Cách chạy (cron mỗi ngày một lần):
 *   docker exec beez-backend npx tsx src/scripts/canh-bao-chung-chi.ts
 *
 * Thử một tên miền khác, KHÔNG gửi email thật:
 *   ... canh-bao-chung-chi.ts expired.badssl.com --khong-gui
 *
 * Xem email ở một mốc cụ thể trông thế nào (không cần chờ tới ngày đó):
 *   ... canh-bao-chung-chi.ts --gia-lap=7 --khong-gui
 */

const THAM_SO = process.argv.slice(2);
/** Chỉ in ra thứ sẽ gửi, không gửi thật — để kiểm mọi nhánh mà không làm ai giật mình. */
const KHONG_GUI = THAM_SO.includes("--khong-gui");
/**
 * Giả lập "còn N ngày" thay vì đọc chứng chỉ thật.
 *
 * CÓ ĐỂ KIỂM ĐƯỢC: chứng chỉ thật còn 89 ngày, nên nhánh cảnh báo theo mốc
 * không có cách nào chạy tới trong lúc kiểm thử. Không có cờ này thì đoạn quan
 * trọng nhất của script là đoạn duy nhất chưa bao giờ được chạy thử.
 */
const GIA_LAP = (() => {
  const t = THAM_SO.find((x) => x.startsWith("--gia-lap="));
  if (!t) return null;
  const n = Number(t.split("=")[1]);
  return Number.isFinite(n) ? n : null;
})();
const TEN_MIEN =
  THAM_SO.find((t) => !t.startsWith("--")) ??
  process.env["CERT_CHECK_HOST"] ??
  "www.beezvn.com";

/**
 * Chỉ báo ở những mốc này, không báo mỗi ngày.
 *
 * Cron chạy hằng ngày; báo mọi ngày dưới 20 thì thành 20 email và người đọc bắt
 * đầu bỏ qua — đúng cách một cảnh báo trở nên vô dụng. Danh sách mốc cho phép
 * làm việc này KHÔNG CẦN LƯU TRẠNG THÁI ở đâu: mỗi ngày chỉ khớp đúng một mốc.
 */
const MOC_BAO = [20, 14, 10, 7, 5, 3, 2, 1, 0];

type KetQua =
  | { ok: true; hetHan: Date; conLai: number }
  | { ok: false; loi: string };

function docChungChi(host: string): Promise<KetQua> {
  return new Promise((resolve) => {
    const s = tls.connect(
      // `rejectUnauthorized: false` là CỐ Ý: chứng chỉ đã hết hạn thì kết nối
      // chặt sẽ bị từ chối ngay, và đó đúng là lúc cần đọc được hạn nhất.
      { host, port: 443, servername: host, rejectUnauthorized: false },
      () => {
        const c = s.getPeerCertificate();
        s.end();
        if (!c?.valid_to) {
          resolve({ ok: false, loi: "kết nối được nhưng không đọc được chứng chỉ" });
          return;
        }
        const hetHan = new Date(c.valid_to);
        const conLai = Math.floor((hetHan.getTime() - Date.now()) / 86_400_000);
        resolve({ ok: true, hetHan, conLai });
      },
    );
    s.setTimeout(20_000, () => {
      s.destroy();
      resolve({ ok: false, loi: "quá 20 giây không kết nối được" });
    });
    s.on("error", (e: NodeJS.ErrnoException) => {
      resolve({ ok: false, loi: e.code ?? e.message });
    });
  });
}

async function bao(tieuDe: string, than: string): Promise<void> {
  console.log(`\n⚠️  ${tieuDe}`);
  if (KHONG_GUI) {
    console.log("   (chế độ thử — KHÔNG gửi email. Nội dung sẽ gửi:)");
    console.log("   " + than.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220));
    return;
  }
  if (!isMailConfigured() || !LEAD_NOTIFY_TO) {
    console.log("   (chưa cấu hình SMTP hoặc thiếu LEAD_NOTIFY_TO — không gửi được email)");
    return;
  }
  const gui = await sendMail({
    to: LEAD_NOTIFY_TO,
    subject: tieuDe,
    html: than,
  });
  console.log(gui ? `   đã gửi email tới ${LEAD_NOTIFY_TO}` : "   GỬI EMAIL THẤT BẠI");
}

async function chay(): Promise<void> {
  console.log(`── Kiểm chứng chỉ HTTPS của ${TEN_MIEN} ──────────────────`);
  const kq: KetQua =
    GIA_LAP === null
      ? await docChungChi(TEN_MIEN)
      : {
          ok: true,
          conLai: GIA_LAP,
          hetHan: new Date(Date.now() + GIA_LAP * 86_400_000),
        };
  if (GIA_LAP !== null) console.log(`   (GIẢ LẬP còn ${GIA_LAP} ngày)`);

  // Không kết nối được cũng là tin đáng báo — có thể web đang sập.
  if (!kq.ok) {
    await bao(
      `[BeeZ] KHÔNG kiểm được chứng chỉ HTTPS của ${TEN_MIEN}`,
      `<p>Không đọc được chứng chỉ của <b>${TEN_MIEN}</b>.</p>
       <p>Lý do: <code>${kq.loi}</code></p>
       <p>Có thể web đang sập, hoặc máy chủ không ra được Internet. Nên kiểm tay ngay.</p>`,
    );
    console.log(`   không kiểm được: ${kq.loi}`);
    return;
  }

  const { hetHan, conLai } = kq;
  console.log(`   hết hạn : ${hetHan.toISOString()}`);
  console.log(`   còn     : ${conLai} ngày`);

  if (conLai < 0) {
    await bao(
      `[BeeZ] 🔴 CHỨNG CHỈ HTTPS ĐÃ HẾT HẠN — khách đang thấy cảnh báo đỏ`,
      `<p>Chứng chỉ của <b>${TEN_MIEN}</b> đã hết hạn ${-conLai} ngày trước
       (${hetHan.toISOString()}).</p>
       <p><b>Mọi khách vào web đều đang gặp màn cảnh báo "Kết nối của bạn không phải
       là kết nối riêng tư".</b> Cần xử lý ngay.</p>
       <p>Cách chữa: SSH vào máy chủ rồi chạy <code>certbot renew</code>.
       Xem thêm <code>Bug/Bug_20260817_0715_ssl-het-han-canh-bao-do.md</code>.</p>`,
    );
    return;
  }

  if (MOC_BAO.includes(conLai)) {
    await bao(
      `[BeeZ] Chứng chỉ HTTPS còn ${conLai} ngày`,
      `<p>Chứng chỉ của <b>${TEN_MIEN}</b> còn <b>${conLai} ngày</b>
       (hết hạn ${hetHan.toISOString()}).</p>
       <p>Bình thường nó tự gia hạn khi còn 30 ngày. Email này nghĩa là
       <b>việc tự gia hạn có thể đã hỏng</b> — nên kiểm:</p>
       <pre>certbot certificates
tail -40 /var/log/letsencrypt/letsencrypt.log</pre>`,
    );
    return;
  }

  console.log("   → chưa tới mốc cần báo, không gửi email.");
}

chay().catch((e: unknown) => {
  console.error("Lỗi khi kiểm chứng chỉ:", e);
  process.exit(1);
});
