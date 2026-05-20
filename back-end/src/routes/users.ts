import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { User } from "../models/User.ts";

const router = Router();

/** GET /api/users — public display data, password excluded */
router.get("/", async (_req, res) => {
  const users = await User.find({ active: true })
    .select("-password")
    .sort({ featured: -1, order: 1 });
  sendSuccess(res, users);
});

/** PUT /api/users/:id — update user fields (no password) */
router.put("/:id", async (req, res) => {
  const { name, role, photo, quote, bio, skills, order, featured, accountRole } =
    req.body as Record<string, unknown>;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, role, photo, quote, bio, skills, order, featured, accountRole },
    { new: true, runValidators: true },
  ).select("-password");
  if (!user) { sendError(res, "User not found", 404); return; }
  sendSuccess(res, user);
});

export default router;
