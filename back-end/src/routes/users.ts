import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { User } from "../models/User.ts";
import { optionalAuth } from "../middleware/requireAuth.ts";

const router = Router();

/**
 * Những gì trang Đội ngũ công khai cần hiện — và chỉ ngần này.
 *
 * Trước đây endpoint này trả về cả `email` và `accountRole` cho bất kỳ ai gọi,
 * tức là công bố sẵn địa chỉ email của cả nhóm cùng thông tin ai là quản trị —
 * đúng hai mảnh ghép để nhắm mục tiêu tấn công.
 */
const PUBLIC_FIELDS = "name role photo quote bio skills featured";

/**
 * GET /api/users — danh sách đội ngũ.
 *
 * Khách vãng lai chỉ nhận phần hiện trên trang. Người đã đăng nhập (portal quản
 * lý nhân sự) nhận đầy đủ, trừ mật khẩu.
 */
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const query = User.find({ active: true }).sort({ featured: -1 });
    const users = await (req.user ? query.select("-password") : query.select(PUBLIC_FIELDS));
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

/** PUT /api/users/:id/password — change a user's password
 *  Rules:
 *   - A user may change their own password — must supply the correct currentPassword.
 *   - An admin may change ANY other user's password — no currentPassword needed.
 *
 *  Danh tính người thao tác lấy từ token đăng nhập, KHÔNG lấy từ `actorId` trong
 *  thân request. Chỗ này từng là đường chiếm tài khoản hoàn chỉnh: `GET /api/users`
 *  công khai cả id lẫn `accountRole`, nên bất kỳ ai cũng đọc được id của một quản
 *  trị viên, tự khai `actorId` là id đó, rồi đặt lại mật khẩu của người khác.
 *  Vai trò vẫn tra lại trong cơ sở dữ liệu chứ không tin phần role trong token,
 *  để việc hạ quyền một tài khoản có hiệu lực ngay mà không phải chờ token hết hạn.
 */
router.put("/:id/password", async (req, res, next) => {
  try {
    const { newPassword, currentPassword } = req.body as {
      newPassword?: string;
      currentPassword?: string;
    };

    if (!newPassword || newPassword.length < 6) {
      sendError(res, "New password must be at least 6 characters", 400);
      return;
    }

    // Đã qua lớp khoá chung ở routes/index.ts nên chắc chắn có; kiểm lại cho chắc.
    const actorId = req.user?.sub;
    if (!actorId) {
      sendError(res, "Not authenticated", 401);
      return;
    }

    const isSelf = actorId === req.params.id;

    // Changing someone else's password is admin-only — verified against the DB.
    if (!isSelf) {
      const actor = await User.findById(actorId);
      if (!actor || actor.accountRole !== "admin") {
        sendError(res, "You can only change your own password", 403);
        return;
      }
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) { sendError(res, "User not found", 404); return; }

    // Self-service change always requires confirming the current password.
    if (isSelf) {
      if (!currentPassword) {
        sendError(res, "Current password is required", 400);
        return;
      }
      const valid = await user.comparePassword(currentPassword);
      if (!valid) { sendError(res, "Current password is incorrect", 401); return; }
    }

    user.password = newPassword; // pre-save hook re-hashes
    await user.save();

    sendSuccess(res, { id: user.id });
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
