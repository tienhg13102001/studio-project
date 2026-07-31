import { Router } from "express";
import { Contact } from "../models/Contact.ts";
import { Customer } from "../models/Customer.ts";
import { Service } from "../models/Service.ts";
import { sendError, sendSuccess } from "../lib/response.ts";
import { sendMail, escapeHtml, isMailConfigured, LEAD_NOTIFY_TO } from "../lib/mailer.ts";
import { checkSpam } from "../lib/spamGuard.ts";

const router = Router();

type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  serviceName?: string;
  message: string;
};

/**
 * Gửi 2 email khi có khách mới: báo cho Bee Z (để không bỏ sót lead) và một thư
 * cảm ơn cho khách (để họ biết yêu cầu đã tới). Chạy sau khi đã phản hồi request
 * nên khách không phải chờ SMTP, và mọi lỗi mail chỉ ghi log.
 */
async function notifyNewLead(lead: LeadInput): Promise<void> {
  if (!isMailConfigured()) return;

  const at = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#666">${label}</td><td style="padding:6px 0"><b>${escapeHtml(value)}</b></td></tr>`;

  await Promise.all([
    sendMail({
      to: LEAD_NOTIFY_TO,
      replyTo: lead.email,
      subject: `[Lead mới] ${lead.name}${lead.serviceName ? ` — ${lead.serviceName}` : ""}`,
      html: `
        <h2 style="margin:0 0 12px">Có khách mới gửi yêu cầu</h2>
        <table style="border-collapse:collapse;font:14px/1.6 Arial,sans-serif">
          ${row("Tên", lead.name)}
          ${row("Email", lead.email)}
          ${lead.phone ? row("Điện thoại", lead.phone) : ""}
          ${lead.serviceName ? row("Dịch vụ", lead.serviceName) : ""}
          ${row("Thời gian", at)}
        </table>
        <p style="font:14px/1.6 Arial,sans-serif;margin:16px 0 6px;color:#666">Nội dung:</p>
        <div style="font:14px/1.6 Arial,sans-serif;white-space:pre-wrap;border-left:3px solid #f0c034;padding:8px 12px;background:#fafafa">${escapeHtml(lead.message)}</div>
        <p style="font:13px/1.6 Arial,sans-serif;color:#888;margin-top:18px">Bấm "Trả lời" để phản hồi trực tiếp cho khách.</p>
      `,
    }),
    sendMail({
      to: lead.email,
      subject: "Bee Z Production đã nhận được yêu cầu của bạn",
      html: `
        <div style="font:15px/1.7 Arial,sans-serif;color:#222">
          <p>Xin chào <b>${escapeHtml(lead.name)}</b>,</p>
          <p>Cảm ơn bạn đã liên hệ <b>Bee Z Production</b>. Chúng tôi đã nhận được yêu cầu của bạn
          và sẽ phản hồi trong <b>vòng 24 giờ làm việc</b>.</p>
          <p style="margin:16px 0 6px;color:#666">Nội dung bạn đã gửi:</p>
          <div style="white-space:pre-wrap;border-left:3px solid #f0c034;padding:8px 12px;background:#fafafa">${escapeHtml(lead.message)}</div>
          <p style="margin-top:18px">Nếu cần gấp, bạn có thể trả lời email này hoặc gọi trực tiếp cho chúng tôi.</p>
          <p style="color:#888;font-size:13px">— Bee Z Production</p>
        </div>
      `,
    }),
  ]);
}

router.get("/", async (_req, res, next) => {
  try {
    const contact = await Contact.findOne();
    if (!contact) { sendError(res, "Contact content not found", 404); return; }
    sendSuccess(res, contact);
  } catch (e) { next(e); }
});

/**
 * GET /api/contact/inquiries — list contact-form submissions, newest first.
 * The stored `service` is a Service id; resolve it to a readable name so the
 * portal can show "Video Production" instead of an opaque ObjectId.
 */
router.get("/inquiries", async (_req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const services = await Service.find().select("title");
    const nameById = new Map(services.map((s) => [s.id as string, s.title?.en ?? ""]));

    const inquiries = customers.map((c) => ({
      ...c.toJSON(),
      serviceName: c.service ? (nameById.get(c.service) ?? "") : "",
    }));
    sendSuccess(res, inquiries);
  } catch (e) { next(e); }
});

/** DELETE /api/contact/inquiries/:id — remove one submission. */
router.delete("/inquiries/:id", async (req, res, next) => {
  try {
    const deleted = await Customer.softDeleteById(req.params.id);
    if (!deleted) { sendError(res, "Inquiry not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) { next(e); }
});

/** "hoang@beezvn.com" → "ho***@beezvn.com" — đủ để nhận ra, không lộ cả địa chỉ. */
function maskEmail(email: string | undefined): string {
  const at = (email ?? "").indexOf("@");
  if (at < 1) return "(không có email)";
  return `${email!.slice(0, Math.min(2, at))}***${email!.slice(at)}`;
}

/** Lấy địa chỉ mạng thật của khách (đứng sau Cloudflare/nginx). */
function clientIp(req: { headers: Record<string, unknown>; ip?: string }): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return cf;
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0]!.trim();
  return req.ip ?? "unknown";
}

router.post("/inquiry", async (req, res, next) => {
  try {
    const { name, email, phone, service, message, website } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      sendError(res, "name, email and message are required", 422);
      return;
    }

    // Chặn máy gửi tự động TRƯỚC khi lưu và trước khi gửi email. Không làm bước
    // này thì mỗi lượt spam kích hoạt 2 email, lâu dài khiến tên miền bị chấm
    // điểm xấu và thư gửi khách thật rơi vào hộp thư rác.
    const verdict = checkSpam(clientIp(req), { name, email, phone, message, website });
    if (verdict.blocked) {
      // Ghi kèm dấu vết đã che bớt: chặn nhầm một khách thật thì đây là đường
      // duy nhất để nhận ra và liên hệ lại. Không ghi nguyên email vào log.
      console.warn(
        `[contact] Bỏ qua một lượt gửi nghi máy tự động: ${verdict.reason} — ${maskEmail(email)}`,
      );
      // CỐ Ý trả về như thành công: báo lỗi thẳng thì bot biết đường lách, còn
      // khách thật thì không bao giờ rơi vào nhánh này.
      sendSuccess(res, { id: null }, 201);
      return;
    }

    const customer = await Customer.create({ name, email, phone, service, message });
    sendSuccess(res, { id: customer.id }, 201);

    // Tên dịch vụ chỉ để cho dễ đọc trong email — thiếu thì vẫn gửi bình thường.
    let serviceName = "";
    if (service) {
      const found = await Service.findById(service).select("title").catch(() => null);
      serviceName = found?.title?.en ?? "";
    }
    void notifyNewLead({ name, email, phone, serviceName, message }).catch((e: unknown) =>
      console.error("[contact] Không gửi được email thông báo lead:", e),
    );
  } catch (e) { next(e); }
});

export default router;
