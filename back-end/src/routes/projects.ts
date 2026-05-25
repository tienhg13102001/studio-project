import { Router } from "express";
import { sendSuccess, sendError } from "../lib/response.ts";
import { Project, type IProject } from "../models/Project.ts";
import { Service } from "../models/Service.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const [verticalCards, horizontalCards] = await Promise.all([
    Project.find({ layout: "vertical" }).populate("service"),
    Project.find({ layout: "horizontal" }).populate("service"),
  ]);
  sendSuccess(res, { verticalCards, horizontalCards });
});

/** POST /api/projects */

// Accepts: { title, subtitle, thumbnailImage, layout, prominent, service, video? }
router.post("/", async (req, res) => {
  const body = req.body as Partial<IProject>;
  const project = await Project.create({
    title: body.title,
    subtitle: body.subtitle,
    thumbnailImage: body.thumbnailImage,
    layout: body.layout,
    prominent: body.prominent,
    service: body.service,
    video: body.video,
  });
  if (body.service) {
    await Service.findByIdAndUpdate(body.service, { $push: { projects: project._id } });
  }
  const populated = await Project.findById(project._id).populate("service");
  sendSuccess(res, populated, 201);
});

/** PUT /api/projects/:id */

// Accepts: { title, subtitle, thumbnailImage, layout, prominent, service, video? }
router.put("/:id", async (req, res) => {
  const { title, subtitle, thumbnailImage, layout, prominent, service, video } = req.body as Record<string, unknown>;
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { title, subtitle, thumbnailImage, layout, prominent, service, video },
    { new: true, runValidators: true },
  ).populate("service");
  if (!project) { sendError(res, "Project not found", 404); return; }
  sendSuccess(res, project);
});

/** DELETE /api/projects/:id */
router.delete("/:id", async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) { sendError(res, "Project not found", 404); return; }
  if (project.service) {
    await Service.findByIdAndUpdate(project.service, { $pull: { projects: project._id } });
  }
  sendSuccess(res, { deleted: true });
});

export default router;
