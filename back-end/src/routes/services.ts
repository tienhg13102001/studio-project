import { Router } from "express";
import { Service } from "../models/Service.ts";
import { parsePagination, sendError, sendPaginated } from "../lib/response.ts";

const router = Router();

router.get("/", async (req, res) => {
  const pagination = parsePagination(req.query as Record<string, unknown>);
  if (!pagination) {
    sendError(res, "Invalid pagination params. page ≥ 1, 1 ≤ limit ≤ 100");
    return;
  }

  const services = await Service.find().sort({ order: 1 });
  sendPaginated(res, services, pagination.page, pagination.limit);
});

export default router;
