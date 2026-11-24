import { Router, type Request, type Response } from "express";
import { existsSync, mkdirSync } from "fs";
import { rename, unlink } from "fs/promises";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import ffmpeg from "fluent-ffmpeg";
import { xepHang } from "./upload.ts";

/**
 * ĐOẠN XEM TRƯỚC KHI RÊ CHUỘT — GET /api/xem-truoc/:ten (24/11/2026, mục G8).
 *
 * Lưới Portfolio chỉ đổi viền khi rê chuột; video gốc 20–58 MB nên không thể
 * phát thẳng. Đường này cắt một đoạn 4 giây, 480px, không tiếng (~300–600 KB)
 * từ video của dự án, cắt MỘT LẦN rồi giữ trong ổ video (còn qua các lần dựng lại).
 *
 * KHÔNG để khách phải chờ máy chủ cắt: chưa có thì trả 404 NGAY và xếp việc cắt
 * vào CHUNG hàng đợi với việc chuyển mã video tải lên (máy 2 nhân, hai ffmpeg
 * song song thì cả hai cùng chậm — xem upload.ts). Giao diện gặp 404 thì cứ hiện
 * ảnh như cũ. Sau mỗi lần đẩy web, Claude gọi trước cả lượt để cắt sẵn vào ban đêm.
 *
 * Chỉ nhận tên tệp trơn có sẵn trong thư mục video — không có "/" hay "..".
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEO_DIR = join(__dirname, "../../public/videos");
const THU_MUC = join(VIDEO_DIR, "_xem-truoc");
const TEN_HOP_LE = /^[^/\\]+\.(mp4|webm|mov)$/i;
const dangCho = new Set<string>();

function doDai(duongDan: string): Promise<number> {
  return new Promise((ok) =>
    ffmpeg.ffprobe(duongDan, (err, d) => ok(err ? 0 : Number(d?.format?.duration ?? 0))),
  );
}

async function cat(goc: string, dich: string): Promise<void> {
  const dai = await doDai(goc);
  // Bỏ vài giây đầu (thường là màn đen / logo) nếu video đủ dài.
  const batDau = dai > 14 ? 4 : 0;
  const tam = dich.replace(/\.mp4$/, ".dang-cat.mp4");
  await new Promise<void>((ok, loi) => {
    ffmpeg(goc)
      .seekInput(batDau)
      .duration(4)
      .noAudio()
      .videoFilters("scale=480:-2")
      .outputOptions(["-c:v libx264", "-preset veryfast", "-crf 30", "-pix_fmt yuv420p", "-movflags +faststart"])
      .on("end", () => ok())
      .on("error", (e) => loi(e))
      .save(tam);
  });
  await rename(tam, dich);
}

const router = Router();

router.get("/:ten", async (req: Request, res: Response) => {
  const ten = basename(String(req.params.ten));
  if (ten !== req.params.ten || ten.includes("..") || !TEN_HOP_LE.test(ten)) {
    res.status(404).end();
    return;
  }
  const goc = join(VIDEO_DIR, ten);
  const dich = join(THU_MUC, ten.replace(/\.[^.]+$/, ".mp4"));
  if (existsSync(dich)) {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    res.type("video/mp4").sendFile(dich);
    return;
  }
  // Chưa có: trả ngay, cắt sau (không bắt khách chờ).
  res.setHeader("Cache-Control", "no-store");
  res.status(404).end();
  if (!existsSync(goc) || dangCho.has(ten)) return;
  dangCho.add(ten);
  mkdirSync(THU_MUC, { recursive: true });
  xepHang(() => cat(goc, dich))
    .catch(async (e) => {
      console.warn(`[xem-truoc] cắt hỏng ${ten}: ${e?.message ?? e}`);
      await unlink(dich.replace(/\.mp4$/, ".dang-cat.mp4")).catch(() => {});
    })
    .finally(() => dangCho.delete(ten));
});

export default router;
