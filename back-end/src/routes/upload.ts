import { Router } from "express";
import multer from "multer";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { sendSuccess, sendError } from "../lib/response.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: join(__dirname, "../../public/uploads"),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(null, false);
  },
});

const router = Router();

/** POST /api/upload — upload a single image, returns { path: "/uploads/…" } */
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    sendError(res, "No image file received", 400);
    return;
  }
  sendSuccess(res, { path: `/uploads/${req.file.filename}` });
});

export default router;
