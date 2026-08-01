import { Router } from "express";
import { Service, type IService } from "../models/Service.ts";
import { parsePagination, sendError, sendPaginated, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    if (!pagination) {
      sendError(res, "Invalid pagination params. page ≥ 1, 1 ≤ limit ≤ 100");
      return;
    }
    // Sắp theo thứ tự hiển thị. Trước đây gọi `find()` trần nên ô "thứ tự"
    // trong portal KHÔNG hề có tác dụng — gõ số vào đó bao lâu nay là vô ích,
    // và dữ liệu thật hiện đang có số trùng nhau vì thế.
    // Thêm `_id` làm mốc phụ để hai mục cùng số vẫn ra thứ tự cố định, không
    // đổi ngẫu nhiên giữa các lần tải trang.
    const services = await Service.find().sort({ order: 1, _id: 1 });
    sendPaginated(res, services, pagination.page, pagination.limit);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: "projects",
      populate: { path: "members", select: "name photo" },
    });
    if (!service) { sendError(res, "Service not found", 404); return; }
    sendSuccess(res, service);
  } catch (e) {
    next(e);
  }
});

/** POST /api/services */
router.post("/", async (req, res, next) => {
  try {
    const body = req.body as Partial<IService>;

    // ── Explicit required-field check ─────────────────────────────────────────
    const missing: string[] = [];
    if (!body.tag)                                  missing.push("tag");
    if (!body.thumbnailImage)                       missing.push("thumbnailImage");
    if (!body.title?.en || !body.title?.vi)         missing.push("title.en / title.vi");
    if (!body.description?.en || !body.description?.vi) missing.push("description.en / description.vi");
    if (missing.length) {
      sendError(res, `Missing required fields: ${missing.join(", ")}`, 400);
      return;
    }

    const service = await Service.create(body);
    sendSuccess(res, service, 201);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/services/:id */
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, heroTagline, thumbnailImage, tag, faqs, highlights, stats, order } =
      req.body as Record<string, unknown>;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { title, description, heroTagline, thumbnailImage, tag, faqs, highlights, stats, order },
      { new: true, runValidators: true },
    );
    if (!service) { sendError(res, "Service not found", 404); return; }
    sendSuccess(res, service);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/services/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const service = await Service.softDeleteById(req.params.id);
    if (!service) { sendError(res, "Service not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
