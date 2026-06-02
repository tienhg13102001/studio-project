import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { mkdir, unlink, rename, appendFile, stat } from "fs/promises";
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
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB — Cloudflare chặn body >100MB; FE giới hạn 95MB

const VIDEO_DIR = join(__dirname, "../../public/videos");
/** Chiều rộng tối đa của video output (px). Video nhỏ hơn KHÔNG bị phóng to. */
const VIDEO_MAX_WIDTH = 1080;
/** H.264 CRF (0-51): thấp = nét hơn + nặng hơn. ~28 cân bằng tốt cho web. */
const VIDEO_CRF = 28;

/**
 * Transcode bất kỳ video input nào sang MP4 (H.264 + AAC),
 * scale chiều rộng tối đa VIDEO_MAX_WIDTH, giữ tỉ lệ, chiều cao auto (chia hết 2).
 * Dùng H.264 preset ultrafast để encode nhanh nhất (nhanh hơn VP9 ~10x),
 * phù hợp khi cần phản hồi upload nhanh trên server CPU yếu.
 */
function transcodeToMp4(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        // chỉ thu nhỏ khi iw > max; height -2 = auto theo tỉ lệ, chia hết cho 2
        "-vf",
        `scale='min(${VIDEO_MAX_WIDTH},iw)':-2`,
        "-preset",
        "ultrafast",
        "-crf",
        String(VIDEO_CRF),
        // pixel format bảo đảm tương thích trình duyệt rộng rãi
        "-pix_fmt",
        "yuv420p",
        // đưa moov atom lên đầu file để phát ngay khi tải (streaming)
        "-movflags",
        "+faststart",
        // dùng toàn bộ CPU core
        "-threads",
        "0",
      ])
      .format("mp4")
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

// ─── Chunked upload (vượt giới hạn body 100MB của Cloudflare) ─────────────────
// File lớn được cắt thành mảnh <100MB ở client, mỗi mảnh upload riêng qua Cloudflare,
// server append vào 1 file tạm theo uploadId, xong thì transcode như bình thường.
const CHUNK_TMP_DIR = join(tmpdir(), "beez-video-chunks");
const CHUNK_MAX_BYTES = 60 * 1024 * 1024; // mỗi mảnh tối đa 60MB (< 100MB Cloudflare)
const VIDEO_TOTAL_MAX_BYTES = 500 * 1024 * 1024; // tổng video tối đa 500MB

/** uploadId do client tạo (uuid) — sanitize để tránh path traversal. */
function safeUploadId(id: string): string | null {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : null;
}

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CHUNK_MAX_BYTES },
});

/**
 * Nhận 1 file gốc (raw video) → trả response NGAY (status processing) → transcode
 * nền vào file tạm rồi rename nguyên tử sang tên thật. Dùng chung cho cả luồng
 * single-shot lẫn chunked. Tự xóa `rawPath` khi xong.
 */
async function startVideoTranscodeJob(
  rawPath: string,
  originalname: string,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const outName = buildFilename(originalname, ".mp4");
  const outPath = join(VIDEO_DIR, outName);
  // Transcode vào file TẠM (dotfile → express.static không serve) rồi rename
  // nguyên tử sang outPath khi XONG → URL cuối hoặc 404 (chưa xong) hoặc file
  // ĐẦY ĐỦ, không bao giờ dở dang → Cloudflare không cache bản cắt cụt.
  const tmpOut = join(VIDEO_DIR, `.processing-${outName}`);
  try {
    await mkdir(VIDEO_DIR, { recursive: true });
  } catch (e) {
    await unlink(rawPath).catch(() => {});
    next(e);
    return;
  }

  const base = getBaseUrl(req);
  sendSuccess(res, {
    url: `${base}/api/videos/${outName}`,
    path: `/videos/${outName}`,
    mimetype: "video/mp4",
    status: "processing",
  });

  transcodeToMp4(rawPath, tmpOut)
    .then(() => rename(tmpOut, outPath)) // atomic: file chỉ xuất hiện khi đã hoàn chỉnh
    .then(() => console.log(`[video] transcode done: ${outName}`))
    .catch(async (err) => {
      console.error(`[video] transcode FAILED for ${outName}:`, err);
      await unlink(tmpOut).catch(() => {});
    })
    .finally(() => void unlink(rawPath).catch(() => {}));
}

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

/** POST /api/upload/video — single-shot (≤100MB, qua Cloudflare). Lớn hơn dùng chunked bên dưới. */
router.post("/video", videoUpload.single("video"), async (req, res, next) => {
  if (!req.file) {
    sendError(
      res,
      "No video file received (allowed: mp4, webm, mov, m4v; max 95MB)",
      400,
    );
    return;
  }
  await startVideoTranscodeJob(req.file.path, req.file.originalname, req, res, next);
});

/** POST /api/upload/video/chunk — nhận 1 mảnh, append vào file tạm theo uploadId. */
router.post("/video/chunk", chunkUpload.single("chunk"), async (req, res, next) => {
  try {
    const uploadId = safeUploadId(String(req.body.uploadId ?? ""));
    if (!uploadId || !req.file) {
      sendError(res, "Invalid chunk payload", 400);
      return;
    }
    await mkdir(CHUNK_TMP_DIR, { recursive: true });
    const partPath = join(CHUNK_TMP_DIR, `${uploadId}.part`);
    // Chặn vượt tổng dung lượng (phòng client gửi quá nhiều mảnh).
    const current = await stat(partPath)
      .then((s) => s.size)
      .catch(() => 0);
    if (current + req.file.size > VIDEO_TOTAL_MAX_BYTES) {
      await unlink(partPath).catch(() => {});
      sendError(res, "Video too large (max 500MB)", 413);
      return;
    }
    await appendFile(partPath, req.file.buffer); // client upload tuần tự → đúng thứ tự
    sendSuccess(res, { received: true });
  } catch (e) {
    next(e);
  }
});

/** POST /api/upload/video/complete — ghép xong → transcode nền, trả { url, status: processing }. */
router.post("/video/complete", async (req, res, next) => {
  const uploadId = safeUploadId(String(req.body?.uploadId ?? ""));
  const filename = String(req.body?.filename ?? "video.mp4");
  if (!uploadId) {
    sendError(res, "Invalid uploadId", 400);
    return;
  }
  if (!ALLOWED_VIDEO_EXT.has(extname(filename).toLowerCase())) {
    sendError(res, "Unsupported video type (allowed: mp4, webm, mov, m4v)", 400);
    return;
  }
  const partPath = join(CHUNK_TMP_DIR, `${uploadId}.part`);
  let size = 0;
  try {
    size = (await stat(partPath)).size;
  } catch {
    sendError(res, "Upload not found or already processed", 404);
    return;
  }
  if (size === 0 || size > VIDEO_TOTAL_MAX_BYTES) {
    await unlink(partPath).catch(() => {});
    sendError(res, "Invalid upload size", 400);
    return;
  }
  // partPath = file gốc đã ghép → tái dùng pipeline transcode (tự xóa partPath khi xong).
  await startVideoTranscodeJob(partPath, filename, req, res, next);
});

export default router;
