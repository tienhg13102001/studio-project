import { Router, type Request } from "express";
import multer from "multer";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { mkdir, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join, extname, basename, dirname } from "path";
import { fileURLToPath } from "url";
import { sendSuccess, sendError } from "../lib/response.ts";

// ─── Image optimization config ───────────────────────────────────────────────
/** Max width/height (px). Uploaded images are downscaled to fit inside this box. */
const IMAGE_MAX_DIM = 1920;
/** WebP quality (0-100). 80 is visually lossless for photos at a fraction of the size. */
const IMAGE_QUALITY = 50;

/**
 * Resolve the public base URL for uploaded assets.
 * Priority: PUBLIC_URL env → inferred from request protocol+host.
 */
function getBaseUrl(req: Request): string {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
  return `${proto}://${req.headers.host}`;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Image upload (existing, kept for backwards compatibility) ───────────────
/** Tạo tên file dạng: <tên-gốc>-<YYYYMMDD_HHmmss>.<ext>. Truyền `forceExt` để ép đuôi (vd ".webp"). */
function buildFilename(originalname: string, forceExt?: string): string {
  const ext = forceExt ?? extname(originalname).toLowerCase();
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

const UPLOAD_DIR = join(__dirname, "../../public/uploads");

// Images are kept in memory so sharp can resize/compress before writing to disk.
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB original (output is compressed)
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

const VIDEO_DIR = join(__dirname, "../../public/videos");
/** Chiều rộng tối đa của video output (px). Video nhỏ hơn KHÔNG bị phóng to. */
const VIDEO_MAX_WIDTH = 1080;
/** VP9 CRF (0-63): thấp = nét hơn + nặng hơn. ~33 cân bằng tốt cho web. */
const VIDEO_CRF = 33;

/**
 * Transcode bất kỳ video input nào sang WebM (VP9 + Opus),
 * scale chiều rộng tối đa VIDEO_MAX_WIDTH, giữ tỉ lệ, chiều cao auto (chia hết 2).
 */
function transcodeToWebm(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec("libvpx-vp9")
      .audioCodec("libopus")
      .outputOptions([
        // chỉ thu nhỏ khi iw > max; height -2 = auto theo tỉ lệ, chia hết cho 2
        "-vf",
        `scale='min(${VIDEO_MAX_WIDTH},iw)':-2`,
        "-crf",
        String(VIDEO_CRF),
        "-b:v",
        "0",
        "-row-mt",
        "1",
        "-deadline",
        "good",
        "-cpu-used",
        "2",
      ])
      .format("webm")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(output);
  });
}

// File gốc được lưu tạm ở thư mục temp, transcode xong sẽ xóa.
const videoStorage = multer.diskStorage({
  destination: tmpdir(),
  filename: (_req, file, cb) => {
    cb(null, `raw-${buildFilename(file.originalname)}`);
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

/** POST /api/upload — resize + compress to WebP, returns { url: "https://…/api/public/uploads/…" } */
router.post("/", imageUpload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      sendError(res, "No image file received", 400);
      return;
    }
    const filename = buildFilename(req.file.originalname, ".webp");
    await mkdir(UPLOAD_DIR, { recursive: true });
    await sharp(req.file.buffer)
      .rotate() // bake EXIF orientation so the image isn't sideways
      .resize({
        width: IMAGE_MAX_DIM,
        height: IMAGE_MAX_DIM,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_QUALITY })
      .toFile(join(UPLOAD_DIR, filename));

    const base = getBaseUrl(req);
    const url = `${base}/api/public/uploads/${filename}`;
    sendSuccess(res, { url, path: `/uploads/${filename}` });
  } catch (e) {
    next(e);
  }
});

/** POST /api/upload/video — upload + transcode sang WebM (max width 1080), returns { url: "https://…/api/videos/….webm" } */
router.post("/video", videoUpload.single("video"), async (req, res, next) => {
  if (!req.file) {
    sendError(
      res,
      "No video file received (allowed: mp4, webm, mov, m4v; max 500MB)",
      400,
    );
    return;
  }
  const rawPath = req.file.path;
  const outName = buildFilename(req.file.originalname, ".webm");
  const outPath = join(VIDEO_DIR, outName);
  try {
    await mkdir(VIDEO_DIR, { recursive: true });
    await transcodeToWebm(rawPath, outPath);
    const base = getBaseUrl(req);
    const url = `${base}/api/videos/${outName}`;
    sendSuccess(res, {
      url,
      path: `/videos/${outName}`,
      mimetype: "video/webm",
    });
  } catch (e) {
    next(e);
  } finally {
    // luôn dọn file gốc tạm dù transcode thành công hay lỗi
    await unlink(rawPath).catch(() => {});
  }
});

export default router;
