import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { User } from "../models/User.ts";

const router = Router();

/** GET /api/users — public display data, password excluded */
router.get("/", async (_req, res) => {
  const users = await User.find({ active: true })
    .select("-password")
    .sort({ featured: -1 });
  sendSuccess(res, users);
});

/** POST /api/users — create user */
router.post("/", async (req, res) => {
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
  if (!body.name || !body.email || !body.password || !body.role) {
    sendError(res, "name, email, password and role are required", 400);
    return;
  }
  try {
    const created = await User.create(body);
    const user = await User.findById(created._id).select("-password");
    sendSuccess(res, user, 201);
  } catch (e) {
    const msg = (e as Error).message;
    const code = msg.includes("duplicate") || msg.includes("E11000") ? 409 : 400;
    sendError(res, msg, code);
  }
});

/** PUT /api/users/:id — update user fields (no password) */
router.put("/:id", async (req, res) => {
  const { name, email, role, photo, quote, bio, skills, featured, accountRole } =
    req.body as Record<string, unknown>;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, photo, quote, bio, skills, featured, accountRole },
    { new: true, runValidators: true },
  ).select("-password");
  if (!user) { sendError(res, "User not found", 404); return; }
  sendSuccess(res, user);
});

/** DELETE /api/users/:id — remove user */
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { sendError(res, "User not found", 404); return; }
  sendSuccess(res, { id: req.params.id });
});

export default router;
