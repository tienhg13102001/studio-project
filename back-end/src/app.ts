import cors from "cors";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.ts";
import { sendError } from "./lib/response.ts";
import apiRouter from "./routes/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Sau nginx/Cloudflare → tin proxy để req.ip là IP thật của client.
app.set("trust proxy", true);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
/**
 * CHO PHÉP CẢ `www` LẪN KHÔNG `www` — đây là chỗ đã làm hỏng việc gửi video.
 *
 * Đo ngày 06/10/2026: trang chạy ở `https://www.beezvn.com`, nhưng backend khai
 * `PUBLIC_URL=https://beezvn.com` nên địa chỉ video trả về KHÔNG có `www`. Với
 * trình duyệt, hai tên miền đó là hai nguồn khác nhau; máy chủ lại chỉ gửi
 * `Access-Control-Allow-Origin: https://beezvn.com`, không khớp nguồn đang hỏi.
 *
 * Hậu quả: nginx trả 200 (log ghi 556 lần), còn trình duyệt CHẶN không cho đọc
 * câu trả lời, nên giao diện không bao giờ biết video đã xong và quay vòng mãi.
 * Hoàn tưởng web hỏng, gửi lại file 1 GB thêm nhiều lần.
 *
 * Cho cả hai dạng vào danh sách là hết hẳn lớp lỗi này, không phụ thuộc việc ai
 * đó đặt biến môi trường có `www` hay không.
 */
const nguonChoPhep = (() => {
  const goc = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const ds = new Set([goc]);
  if (goc.includes("://www.")) ds.add(goc.replace("://www.", "://"));
  else ds.add(goc.replace("://", "://www."));
  return [...ds];
})();

app.use(
  cors({
    origin: nguonChoPhep,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/api/public", express.static(join(__dirname, "../public")));

// Dedicated video endpoint: express.static supports HTTP Range natively (seek/scrub),
// and we apply a long immutable cache because filenames are unique (UUID-based).
app.use(
  "/api/videos",
  express.static(join(__dirname, "../public/videos"), {
    maxAge: "30d",
    immutable: true,
    acceptRanges: true,
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    },
  }),
);

// ─── Routes ──────────────────────────────────────────────────────────────────
// Toàn bộ endpoint khai báo trong routes/index.ts và mount chung dưới /api.
app.use("/api", apiRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
