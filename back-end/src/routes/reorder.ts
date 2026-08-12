import { Router, type RequestHandler } from "express";
import { sendError, sendSuccess } from "../lib/response.ts";
import { Brand } from "../models/Brand.ts";
import { PortfolioItem } from "../models/Portfolio.ts";
import { Service } from "../models/Service.ts";
import { Testimonial } from "../models/Testimonial.ts";

/**
 * Sắp xếp lại thứ tự hiển thị bằng MỘT lời gọi.
 *
 * VÌ SAO CẦN: portal có 30 thương hiệu. Kéo một mục lên đầu là thứ tự của mọi
 * mục nằm giữa đều đổi — gửi 30 lệnh sửa riêng lẻ thì vừa chậm vừa dễ đứt giữa
 * chừng, để lại danh sách sắp xếp dở dang. Gộp thành một lệnh ghi hàng loạt thì
 * hoặc xong hết, hoặc không đổi gì.
 *
 * Thao tác ghi nên đã tự động phải đăng nhập (xem lớp khoá ở routes/index.ts);
 * vẫn khai báo requireAuth ở đây cho ai đọc file này biết ngay.
 */
const router = Router();

/** Chỉ bốn loại này có thứ tự hiển thị. Danh sách cố định, không tra động. */
const SOURCES = {
  services: Service,
  brands: Brand,
  portfolio: PortfolioItem,
  testimonials: Testimonial,
};

type SortableType = keyof typeof SOURCES;

function findSource(type: string) {
  // hasOwn: viết thẳng SOURCES[type] thì "constructor" cũng trả về một giá trị
  // thừa kế từ Object và request đi tiếp với thứ không phải model.
  return Object.hasOwn(SOURCES, type) ? SOURCES[type as SortableType] : null;
}

type ReorderParams = { type: string };

/** PUT /api/reorder/:type — nhận [{ id, order }] và ghi một lượt. */
const reorder: RequestHandler<ReorderParams> = async (req, res, next) => {
  try {
    const model = findSource(req.params.type);
    if (!model) {
      sendError(res, "Unknown sortable type", 404);
      return;
    }

    const { items } = req.body as { items?: { id?: unknown; order?: unknown }[] };
    if (!Array.isArray(items) || items.length === 0) {
      sendError(res, "items must be a non-empty array", 422);
      return;
    }

    // Kiểm từng phần tử trước khi ghi: một phần tử hỏng mà vẫn ghi thì danh
    // sách sắp xếp lệch, mà lệch thứ tự thì rất khó nhận ra bằng mắt.
    const updates = items.map((it) => {
      if (typeof it?.id !== "string" || typeof it?.order !== "number" || !Number.isFinite(it.order)) {
        throw new RangeError("mỗi phần tử phải có id dạng chuỗi và order dạng số");
      }
      return {
        updateOne: {
          // Chặn luôn mục đang nằm trong thùng rác — sắp xếp không được đụng tới.
          filter: { _id: it.id, deletedAt: null },
          update: { $set: { order: it.order } },
        },
      };
    });

    // Ba model có kiểu tài liệu khác nhau nên `bulkWrite` của chúng không gọi
    // chung được. Ở đây chỉ cần đúng một khả năng của nó, nên thu hẹp lại cho
    // rõ thay vì nới lỏng kiểu của cả ba model.
    const writer = model as unknown as {
      bulkWrite(ops: typeof updates): Promise<{ modifiedCount: number }>;
    };
    const result = await writer.bulkWrite(updates);
    sendSuccess(res, { updated: result.modifiedCount });
  } catch (e) {
    if (e instanceof RangeError) {
      sendError(res, e.message, 422);
      return;
    }
    next(e);
  }
};
router.put("/:type", reorder);

export default router;
