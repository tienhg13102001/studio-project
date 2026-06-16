import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { PortfolioItem, type IPortfolioItem } from "../models/Portfolio.ts";

const router = Router();

/** GET /api/portfolio — active items sorted by order */
router.get("/", async (_req, res, next) => {
  try {
    const items = await PortfolioItem.find({ active: true }).sort({ order: 1 });
    sendSuccess(res, items);
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
    const item = await PortfolioItem.findByIdAndDelete(req.params.id);
    if (!item) { sendError(res, "Portfolio item not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
