import { Router } from "express";
import { Service, type IService } from "../models/Service.ts";
import { parsePagination, sendError, sendPaginated, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (req, res) => {
  const pagination = parsePagination(req.query as Record<string, unknown>);
  if (!pagination) {
    sendError(res, "Invalid pagination params. page ≥ 1, 1 ≤ limit ≤ 100");
    return;
  }

  const services = await Service.find();
  sendPaginated(res, services, pagination.page, pagination.limit);
});

router.get("/:id", async (req, res) => {
  const service = await Service.findById(req.params.id).populate("projects");
  if (!service) {
    sendError(res, "Service not found", 404);
    return;
  }
  sendSuccess(res, service);
});

/** POST /api/services */
router.post("/", async (req, res) => {
  const body = req.body as Partial<IService>;
  const service = await Service.create(body);
  sendSuccess(res, service, 201);
});

/** PUT /api/services/:id */
router.put("/:id", async (req, res) => {
  const { title, description, thumbnailImage, tag, faqs } = req.body as Record<string, unknown>;
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { title, description, thumbnailImage, tag, faqs },
    { new: true, runValidators: true },
  );
  if (!service) { sendError(res, "Service not found", 404); return; }
  sendSuccess(res, service);
});

/** DELETE /api/services/:id */
router.delete("/:id", async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) { sendError(res, "Service not found", 404); return; }
  sendSuccess(res, { deleted: true });
});

export default router;
