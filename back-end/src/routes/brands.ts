import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";
import { Brand } from "../models/Brand.ts";

const router = Router();

/** GET /api/brands — active brands sorted by order, features populated */
router.get("/", async (_req, res) => {
  const brands = await Brand.find({ active: true })
    .populate("features")
    .sort({ order: 1 });
  sendSuccess(res, brands);
});

export default router;
