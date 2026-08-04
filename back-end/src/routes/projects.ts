import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Project, type IProject } from "../models/Project.ts";
import { Service } from "../models/Service.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [verticalCards, horizontalCards] = await Promise.all([
      Project.find({ layout: "vertical" }).populate("service").populate("members", "name photo"),
      Project.find({ layout: "horizontal" }).populate("service").populate("members", "name photo"),
    ]);
    sendSuccess(res, { verticalCards, horizontalCards });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/projects/photos
 * Gathers the `photos` of every project that has any and groups them by the
 * project's service tag — powers the tabbed bento gallery on the landing page.
 * Returns: [{ tag, title, photos: string[] }]
 */
router.get("/photos", async (_req, res, next) => {
  try {
    const projects = await Project.find(
      { photos: { $exists: true, $ne: [] } },
      { photos: 1, service: 1, _id: 0 },
    )
      .populate<{
        service: { tag: string; title: { en: string; vi: string }; order?: number } | null;
      }>("service", "tag title order")
      .lean();

    // Group every project's photos under its service tag.
    const groups = new Map<
      string,
      { tag: string; title: { en: string; vi: string }; order: number; photos: string[] }
    >();
    for (const p of projects) {
      const svc = p.service;
      if (!svc) continue; // skip projects whose service was deleted
      let group = groups.get(svc.tag);
      if (!group) {
        group = { tag: svc.tag, title: svc.title, order: svc.order ?? 0, photos: [] };
        groups.set(svc.tag, group);
      }
      group.photos.push(...(p.photos ?? []));
    }

    // Order tabs by the service's `order` (lower first); tie-break by tag name.
    const ordered = [...groups.values()].sort(
      (a, b) => a.order - b.order || a.tag.localeCompare(b.tag),
    );
    sendSuccess(res, ordered);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/projects/by-slug/:slug — tra một tên đường dẫn ra dự án nào.
 *
 * VÌ SAO CẦN: địa chỉ mới của dự án là /du-an/vf9-teaser — phẳng, không mang mã
 * dịch vụ. Nhưng trang dự án vốn dựng bên trong trang dịch vụ, nên trước khi vẽ
 * được gì thì phải biết dự án này thuộc dịch vụ nào. Trả về đúng phần tra cứu
 * chứ không trả cả dự án: bên gọi đã có sẵn cách tải dịch vụ kèm toàn bộ dự án
 * bên trong, gửi thừa chỉ tốn băng thông.
 *
 * Dự án còn đó nhưng dịch vụ cha đã vào thùng rác thì coi như không tìm thấy —
 * đúng bằng cách sitemap đang loại những dự án đó ra.
 */
router.get("/by-slug/:slug", async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate<{
      service: { _id: unknown; slug?: string } | null;
    }>("service", "slug");

    if (!project) { sendError(res, "Project not found", 404); return; }
    if (!project.service) { sendError(res, "Project has no live service", 404); return; }

    sendSuccess(res, {
      projectId: String(project._id),
      projectSlug: project.slug ?? null,
      serviceId: String(project.service._id),
      serviceSlug: project.service.slug ?? null,
    });
  } catch (e) {
    next(e);
  }
});

/** POST /api/projects */
router.post("/", async (req, res, next) => {
  try {
    const body = req.body as Partial<IProject>;

    // ── Explicit required-field check (gives a clear FE message) ──────────────
    const missing: string[] = [];
    if (!body.title)          missing.push("title");
    if (!body.subtitle)       missing.push("subtitle");
    if (!body.thumbnailImage) missing.push("thumbnailImage");
    if (!body.layout)         missing.push("layout");
    if (!body.service)        missing.push("service");
    if (missing.length) {
      sendError(res, `Missing required fields: ${missing.join(", ")}`, 400);
      return;
    }

    const project = await Project.create({
      title: body.title,
      subtitle: body.subtitle,
      thumbnailImage: body.thumbnailImage,
      layout: body.layout,
      prominent: body.prominent,
      service: body.service,
      video: body.video,
      photos: body.photos,
      shootDate: body.shootDate,
      shootLocation: body.shootLocation,
      members: body.members,
      caseStudy: body.caseStudy,
    });
    if (body.service) {
      await Service.findByIdAndUpdate(body.service, { $push: { projects: project._id } });
    }
    const populated = await Project.findById(project._id)
      .populate("service")
      .populate("members", "name photo");
    sendSuccess(res, populated, 201);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/projects/:id */
router.put("/:id", async (req, res, next) => {
  try {
    const { title, subtitle, thumbnailImage, layout, prominent, service, video, photos, shootDate, shootLocation, members, caseStudy } =
      req.body as Record<string, unknown>;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, thumbnailImage, layout, prominent, service, video, photos, shootDate, shootLocation, members, caseStudy },
      { new: true, runValidators: true },
    ).populate("service").populate("members", "name photo");
    if (!project) { sendError(res, "Project not found", 404); return; }
    sendSuccess(res, project);
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/projects/:id — chuyển vào thùng rác, giữ 30 ngày rồi mới xoá hẳn.
 *
 * KHÔNG gỡ id khỏi `Service.projects` nữa: đã kiểm chứng populate cũng đi qua bộ
 * lọc thùng rác nên dự án đã xoá không hiện ở trang dịch vụ. Giữ nguyên liên kết
 * để lúc khôi phục dự án quay lại đúng chỗ cũ, không phải nối lại bằng tay.
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const project = await Project.softDeleteById(req.params.id);
    if (!project) { sendError(res, "Project not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
