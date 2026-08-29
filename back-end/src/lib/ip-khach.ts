import type { Request } from "express";

/**
 * Lấy IP thật của khách.
 *
 * Tách ra khỏi `routes/visitors.ts` vì nay có hai chỗ cần dùng: bộ đếm lượt
 * truy cập, và middleware ghi dấu vết tải trang. Hai chỗ mà tính IP theo hai
 * cách khác nhau thì dấu vết ghi một đằng, tra cứu một nẻo.
 *
 * Ưu tiên header do proxy đặt (Cloudflare rồi nginx), vì nhìn từ backend thì
 * mọi request đều đến từ nginx trong cùng mạng Docker.
 */
export function layIpKhach(req: Request): string {
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return cf;

  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff) return xff.split(",")[0]!.trim();

  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}
