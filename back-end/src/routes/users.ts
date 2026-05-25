import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { User } from "../models/User.ts";

const router = Router();

/** GET /api/users — public display data, password excluded */
router.get("/", async (_req, res, next) => {
  try {
    const users = await User.find({ active: true })
      .select("-password")
      .sort({ featured: -1 });
    sendSuccess(res, users);
  } catch (e) {
    next(e);
  }
});

/** POST /api/users — create user */
router.post("/", async (req, res, next) => {
  try {
    const body = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: { en: string; vi: string };
      photo?: string;
      quote?: { en: string; vi: string };
      bio?:   { en: string; vi: string };
      skills?: string[];
      featured?: boolean;
      accountRole?: "admin" | "member" | "editor";
    };

    // ── Explicit required-field check ─────────────────────────────────────────
    const missing: string[] = [];
    if (!body.name)           missing.push("name");
    if (!body.email)          missing.push("email");
    if (!body.password)       missing.push("password");
    if (!body.role?.en || !body.role?.vi) missing.push("role.en / role.vi");
    if (missing.length) {
      sendError(res, `Missing required fields: ${missing.join(", ")}`, 400);
      return;
    }

    const created = await User.create(body);
    const user = await User.findById(created._id).select("-password");
    sendSuccess(res, user, 201);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/users/:id — update user fields (no password) */
router.put("/:id", async (req, res, next) => {
  try {
    const { name, email, role, photo, quote, bio, skills, featured, accountRole } =
      req.body as Record<string, unknown>;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, photo, quote, bio, skills, featured, accountRole },
      { new: true, runValidators: true },
    ).select("-password");
    if (!user) { sendError(res, "User not found", 404); return; }
    sendSuccess(res, user);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/users/:id — remove user */
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { sendError(res, "User not found", 404); return; }
    sendSuccess(res, { id: req.params.id });
  } catch (e) {
    next(e);
  }
});

export default router;
