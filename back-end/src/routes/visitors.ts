import { Router, type Request } from "express";
import { createHash } from "crypto";
import { VisitorStat, VisitLog, VisitorDaily, VisitorAgg } from "../models/Visitor.ts";
import { sendSuccess } from "../lib/response.ts";
import requireAuth from "../middleware/requireAuth.ts";

const router = Router();

/** Lấy IP thật của client (ưu tiên header proxy: Cloudflare / nginx). */
function getClientIp(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return cf;

  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0]!.trim();

  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/** Ngày hiện tại (UTC) dạng YYYY-MM-DD — dùng thống nhất cho mọi bộ đếm. */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Khoá chống trùng: hash(IP) + ngày → mỗi khách tính 1 lần/ngày. */
function visitKey(ip: string, day: string): string {
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  return `${ipHash}:${day}`;
}

/**
 * Phân loại nguồn traffic. `utm_source` (khi gắn tag link marketing) là chuẩn
 * xác nhất nên được ưu tiên; nếu không có thì suy ra từ referrer. Referrer nội
 * bộ (điều hướng trong site) coi như "direct".
 */
function parseSource(referrer?: string, utm?: string): string {
  if (utm && utm.trim()) return utm.trim().toLowerCase().slice(0, 40);
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("beezvn")) return "direct"; // điều hướng nội bộ
    if (/(^|\.)facebook\.|(^|\.)fb\.|fb\.me/.test(host)) return "facebook";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("google")) return "google";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("youtu")) return "youtube";
    if (host.includes("zalo")) return "zalo";
    if (/(^|\.)t\.co$|twitter|x\.com/.test(host)) return "twitter";
    return host.slice(0, 40); // nguồn ngoài khác → giữ hostname
  } catch {
    return "direct";
  }
}

/**
 * Rút gọn địa chỉ trang về một khoá đếm được.
 *
 * VÌ SAO KHÔNG GHI THẲNG ĐỊA CHỈ: bất kỳ ai cũng gọi được vào đây, và mỗi địa
 * chỉ lạ sẽ đẻ ra một bản ghi mới. Gọi một triệu địa chỉ ngẫu nhiên là một triệu
 * bản ghi rác trong cơ sở dữ liệu. Chỉ nhận những dạng địa chỉ web thật sự có,
 * còn lại dồn hết vào một ô "khac" — số lượng khoá vì thế luôn bị chặn trên bởi
 * số dịch vụ + số dự án, không phụ thuộc kẻ gọi.
 *
 * BỎ QUA TRANG NỘI BỘ: /portal, /bao-gia, /hop-dong là công cụ của nhân viên.
 * Đếm chúng vào đây chỉ làm nhiễu số liệu về KHÁCH.
 */
function parsePath(raw?: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/")) return null;

  // Bỏ tham số, bỏ dấu / cuối, hạ chữ thường.
  const p = raw.split("?")[0]!.split("#")[0]!.replace(/\/+$/, "").toLowerCase() || "/";
  if (p.length > 120) return null;

  if (/^\/(portal|bao-gia|hop-dong)(\/|$)/.test(p)) return null; // công cụ nội bộ
  if (["/", "/service", "/portfolio", "/team", "/contact"].includes(p)) return p;

  // Dạng có tham số: giữ nguyên vì số lượng bị chặn bởi dữ liệu thật.
  if (/^\/service\/[a-z0-9][a-z0-9-]{0,80}$/.test(p)) return p;
  if (/^\/du-an\/[a-z0-9][a-z0-9-]{0,80}$/.test(p)) return p;

  return "khac";
}

/** Suy ra loại thiết bị từ User-Agent. */
function parseDevice(ua?: string): string {
  if (!ua) return "unknown";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod/i.test(ua)) return "mobile";
  return "desktop";
}

async function getTotal(): Promise<number> {
  const stat = await VisitorStat.findOneAndUpdate(
    { key: "global" },
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return stat?.total ?? 0;
}

/** Mốc YYYY-MM-DD của `days` ngày trước (bao gồm hôm nay) để lọc theo khoảng. */
function cutoffDay(days: number): string {
  return new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

/** Chuẩn hoá tham số ?days= về [1, 365], mặc định 30. */
function parseDays(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 30;
  return Math.min(Math.max(Math.trunc(n), 1), 365);
}

/** GET /api/visitors — trả về tổng số lượt truy cập hiện tại. */
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    sendSuccess(res, { total: await getTotal() });
  } catch (e) {
    next(e);
  }
});

