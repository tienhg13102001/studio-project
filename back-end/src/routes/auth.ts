import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { User } from "../models/User.ts";

const router = Router();

/** POST /api/auth/login */
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password?.trim()) {
    sendError(res, "Email and password are required", 400);
    return;
  }

  // Fetch user including the password field (select: false by default)
  const user = await User.findOne({ email: email.toLowerCase().trim(), active: true }).select("+password");

  if (!user) {
    sendError(res, "Invalid credentials", 401);
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    sendError(res, "Invalid credentials", 401);
    return;
  }

  // Return safe public profile (password excluded by toJSON transform)
  sendSuccess(res, {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    accountRole: user.accountRole,
  });
});

export default router;
