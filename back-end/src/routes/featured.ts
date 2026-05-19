import { Router } from "express";
import { Feature } from "../models/Feature.ts";
import { sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const [topCards, bottomCards] = await Promise.all([
    Feature.find({ section: "top" }).sort({ order: 1 }).populate("tag"),
    Feature.find({ section: "bottom" }).sort({ order: 1 }).populate("tag"),
  ]);
  sendSuccess(res, { topCards, bottomCards });
});

export default router;
