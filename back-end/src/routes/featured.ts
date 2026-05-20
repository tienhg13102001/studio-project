import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Feature } from "../models/Feature.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const [verticalCards, horizontalCards] = await Promise.all([
    Feature.find({ layout: "vertical" }).sort({ order: 1 }).populate("tag"),
    Feature.find({ layout: "horizontal" }).sort({ order: 1 }).populate("tag"),
  ]);
  sendSuccess(res, { verticalCards, horizontalCards });
});

/** PUT /api/featured/:id */
router.put("/:id", async (req, res) => {
  const { title, subtitle, image, layout, order, prominent, tag } = req.body as Record<string, unknown>;
  const feature = await Feature.findByIdAndUpdate(
    req.params.id,
    { title, subtitle, image, layout, order, prominent, tag },
    { new: true, runValidators: true },
  ).populate("tag");
  if (!feature) { sendError(res, "Feature not found", 404); return; }
  sendSuccess(res, feature);
});

export default router;
