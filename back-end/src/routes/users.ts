import { Router } from "express";
import { sendSuccess } from "../lib/response.ts";
import { User } from "../models/User.ts";

const router = Router();

/** GET /api/users — public display data, password excluded */
router.get("/", async (_req, res) => {
  const users = await User.find({ active: true })
    .select("-password")
    .sort({ featured: -1, order: 1 });
  sendSuccess(res, users);
});

export default router;
