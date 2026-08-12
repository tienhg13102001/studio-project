import { Router } from "express";
import { Types } from "mongoose";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Testimonial } from "../models/Testimonial.ts";

const router = Router();

/** Một ô chữ hai thứ tiếng gửi lên từ Portal. */
type LoiGuiLen = { en?: unknown; vi?: unknown } | undefined;

/**
 * Nhận ô chữ hai thứ tiếng từ Portal và trả về dạng sạch.
 *
 * Trả `null` khi cả hai thứ tiếng đều rỗng — nhận xét không có lời thì không có
 * lý do gì tồn tại, và để lọt một bản rỗng lên web thì khách thấy một khung
 * trống không hiểu là gì.
 */
function docLoi(v: LoiGuiLen): { en: string; vi: string } | null {
  const en = typeof v?.en === "string" ? v.en.trim() : "";
  const vi = typeof v?.vi === "string" ? v.vi.trim() : "";
  if (!en && !vi) return null;
  return { en, vi };
}

/** Chuỗi tuỳ chọn: giữ nguyên nếu gửi lên, bỏ qua nếu không. */
function docChuoi(v: unknown): string | undefined {
  return typeof v === "string" ? v.trim() : undefined;
}

/**
 * Mã dịch vụ. Chuỗi rỗng cũng phải hiểu là "không gắn dịch vụ nào" — ô chọn
 * trong Portal gửi lên "" khi người dùng chọn mục "Không gắn", và nếu ném thẳng
 * chuỗi rỗng cho Mongoose thì nó báo lỗi ép kiểu ObjectId chứ không hiểu là xoá.
 *
 * Mã sai định dạng thì NÉM LỖI chứ không lặng lẽ bỏ gắn: bỏ gắn im lặng nghĩa là
 * nhận xét biến mất khỏi trang dịch vụ mà không ai biết vì sao.
 */
function docDichVu(v: unknown): Types.ObjectId | null | undefined {
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  if (!Types.ObjectId.isValid(v)) throw new RangeError("Mã dịch vụ không hợp lệ");
  return new Types.ObjectId(v);
}

/**
 * GET /api/testimonials — nhận xét đang bật, xếp theo thứ tự hiển thị.
 *
 * CỐ Ý KHÔNG trả bản đã tắt: bản bị tắt thường là bản khách xin gỡ xuống, để lọt
 * ra đường công khai thì tắt cũng như không. Portal đọc ở `/all` bên dưới.
 */
router.get("/", async (_req, res, next) => {
  try {
    const items = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: 1 });
    sendSuccess(res, items);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testimonials/all — gồm cả bản đã tắt, cho Portal.
 *
 * Đường này nằm trong danh sách chỉ-quản-trị ở `routes/index.ts`.
 */
router.get("/all", async (_req, res, next) => {
  try {
    const items = await Testimonial.find().sort({ order: 1, createdAt: 1 });
    sendSuccess(res, items);
  } catch (e) {
    next(e);
  }
});

/** POST /api/testimonials */
router.post("/", async (req, res, next) => {
  try {
    const b = req.body as Record<string, unknown>;
    const quote = docLoi(b["quote"] as LoiGuiLen);
    if (!quote) {
      sendError(res, "Phải có lời nhận xét ở ít nhất một thứ tiếng", 400);
      return;
    }

    const item = await Testimonial.create({
      quote,
      authorName: docChuoi(b["authorName"]) ?? "",
      authorTitle: docChuoi(b["authorTitle"]) ?? "",
      service: docDichVu(b["service"]) ?? null,
      featured: b["featured"] === true,
      order: typeof b["order"] === "number" ? b["order"] : 0,
      active: b["active"] !== false,
    });
    sendSuccess(res, item, 201);
  } catch (e) {
    if (e instanceof RangeError) {
      sendError(res, e.message, 400);
      return;
    }
    next(e);
  }
});

/**
 * PUT /api/testimonials/:id
 *
 * Chỉ ghi đè những ô THẬT SỰ được gửi lên. Gán thẳng cả gói như route thương
 * hiệu thì một lần lưu thiếu ô sẽ xoá trắng ô đó — với nhận xét thì đó là mất
 * nguyên câu nói của khách, không lấy lại được trừ khi vào thùng rác.
 */
router.put("/:id", async (req, res, next) => {
  try {
    const b = req.body as Record<string, unknown>;
    const capNhat: Record<string, unknown> = {};

    if ("quote" in b) {
      const quote = docLoi(b["quote"] as LoiGuiLen);
      if (!quote) {
        sendError(res, "Phải có lời nhận xét ở ít nhất một thứ tiếng", 400);
        return;
      }
      capNhat["quote"] = quote;
    }
    const ten = docChuoi(b["authorName"]);
    if (ten !== undefined) capNhat["authorName"] = ten;
    const chucDanh = docChuoi(b["authorTitle"]);
    if (chucDanh !== undefined) capNhat["authorTitle"] = chucDanh;
    if ("service" in b) capNhat["service"] = docDichVu(b["service"]) ?? null;
    if (typeof b["featured"] === "boolean") capNhat["featured"] = b["featured"];
    if (typeof b["active"] === "boolean") capNhat["active"] = b["active"];
    if (typeof b["order"] === "number") capNhat["order"] = b["order"];

    const item = await Testimonial.findByIdAndUpdate(req.params.id, capNhat, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      sendError(res, "Không tìm thấy nhận xét", 404);
      return;
    }
    sendSuccess(res, item);
  } catch (e) {
    if (e instanceof RangeError) {
      sendError(res, e.message, 400);
      return;
    }
    next(e);
  }
});

/** DELETE /api/testimonials/:id — vào thùng rác, khôi phục được trong 30 ngày. */
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Testimonial.softDeleteById(req.params.id);
    if (!item) {
      sendError(res, "Không tìm thấy nhận xét", 404);
      return;
    }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
