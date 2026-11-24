import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { PortfolioItem, type IPortfolioItem } from "../models/Portfolio.ts";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const THU_MUC_ANH = join(dirname(fileURLToPath(import.meta.url)), "../../public/uploads");

const router = Router();

/** GET /api/portfolio — active items sorted by order */
/**
 * Kích thước ảnh hồ sơ năng lực, gửi kèm cho giao diện (24/11/2026, mục N4).
 *
 * VÌ SAO: dải slide giữ chiều cao cố định, bề ngang theo tỉ lệ ảnh (9 trang
 * chênh nhau 0,73–1,49). Không biết trước tỉ lệ thì slide nở ngang khi ảnh về,
 * đẩy cả dải — Lighthouse đo Portfolio giật bố cục ~0,19 (ngưỡng tốt 0,1). Biết
 * trước thì giao diện giữ đúng chỗ từ đầu.
 *
 * Chỉ đọc phần đầu tệp (sharp.metadata), nhớ lại theo tên tệp — tên ảnh tải lên
 * luôn mới nên kích thước không bao giờ đổi. KHÔNG ghi gì vào cơ sở dữ liệu.
 * Đọc hỏng (ảnh ngoài, tệp mất) thì bỏ qua: giao diện lùi về cách cũ.
 */
const kichThuocDaDoc = new Map<string, { w: number; h: number } | null>();
async function kichThuoc(url: string): Promise<{ w: number; h: number } | null> {
  const ten = url.match(/\/uploads\/([^/?#]+)$/)?.[1];
  if (!ten) return null;
  if (kichThuocDaDoc.has(ten)) return kichThuocDaDoc.get(ten)!;
  let kq: { w: number; h: number } | null = null;
  try {
    const m = await sharp(join(THU_MUC_ANH, basename(ten))).metadata();
    if (m.width && m.height) kq = { w: m.width, h: m.height };
  } catch {
    kq = null;
  }
  kichThuocDaDoc.set(ten, kq);
  return kq;
}

router.get("/", async (_req, res, next) => {
  try {
    const items = await PortfolioItem.find({ active: true }).sort({ order: 1 });
    const coKichThuoc = await Promise.all(
      items.map(async (it) => {
        const json = it.toJSON() as unknown as Record<string, unknown>;
        const kt = await kichThuoc(String(json.image ?? ""));
        return kt ? { ...json, rong: kt.w, cao: kt.h } : json;
      }),
    );
    sendSuccess(res, coKichThuoc);
  } catch (e) {
    next(e);
  }
});

/** POST /api/portfolio — create an item */
router.post("/", async (req, res, next) => {
  try {
    const { image, title, order } = req.body as Partial<IPortfolioItem>;

    if (!image) {
      sendError(res, "Missing required fields: image", 400);
      return;
    }

    const item = await PortfolioItem.create({ image, title, order });
    sendSuccess(res, item, 201);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/portfolio/:id */
router.put("/:id", async (req, res, next) => {
  try {
    const { image, title, order } = req.body as Record<string, unknown>;
    const item = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      { image, title, order },
      { new: true, runValidators: true },
    );
    if (!item) { sendError(res, "Portfolio item not found", 404); return; }
    sendSuccess(res, item);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/portfolio/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await PortfolioItem.softDeleteById(req.params.id);
    if (!item) { sendError(res, "Portfolio item not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
