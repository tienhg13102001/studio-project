import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";
import { PageContent } from "../models/PageContent.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    let doc = await PageContent.findOne({ pageType: "team" });
    if (!doc) {
      doc = await PageContent.create({ pageType: "team" });
    }
    sendSuccess(res, doc);
  } catch (e) {
    next(e);
  }
});

router.put("/", async (req, res, next) => {
  try {
    const { aboutBadge, aboutHeading, aboutDescription, aboutImage } = req.body as Record<
      string,
      unknown
    >;

    const doc = await PageContent.findOneAndUpdate(
      { pageType: "team" },
      { aboutBadge, aboutHeading, aboutDescription, aboutImage },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    sendSuccess(res, doc);
  } catch (e) {
    next(e);
  }
});

export default router;
