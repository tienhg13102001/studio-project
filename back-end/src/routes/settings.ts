import { Router } from "express";
import { SiteSettings } from "../models/SiteSettings.ts";
import { sendSuccess } from "../lib/response.ts";

const router = Router();

/**
 * Lấy đúng MỘT bản ghi cài đặt, tạo mới nếu bảng còn rỗng.
 *
 * VÌ SAO KHÔNG lọc theo `{ key: "global" }` như trước: bản ghi tạo từ phiên bản
 * code cũ không có trường `key`. Lọc theo key thì không khớp bản ghi đó, mà lại
 * dùng kèm `upsert` nên sinh thẳng ra một bản ghi THỨ HAI — bảng có hai bản,
 * cài đặt cũ biến mất khỏi web mà không báo lỗi gì. Đã tái hiện được bằng kiểm
 * thử trên MongoDB thật.
 *
 * Lấy theo `_id` nhỏ nhất để đọc và ghi luôn trỏ về cùng một bản ghi, kể cả khi
 * trong bảng đang lỡ có nhiều bản.
 */
async function getSingleton() {
  const existing = await SiteSettings.findOne().sort({ _id: 1 });
  if (existing) return existing;
  return SiteSettings.create({ key: "global" });
}

/** GET /api/settings — bản ghi cài đặt chung, tự tạo ở lần đọc đầu tiên. */
router.get("/", async (_req, res, next) => {
  try {
    sendSuccess(res, await getSingleton());
  } catch (e) { next(e); }
});

/** PUT /api/settings — sửa bản ghi cài đặt chung. */
router.put("/", async (req, res, next) => {
  try {
    const { backgroundImage } = req.body as { backgroundImage?: string };

    const settings = await getSingleton();
    if (backgroundImage !== undefined) settings.backgroundImage = backgroundImage;
    await settings.save();

    sendSuccess(res, settings);
  } catch (e) { next(e); }
});

export default router;
