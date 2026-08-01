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

/**
 * Nhận diện người gọi nếu có token hợp lệ, nhưng KHÔNG chặn khi không có.
 *
 * Dùng cho endpoint vừa phục vụ trang công khai vừa phục vụ portal, mà hai bên
 * cần lượng thông tin khác nhau — ví dụ danh sách đội ngũ: khách chỉ cần tên và
 * ảnh, còn portal cần cả email và vai trò tài khoản.
 */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme === "Bearer" && token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
};

export default requireAuth;
