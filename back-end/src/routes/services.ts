import { Router } from "express";
import { Service } from "../models/Service.ts";
import { parsePagination, sendError, sendPaginated, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (req, res) => {
  const pagination = parsePagination(req.query as Record<string, unknown>);
  if (!pagination) {
    sendError(res, "Invalid pagination params. page ≥ 1, 1 ≤ limit ≤ 100");
    return;
  }

  const services = await Service.find().sort({ order: 1 });
  sendPaginated(res, services, pagination.page, pagination.limit);
});

router.get("/:id", async (req, res) => {
  const service = await Service.findById(req.params.id).populate("features");
  if (!service) {
    sendError(res, "Service not found", 404);
    return;
  }
  sendSuccess(res, service);
});

/** PUT /api/services/:id */
router.put("/:id", async (req, res) => {
  const { title, description, iconName, image, tag, order } = req.body as Record<string, unknown>;
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { title, description, iconName, image, tag, order },
    { new: true, runValidators: true },
  );
  if (!service) { sendError(res, "Service not found", 404); return; }
  sendSuccess(res, service);
});

export default router;
