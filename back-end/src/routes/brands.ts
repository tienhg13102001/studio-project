import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Brand } from "../models/Brand.ts";

const router = Router();

/** GET /api/brands — active brands sorted by order, projects populated */
router.get("/", async (_req, res, next) => {
  try {
    const brands = await Brand.find({ active: true })
      .populate("projects")
      .sort({ order: 1 });
    sendSuccess(res, brands);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/brands/:id */
router.put("/:id", async (req, res, next) => {
  try {
    const { name, logo, order } = req.body as Record<string, unknown>;
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, logo, order },
      { new: true, runValidators: true },
    );
    if (!brand) { sendError(res, "Brand not found", 404); return; }
    sendSuccess(res, brand);
  } catch (e) {
    next(e);
  }
});

export default router;
