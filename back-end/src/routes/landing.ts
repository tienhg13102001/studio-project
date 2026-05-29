import { Router } from "express";
import { Landing } from "../models/Landing.ts";
import { sendError, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const landing = await Landing.findOne();
    if (!landing) { sendError(res, "Landing content not found", 404); return; }
    sendSuccess(res, landing);
  } catch (e) { next(e); }
});

/** PUT /api/landing — update the single landing document (upsert) */
router.put("/", async (req, res, next) => {
  try {
    const { heroLine1, heroLine2, subheading, videoBackground, phone, email, address, socials } =
      req.body as Record<string, unknown>;
    const landing = await Landing.findOneAndUpdate(
      {},
      { heroLine1, heroLine2, subheading, videoBackground, phone, email, address, socials },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    sendSuccess(res, landing);
  } catch (e) { next(e); }
});

export default router;
