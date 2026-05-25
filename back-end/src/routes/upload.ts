import { Router } from "express";
import multer from "multer";
import { join, extname, basename, dirname } from "path";
import { fileURLToPath } from "url";
import { sendSuccess, sendError } from "../lib/response.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Image upload (existing, kept for backwards compatibility) ───────────────
/** Tạo tên file dạng: <tên-gốc>-<YYYYMMDD_HHmmss>.<ext> */
function buildFilename(originalname: string): string {
  const ext = extname(originalname).toLowerCase();
  const nameWithoutExt = basename(originalname, extname(originalname));
  // Sanitize: chuyển space thành dấu gạch, xóa ký tự đặc biệt
  const safeName = nameWithoutExt
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_.\u00C0-\u024F\u1E00-\u1EFF]/g, "");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("");
  const timePart = [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  return `${safeName}-${datePart}_${timePart}${ext}`;
}

const imageStorage = multer.diskStorage({
  destination: join(__dirname, "../../public/uploads"),
  filename: (_req, file, cb) => {
    cb(null, buildFilename(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(null, false);
  },
});

// ─── Video upload ────────────────────────────────────────────────────────────
const ALLOWED_VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);
const VIDEO_MAX_BYTES = 500 * 1024 * 1024; // 500 MB

const videoStorage = multer.diskStorage({
  destination: join(__dirname, "../../public/videos"),
  filename: (_req, file, cb) => {
    cb(null, buildFilename(file.originalname));
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: VIDEO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ALLOWED_VIDEO_EXT.has(ext) && ALLOWED_VIDEO_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const router = Router();

/** POST /api/upload — upload a single image, returns { path: "/uploads/…" } */
router.post("/", imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    sendError(res, "No image file received", 400);
    return;
  }
  sendSuccess(res, { path: `/uploads/${req.file.filename}` });
});

/** POST /api/upload/video — upload a single video (≤ 500MB), returns { path: "/videos/…" } */
router.post("/video", videoUpload.single("video"), (req, res) => {
  if (!req.file) {
    sendError(
      res,
      "No video file received (allowed: mp4, webm, mov, m4v; max 500MB)",
      400,
    );
    return;
  }
  sendSuccess(res, {
    path: `/videos/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

export default router;
