import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Brand } from "../models/Brand.ts";

const router = Router();

/** GET /api/brands — active brands sorted by order, features populated */
router.get("/", async (_req, res) => {
  const brands = await Brand.find({ active: true })
    .populate("features")
    .sort({ order: 1 });
  sendSuccess(res, brands);
});

/** PUT /api/brands/:id */
router.put("/:id", async (req, res) => {
  const { name, logo, order } = req.body as Record<string, unknown>;
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { name, logo, order },
    { new: true, runValidators: true },
  );
  if (!brand) { sendError(res, "Brand not found", 404); return; }
  sendSuccess(res, brand);
});

export default router;
