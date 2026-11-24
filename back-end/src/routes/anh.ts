import { Router, type Request, type Response } from "express";
import { existsSync, mkdirSync } from "fs";
import { stat } from "fs/promises";
import { tmpdir } from "os";
import { basename, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

/**
 * ẢNH THU NHỎ THEO YÊU CẦU — GET /api/anh/:rong/:ten (24/11/2026, mục N4).
 *
 * VÌ SAO: ảnh tải lên được lưu một bản rộng tới 1920px, và web dùng đúng bản đó
 * cho cả thẻ nhỏ 409px. Lighthouse đo trang chủ phí ~2,4 MB, Portfolio ~2,1 MB
 * chỉ vì gửi ảnh to hơn chỗ hiện (23/11/2026). Giao diện giờ xin đúng cỡ qua
 * `srcset`, đường này cắt ra rồi giữ lại.
 *
 * KHÔNG đụng ảnh gốc, không sửa cơ sở dữ liệu: ảnh cũ lẫn ảnh mới đều dùng được
 * ngay. Bản thu nhỏ để trong thư mục tạm của container — mất khi dựng lại thì tự
 * cắt lại lần đầu có người xem, và không lẫn vào bản sao lưu ảnh.
 *
 * An toàn: chỉ nhận 4 cỡ cố định (không cho ai bắt máy chủ cắt cả nghìn cỡ) và
 * chỉ tên tệp trơn trong thư mục uploads (không có "/" hay "..").
 */

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const THU_MUC_GOC = join(__dirname, "../../public/uploads");
const THU_MUC_NHO = join(tmpdir(), "beez-anh-nho");
const CO_CHO_PHEP = new Set([320, 640, 960, 1280]);
const TEN_HOP_LE = /^[^/\\]+\.(webp|jpe?g|png)$/i;

const router = Router();

router.get("/:rong/:ten", async (req: Request, res: Response) => {
  const rong = Number(req.params.rong);
  const ten = basename(String(req.params.ten));
  if (!CO_CHO_PHEP.has(rong) || ten !== req.params.ten || ten.includes("..") || !TEN_HOP_LE.test(ten)) {
    res.status(404).end();
    return;
  }
  const goc = join(THU_MUC_GOC, ten);
  if (!existsSync(goc)) {
    res.status(404).end();
    return;
  }
  const thuMuc = join(THU_MUC_NHO, String(rong));
  const dich = join(thuMuc, ten.replace(/\.[^.]+$/, ".webp"));
  try {
    // Ảnh gốc mới hơn bản cắt (hiếm: tên tệp luôn mới mỗi lần tải lên) thì cắt lại.
    const [sGoc, sNho] = await Promise.all([stat(goc), stat(dich).catch(() => null)]);
    if (!sNho || sNho.mtimeMs < sGoc.mtimeMs) {
      mkdirSync(thuMuc, { recursive: true });
      await sharp(goc)
        .rotate()
        .resize({ width: rong, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(dich);
    }
    // Tên ảnh gốc là duy nhất theo lần tải lên, nên bản cắt không bao giờ đổi.
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    res.type("image/webp").sendFile(dich);
  } catch {
    // Cắt hỏng thì đưa luôn ảnh gốc, khách vẫn thấy ảnh.
    res.sendFile(goc);
  }
});

export default router;
