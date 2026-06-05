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
 * Gathers the `photos` of every project that has any and flattens them into a
 * single array — used by the product-image gallery section on the landing page.
 */
router.get("/photos", async (_req, res, next) => {
  try {
    const projects = await Project.find(
      { photos: { $exists: true, $ne: [] } },
      { photos: 1, _id: 0 },
    ).lean();
    const photos = projects.flatMap((p) => p.photos ?? []);
    sendSuccess(res, photos);
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
    const { title, subtitle, thumbnailImage, layout, prominent, service, video, photos, shootDate, shootLocation, members } =
      req.body as Record<string, unknown>;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, thumbnailImage, layout, prominent, service, video, photos, shootDate, shootLocation, members },
      { new: true, runValidators: true },
    ).populate("service").populate("members", "name photo");
    if (!project) { sendError(res, "Project not found", 404); return; }
    sendSuccess(res, project);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/projects/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) { sendError(res, "Project not found", 404); return; }
    if (project.service) {
      await Service.findByIdAndUpdate(project.service, { $pull: { projects: project._id } });
    }
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
