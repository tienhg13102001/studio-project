import { Router } from "express";
import { Landing } from "../models/Landing.ts";
import { sendError, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const landing = await Landing.findOne();
  if (!landing) {
    sendError(res, "Landing content not found", 404);
    return;
  }
  sendSuccess(res, landing);
});

export default router;
