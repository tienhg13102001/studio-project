import { Router, type Request } from "express";
import { createHash } from "crypto";
import { VisitorStat, VisitLog } from "../models/Visitor.ts";
import { sendSuccess } from "../lib/response.ts";

const router = Router();

/** Lấy IP thật của client (ưu tiên header proxy: Cloudflare / nginx). */
function getClientIp(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return cf;

  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0]!.trim();

  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/** Khoá chống trùng: hash(IP) + ngày (UTC) → mỗi khách tính 1 lần/ngày. */
function visitKey(ip: string): string {
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${ipHash}:${day}`;
}

async function getTotal(): Promise<number> {
  const stat = await VisitorStat.findOneAndUpdate(
    { key: "global" },
    {},
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return stat?.total ?? 0;
}

/** GET /api/visitors — trả về tổng số lượt truy cập hiện tại. */
router.get("/", async (_req, res, next) => {
  try {
    sendSuccess(res, { total: await getTotal() });
  } catch (e) { next(e); }
});

/**
 * POST /api/visitors — ghi nhận một lượt truy cập.
 * Chỉ tăng tổng khi (IP-hash + ngày) chưa từng được ghi (khách duy nhất/ngày).
 */
router.post("/", async (req, res, next) => {
  try {
    const key = visitKey(getClientIp(req));

    try {
      await VisitLog.create({ key });
      // Ghi mới thành công → đây là khách chưa được tính hôm nay → +1.
      const stat = await VisitorStat.findOneAndUpdate(
        { key: "global" },
        { $inc: { total: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      return sendSuccess(res, { total: stat?.total ?? 0 });
    } catch (err) {
      // Duplicate key (E11000) → khách đã được tính hôm nay → không tăng.
      if ((err as { code?: number }).code === 11000) {
        return sendSuccess(res, { total: await getTotal() });
      }
      throw err;
    }
  } catch (e) { next(e); }
});

export default router;
