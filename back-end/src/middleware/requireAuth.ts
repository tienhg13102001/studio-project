import type { RequestHandler } from "express";
import { verifyToken, type AuthPayload } from "../lib/jwt.ts";
import { sendError } from "../lib/response.ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Người dùng đã xác thực. Chỉ có mặt trong handler nằm sau requireAuth. */
      user?: AuthPayload;
    }
  }
}

/**
 * Chặn mọi request không kèm token hợp lệ.
 *
 * Đọc header `Authorization: Bearer <token>`, xác thực chữ ký rồi gắn `req.user`
 * để handler phía sau biết ai đang gọi. Trả 401 cho cả trường hợp thiếu token
 * lẫn token sai/hết hạn — client chỉ cần xử lý một mã lỗi là đủ.
 */
const requireAuth: RequestHandler = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");

  if (scheme !== "Bearer" || !token) {
    sendError(res, "Authentication required", 401);
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    sendError(res, "Invalid or expired session", 401);
    return;
  }

  req.user = payload;
  next();
};

export default requireAuth;
