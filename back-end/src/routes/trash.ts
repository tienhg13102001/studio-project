import { Router, type RequestHandler } from "express";
import requireAuth from "../middleware/requireAuth.ts";
import { sendError, sendSuccess } from "../lib/response.ts";
import { TRASH_TTL_DAYS } from "../lib/softDelete.ts";
import { Brand } from "../models/Brand.ts";
import { Customer } from "../models/Customer.ts";
import { PortfolioItem } from "../models/Portfolio.ts";
import { Project } from "../models/Project.ts";
import { Service } from "../models/Service.ts";

/**
 * Thùng rác dùng chung cho portal.
 *
 * Mọi thao tác đều yêu cầu đăng nhập vì danh sách này chứa cả yêu cầu liên hệ
 * của khách (tên, email, số điện thoại).
 */
const router = Router();

/** Một mục hiển thị trong thùng rác — đủ để nhận ra "cái gì đã bị xoá". */
type TrashItem = {
  type: string;
  typeLabel: string;
  id: string;
  title: string;
  subtitle: string;
  image: string;
  deletedAt: string;
  /** Mốc cơ sở dữ liệu sẽ tự xoá hẳn. */
  purgeAt: string;
};

type TrashEntry = {
  list: () => Promise<TrashItem[]>;
  restore: (id: string) => Promise<boolean>;
  purge: (id: string) => Promise<boolean>;
};

/** Tên tiếng Việt của từng loại, hiện thẳng trên thẻ trong thùng rác. */
const LABELS = {
  projects: "Dự án",
  services: "Dịch vụ",
  brands: "Thương hiệu",
  portfolio: "Ảnh portfolio",
  inquiries: "Yêu cầu liên hệ",
} as const;

function purgeAt(deletedAt: Date): string {
  return new Date(deletedAt.getTime() + TRASH_TTL_DAYS * 86400_000).toISOString();
}

/**
 * Danh mục các loại dữ liệu có thùng rác. Khoá ở đây chính là đoạn `:type` trên
 * đường dẫn — dùng danh sách cố định để không ai gọi được tới bảng khác.
 *
 * Tài khoản người dùng CỐ Ý không có mặt: xoá tài khoản là việc liên quan tới
 * đăng nhập, để nguyên như cũ cho an toàn.
 */
const SOURCES: Record<string, TrashEntry> = {
  projects: {
    list: async () =>
      (await Project.findDeleted()).map((p) => ({
        type: "projects",
        typeLabel: LABELS.projects,
        id: String(p._id),
        title: p.title,
        subtitle: p.subtitle?.vi ?? "",
        image: p.thumbnailImage,
        deletedAt: p.deletedAt.toISOString(),
        purgeAt: purgeAt(p.deletedAt),
      })),
    restore: async (id) => !!(await Project.restoreById(id)),
    purge: async (id) => !!(await Project.purgeById(id)),
  },

  services: {
    list: async () =>
      (await Service.findDeleted()).map((s) => ({
        type: "services",
        typeLabel: LABELS.services,
        id: String(s._id),
        title: s.title?.vi ?? s.title?.en ?? "",
        subtitle: s.tag,
        image: s.thumbnailImage,
        deletedAt: s.deletedAt.toISOString(),
        purgeAt: purgeAt(s.deletedAt),
      })),
    restore: async (id) => !!(await Service.restoreById(id)),
    purge: async (id) => !!(await Service.purgeById(id)),
  },

  brands: {
    list: async () =>
      (await Brand.findDeleted()).map((b) => ({
        type: "brands",
        typeLabel: LABELS.brands,
        id: String(b._id),
        title: b.name,
        subtitle: "",
        image: b.logo,
        deletedAt: b.deletedAt.toISOString(),
        purgeAt: purgeAt(b.deletedAt),
      })),
    restore: async (id) => !!(await Brand.restoreById(id)),
    purge: async (id) => !!(await Brand.purgeById(id)),
  },

  portfolio: {
    list: async () =>
      (await PortfolioItem.findDeleted()).map((p) => ({
        type: "portfolio",
        typeLabel: LABELS.portfolio,
        id: String(p._id),
        title: p.title || "Ảnh chưa đặt tên",
        subtitle: "",
        image: p.image,
        deletedAt: p.deletedAt.toISOString(),
        purgeAt: purgeAt(p.deletedAt),
      })),
    restore: async (id) => !!(await PortfolioItem.restoreById(id)),
    purge: async (id) => !!(await PortfolioItem.purgeById(id)),
  },

  inquiries: {
    list: async () =>
      (await Customer.findDeleted()).map((c) => ({
        type: "inquiries",
        typeLabel: LABELS.inquiries,
        id: String(c._id),
        title: c.name,
        subtitle: c.email,
        image: "",
        deletedAt: c.deletedAt.toISOString(),
        purgeAt: purgeAt(c.deletedAt),
      })),
    restore: async (id) => !!(await Customer.restoreById(id)),
    purge: async (id) => !!(await Customer.purgeById(id)),
  },
};

/** GET /api/trash — mọi thứ đang nằm trong thùng rác, mới xoá xếp trước. */
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const groups = await Promise.all(Object.values(SOURCES).map((s) => s.list()));
    const items = groups.flat().sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
    sendSuccess(res, { items, ttlDays: TRASH_TTL_DAYS });
  } catch (e) {
    next(e);
  }
});

/**
 * Khai báo kiểu tham số đường dẫn cho rõ ràng: khi có middleware xen giữa,
 * Express không suy ra đúng kiểu của `:type` và `:id`.
 */
type TrashParams = { type: string; id: string };

/** POST /api/trash/:type/:id/restore — đưa một mục trở lại chỗ cũ. */
const restore: RequestHandler<TrashParams> = async (req, res, next) => {
  try {
    const source = SOURCES[req.params.type];
    if (!source) {
      sendError(res, "Unknown trash type", 404);
      return;
    }

    if (!(await source.restore(req.params.id))) {
      sendError(res, "Item not found", 404);
      return;
    }
    sendSuccess(res, { restored: true });
  } catch (e) {
    next(e);
  }
};
router.post("/:type/:id/restore", requireAuth, restore);

/** DELETE /api/trash/:type/:id — xoá hẳn, không lấy lại được. */
const purge: RequestHandler<TrashParams> = async (req, res, next) => {
  try {
    const source = SOURCES[req.params.type];
    if (!source) {
      sendError(res, "Unknown trash type", 404);
      return;
    }

    // purge chỉ đụng tới bản đã nằm trong thùng rác, nên gọi nhầm id của một mục
    // đang dùng sẽ trả 404 thay vì xoá mất dữ liệu thật.
    if (!(await source.purge(req.params.id))) {
      sendError(res, "Item not found in trash", 404);
      return;
    }
    sendSuccess(res, { purged: true });
  } catch (e) {
    next(e);
  }
};
router.delete("/:type/:id", requireAuth, purge);

export default router;
