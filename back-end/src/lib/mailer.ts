import nodemailer, { type Transporter } from "nodemailer";

/**
 * Gửi email qua SMTP. Toàn bộ cấu hình nằm ở biến môi trường — nếu server chưa
 * khai báo SMTP thì mọi lời gọi `sendMail` chỉ ghi log và trả về false, KHÔNG
 * throw. Nhờ vậy form liên hệ vẫn lưu được lead bình thường ở môi trường chưa
 * cấu hình mail (dev/local) thay vì trả lỗi cho khách.
 */

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

/** Địa chỉ hiện ở ô "From". Mặc định lấy chính tài khoản SMTP. */
const FROM = process.env.MAIL_FROM ?? (USER ? `BeeZ Production <${USER}>` : "");

/** Nơi nhận thông báo có khách mới; nhiều địa chỉ cách nhau bằng dấu phẩy. */
export const LEAD_NOTIFY_TO = process.env.LEAD_NOTIFY_TO ?? USER ?? "";

export const isMailConfigured = (): boolean => Boolean(HOST && USER && PASS && FROM);

let cached: Transporter | null = null;

function transporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  // Tạo một lần rồi tái dùng — nodemailer giữ connection pool bên trong.
  cached ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // Port 465 là SMTPS (TLS ngay từ đầu); 587 dùng STARTTLS nên secure=false.
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
  return cached;
}

/** Chuyển ký tự đặc biệt thành entity để dữ liệu khách nhập không phá HTML mail. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type MailInput = {
  to: string;
  subject: string;
  html: string;
  /** Cho phép bấm "Trả lời" là gửi thẳng cho khách. */
  replyTo?: string;
};

export async function sendMail({ to, subject, html, replyTo }: MailInput): Promise<boolean> {
  const tx = transporter();
  if (!tx || !to) {
    console.warn(`[mailer] Bỏ qua email "${subject}" — chưa cấu hình SMTP hoặc thiếu người nhận.`);
    return false;
  }
  try {
    await tx.sendMail({ from: FROM, to, subject, html, replyTo });
    return true;
  } catch (e) {
    // Không để lỗi mail làm hỏng request nghiệp vụ đang gọi nó.
    console.error("[mailer] Gửi email thất bại:", e);
    return false;
  }
}
