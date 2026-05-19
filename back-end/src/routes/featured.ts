import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";
import { Feature } from "../models/Feature.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const [verticalCards, horizontalCards] = await Promise.all([
    Feature.find({ layout: "vertical" }).sort({ order: 1 }).populate("tag"),
    Feature.find({ layout: "horizontal" }).sort({ order: 1 }).populate("tag"),
  ]);
  sendSuccess(res, { verticalCards, horizontalCards });
});

export default router;
