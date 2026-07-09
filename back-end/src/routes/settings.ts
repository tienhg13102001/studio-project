import { Router } from "express";
import { SiteSettings } from "../models/SiteSettings.ts";
import { sendSuccess } from "../lib/response.ts";

const router = Router();

/** GET /api/settings — the singleton global site settings (auto-created on first read) */
router.get("/", async (_req, res, next) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    sendSuccess(res, settings);
  } catch (e) { next(e); }
});

/** PUT /api/settings — update the singleton global site settings (upsert) */
router.put("/", async (req, res, next) => {
  try {
    const { backgroundImage } = req.body as { backgroundImage?: string };

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { ...(backgroundImage !== undefined ? { backgroundImage } : {}) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    sendSuccess(res, settings);
  } catch (e) { next(e); }
});

export default router;
