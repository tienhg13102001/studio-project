/**
 * test-mail.ts
 *
 * Kiểm tra cấu hình SMTP mà không cần gửi form thật: script in ra biến nào còn
 * thiếu rồi gửi một email thử. Dùng ngay sau khi điền SMTP_* vào .env để biết
 * chắc email có chạy, thay vì ngồi đoán.
 *
 * Cách dùng (chạy trong thư mục back-end, nơi có .env):
 *   yarn test-mail                    # gửi tới LEAD_NOTIFY_TO
 *   yarn test-mail ai-do@gmail.com    # gửi tới địa chỉ chỉ định
 */
import "dotenv/config";
import { sendMail, isMailConfigured, LEAD_NOTIFY_TO } from "../lib/mailer.ts";

const REQUIRED = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

function main(): Promise<void> {
  console.log("── Kiểm tra cấu hình email ─────────────────────────────");
  for (const key of REQUIRED) {
    const val = process.env[key];
    // Không in mật khẩu ra terminal/log.
    const shown = !val ? "(chưa có)" : key === "SMTP_PASS" ? "•".repeat(8) : val;
    console.log(`  ${val ? "✓" : "✗"} ${key.padEnd(10)} ${shown}`);
  }
  console.log(
    `  ${process.env.MAIL_FROM ? "✓" : "·"} MAIL_FROM  ${process.env.MAIL_FROM ?? "(mặc định = SMTP_USER)"}`,
  );
  console.log(`  ${LEAD_NOTIFY_TO ? "✓" : "✗"} LEAD_NOTIFY_TO ${LEAD_NOTIFY_TO || "(chưa có)"}`);
  console.log("");

  if (!isMailConfigured()) {
    console.error("✗ Thiếu cấu hình SMTP — xem .env.example rồi điền vào .env.");
    process.exit(1);
  }

  const to = process.argv[2] ?? LEAD_NOTIFY_TO;
  if (!to) {
    console.error("✗ Không biết gửi cho ai: truyền email làm tham số hoặc đặt LEAD_NOTIFY_TO.");
    process.exit(1);
  }

  console.log(`Đang gửi email thử tới: ${to} …`);
  return sendMail({
    to,
    subject: "[BeeZ] Email thử — cấu hình SMTP hoạt động",
    html: `
      <div style="font:15px/1.7 Arial,sans-serif;color:#222">
        <p>Nếu bạn đọc được email này thì cấu hình SMTP của website <b>beezvn.com</b> đã hoạt động.</p>
        <p>Từ giờ mỗi khi có khách gửi form liên hệ, email thông báo sẽ tới địa chỉ này,
        và khách sẽ nhận được email cảm ơn tự động.</p>
        <p style="color:#888;font-size:13px">— Gửi bởi script test-mail</p>
      </div>
    `,
  }).then((ok) => {
    if (ok) {
      console.log("✓ Đã gửi. Kiểm tra hộp thư (nhớ xem cả mục Spam lần đầu).");
    } else {
      console.error("✗ Gửi thất bại — xem log lỗi phía trên.");
      process.exit(1);
    }
  });
}

main().catch((e: unknown) => {
  console.error("✗ Lỗi không mong đợi:", e);
  process.exit(1);
});
