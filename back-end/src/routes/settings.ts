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
  // Ưu tiên đúng bản ghi mà máy chủ đang phục vụ hôm nay. Nếu đổi sang "lấy bản
  // cũ nhất" một cách vô điều kiện thì trên một hệ thống đang chạy bình thường,
  // lần triển khai này sẽ âm thầm đổi sang bản ghi khác — cài đặt của khách tự
  // nhiên nhảy sang giá trị lạ. Bản vá không được phép gây ra chuyện đó.
  const keyed = await SiteSettings.findOne({ key: "global" });
  if (keyed) return keyed;

  // Không có bản nào mang key → dữ liệu tạo từ phiên bản code cũ. Nhận nuôi nó
  // thay vì đẻ thêm bản mới, để lần sau đọc/ghi đều trỏ đúng vào đây.
  const legacy = await SiteSettings.findOne().sort({ _id: 1 });
  if (legacy) {
    legacy.key = "global";
    await legacy.save();
    return legacy;
  }

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
