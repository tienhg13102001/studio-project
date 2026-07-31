import jwt from "jsonwebtoken";

/**
 * Ký và kiểm token đăng nhập cho portal.
 *
 * Secret bắt buộc phải có trong biến môi trường: thiếu thì dừng hẳn lúc khởi
 * động, thay vì âm thầm ký bằng một khoá mặc định — khoá mặc định nằm trong mã
 * nguồn nghĩa là bất kỳ ai đọc được repo cũng tự phát được token admin.
 */
const rawSecret = process.env.JWT_SECRET;

if (!rawSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const SECRET = rawSecret;

/** Mặc định 7 ngày — đủ dài để không phải đăng nhập lại mỗi ngày. */
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

export type AccountRole = "admin" | "member" | "editor";

export type AuthPayload = {
  /** User id. Dùng tên `sub` theo chuẩn JWT. */
  sub: string;
  email: string;
  accountRole: AccountRole;
};

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/** Trả payload nếu token hợp lệ; null nếu sai chữ ký, hết hạn hoặc hỏng định dạng. */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
