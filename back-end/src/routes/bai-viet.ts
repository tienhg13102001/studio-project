import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { BaiViet } from "../models/BaiViet.ts";

/**
 * Bài viết — /api/bai-viet.
 *
 * Đọc công khai CHỈ bài đã đăng. Bản nháp chỉ ra qua `/all` (nằm trong danh
 * sách chỉ-quản-trị ở routes/index.ts). Mọi đường ghi đã bị khoá chung ở
 * routes/index.ts (phải đăng nhập, nhân viên thường không ghi được ở đây).
 */
const router = Router();

/** Trường gọn cho danh sách — không gửi cả thân bài cho trang liệt kê. */
const GON = "slug tieuDe moTa anhBia ngayDang dichVu updatedAt";

const daDang = () => ({ trangThai: "dang" as const, ngayDang: { $ne: null, $lte: new Date() } });

/** GET /api/bai-viet — bài đã đăng, mới nhất trước. */
router.get("/", async (_req, res, next) => {
  try {
    const ds = await BaiViet.find(daDang()).select(GON).sort({ ngayDang: -1 });
    sendSuccess(res, ds);
  } catch (e) {
    next(e);
  }
});

/** GET /api/bai-viet/all — cả nháp, đủ thân bài, cho Portal. */
router.get("/all", async (_req, res, next) => {
  try {
    const ds = await BaiViet.find().sort({ updatedAt: -1 });
    sendSuccess(res, ds);
  } catch (e) {
    next(e);
  }
});

/** GET /api/bai-viet/:slug — một bài đã đăng. Nháp trả 404 như không tồn tại. */
router.get("/:slug", async (req, res, next) => {
  try {
    const bai = await BaiViet.findOne({ slug: String(req.params.slug).toLowerCase(), ...daDang() });
    if (!bai) {
      sendError(res, "Không tìm thấy bài viết", 404);
      return;
    }
    sendSuccess(res, bai);
  } catch (e) {
    next(e);
  }
});

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const chuoi = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);

/** Đọc thân yêu cầu thành bản ghi sạch. Ném RangeError kèm câu báo lỗi tiếng Việt. */
function doc(b: Record<string, unknown>, tao: boolean): Record<string, unknown> {
  const ra: Record<string, unknown> = {};
  const slug = chuoi(b["slug"])?.toLowerCase();
  if (slug !== undefined) {
    if (!SLUG.test(slug)) throw new RangeError("Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối");
    ra["slug"] = slug;
  } else if (tao) throw new RangeError("Thiếu đường dẫn bài");
  const tieuDe = chuoi(b["tieuDe"]);
  if (tieuDe !== undefined) {
    if (!tieuDe) throw new RangeError("Thiếu tiêu đề");
    ra["tieuDe"] = tieuDe;
  } else if (tao) throw new RangeError("Thiếu tiêu đề");
  for (const k of ["moTa", "anhBia", "dichVu"]) {
    const v = chuoi(b[k]);
    if (v !== undefined) ra[k] = v;
  }
  if (typeof b["noiDung"] === "string") ra["noiDung"] = b["noiDung"];
  if (b["trangThai"] === "nhap" || b["trangThai"] === "dang") ra["trangThai"] = b["trangThai"];
  return ra;
}

async function trungSlug(slug: string, boQuaId?: string): Promise<boolean> {
  const co = await BaiViet.findOne({ slug, ...(boQuaId ? { _id: { $ne: boQuaId } } : {}) }).select("_id");
  return !!co;
}

/** POST /api/bai-viet */
router.post("/", async (req, res, next) => {
  try {
    const ra = doc(req.body as Record<string, unknown>, true);
    if (await trungSlug(ra["slug"] as string)) {
      sendError(res, "Đã có bài dùng đường dẫn này", 409);
      return;
    }
    // Đăng ngay lúc tạo thì lấy ngày hôm nay làm ngày đăng.
    if (ra["trangThai"] === "dang") ra["ngayDang"] = new Date();
    const bai = await BaiViet.create(ra);
    sendSuccess(res, bai, 201);
  } catch (e) {
    if (e instanceof RangeError) {
      sendError(res, e.message, 400);
      return;
    }
    next(e);
  }
});

/** PUT /api/bai-viet/:id — chỉ ghi những ô được gửi lên. */
router.put("/:id", async (req, res, next) => {
  try {
    const cu = await BaiViet.findById(req.params.id);
    if (!cu) {
      sendError(res, "Không tìm thấy bài viết", 404);
      return;
    }
    const ra = doc(req.body as Record<string, unknown>, false);
    if (ra["slug"] && ra["slug"] !== cu.slug && (await trungSlug(ra["slug"] as string, String(cu._id)))) {
      sendError(res, "Đã có bài dùng đường dẫn này", 409);
      return;
    }
    // Ngày đăng chỉ đặt MỘT lần, lúc lần đầu chuyển sang "dang". Gỡ xuống rồi
    // đăng lại vẫn giữ ngày cũ — sửa bài không phải là bài mới.
    if (ra["trangThai"] === "dang" && !cu.ngayDang) ra["ngayDang"] = new Date();
    cu.set(ra);
    await cu.save();
    sendSuccess(res, cu);
  } catch (e) {
    if (e instanceof RangeError) {
      sendError(res, e.message, 400);
      return;
    }
    next(e);
  }
});

/** DELETE /api/bai-viet/:id — vào thùng rác 30 ngày. */
router.delete("/:id", async (req, res, next) => {
  try {
    const bai = await BaiViet.softDeleteById(req.params.id);
    if (!bai) {
      sendError(res, "Không tìm thấy bài viết", 404);
      return;
    }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