/** GET /api/visitors/daily?days=30 — lượt truy cập unique theo từng ngày. */
router.get("/daily", requireAuth, async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const rows = await VisitorDaily.find({ day: { $gte: cutoffDay(days) } })
      .sort({ day: 1 })
      .lean();
    sendSuccess(
      res,
      rows.map((r) => ({ day: r.day, count: r.count })),
    );
  } catch (e) {
    next(e);
  }
});

/** GET /api/visitors/breakdown?dim=source&days=30 — phân rã theo nguồn/thiết bị/trang. */
router.get("/breakdown", requireAuth, async (req, res, next) => {
  try {
    const dimHopLe = ["source", "device", "path"];
    const dim = dimHopLe.includes(String(req.query.dim)) ? String(req.query.dim) : "source";
    const days = parseDays(req.query.days);
    const rows = await VisitorAgg.aggregate<{ _id: string; count: number }>([
      { $match: { dim, day: { $gte: cutoffDay(days) } } },
      { $group: { _id: "$key", count: { $sum: "$count" } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    sendSuccess(
      res,
      rows.map((r) => ({ key: r._id, count: r.count })),
    );
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/visitors — ghi nhận một lượt truy cập.
 * Chỉ tăng khi (IP-hash + ngày) chưa từng được ghi (khách duy nhất/ngày). Khi đó
 * cộng dồn thêm: tổng, lượt-theo-ngày, và phân rã theo nguồn + thiết bị.
 */
router.post("/", async (req, res, next) => {
  try {
    const day = todayUTC();
    const key = visitKey(getClientIp(req), day);

    try {
      await VisitLog.create({ key });
      // Ghi mới thành công → khách chưa được tính hôm nay → cộng dồn mọi bộ đếm.
      const stat = await VisitorStat.findOneAndUpdate(
        { key: "global" },
        { $inc: { total: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      const body = (req.body ?? {}) as { referrer?: string; utm?: string };
      const source = parseSource(body.referrer, body.utm);
      const device = parseDevice(req.headers["user-agent"]);

      await Promise.all([
        VisitorDaily.updateOne({ day }, { $inc: { count: 1 } }, { upsert: true }),
        VisitorAgg.updateOne(
          { day, dim: "source", key: source },
          { $inc: { count: 1 } },
          { upsert: true },
        ),
        VisitorAgg.updateOne(
          { day, dim: "device", key: device },
          { $inc: { count: 1 } },
          { upsert: true },
        ),
      ]);

      return sendSuccess(res, { total: stat?.total ?? 0 });
    } catch (err) {
      // Duplicate key (E11000) → khách đã được tính hôm nay → không tăng.
      if ((err as { code?: number }).code === 11000) {
        return sendSuccess(res, { total: await getTotal() });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/visitors/page — ghi nhận một LƯỢT XEM TRANG.
 *
 * VÌ SAO TÁCH HẲN KHỎI `POST /api/visitors`: cái kia đếm KHÁCH DUY NHẤT, mỗi
 * người một lần trong ngày, và nó thoát ra ngay khi thấy trùng. Lượt xem trang
 * thì ngược lại — một khách xem mười trang là mười lượt. Nhét chung vào đó sẽ
 * phá con số khách duy nhất đang chạy đúng bấy lâu nay.
 *
 * ĐÂY LÀ "LƯỢT XEM", KHÔNG PHẢI "KHÁCH". Một người mở đi mở lại một dự án thì
 * tính nhiều lượt. Con số này trả lời câu "trang nào được xem nhiều", không trả
 * lời câu "bao nhiêu người".
 *
 * KHÔNG đụng tới tổng lượt truy cập, lượt-theo-ngày, nguồn hay thiết bị.
 */
router.post("/page", async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as { path?: unknown };
    const path = parsePath(body.path);

    // Địa chỉ không hợp lệ hoặc là trang nội bộ → im lặng bỏ qua. Trả 200 chứ
    // không trả lỗi: đây là việc phụ, không đáng để hiện lỗi lên màn hình khách.
    if (!path) return sendSuccess(res, { recorded: false });

    // Bỏ qua trình thu thập dữ liệu tự động — chúng không phải khách, mà lại là
    // thứ dễ thổi phồng con số nhất.
    const ua = String(req.headers["user-agent"] ?? "");
    if (/bot|crawl|spider|slurp|headless|preview|monitor/i.test(ua)) {
      return sendSuccess(res, { recorded: false });
    }

    await VisitorAgg.updateOne(
      { day: todayUTC(), dim: "path", key: path },
      { $inc: { count: 1 } },
      { upsert: true },
    );
    sendSuccess(res, { recorded: true });
  } catch (e) {
    next(e);
  }
});

export default router;
