import { Router } from "express";
import { Contact } from "../models/Contact.ts";
import { Customer } from "../models/Customer.ts";
import { Service } from "../models/Service.ts";
import { sendError, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const contact = await Contact.findOne();
    if (!contact) { sendError(res, "Contact content not found", 404); return; }
    sendSuccess(res, contact);
  } catch (e) { next(e); }
});

/**
 * GET /api/contact/inquiries — list contact-form submissions, newest first.
 * The stored `service` is a Service id; resolve it to a readable name so the
 * portal can show "Video Production" instead of an opaque ObjectId.
 */
router.get("/inquiries", async (_req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const services = await Service.find().select("title");
    const nameById = new Map(services.map((s) => [s.id as string, s.title?.en ?? ""]));

    const inquiries = customers.map((c) => ({
      ...c.toJSON(),
      serviceName: c.service ? (nameById.get(c.service) ?? "") : "",
    }));
    sendSuccess(res, inquiries);
  } catch (e) { next(e); }
});

/** DELETE /api/contact/inquiries/:id — remove one submission. */
router.delete("/inquiries/:id", async (req, res, next) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) { sendError(res, "Inquiry not found", 404); return; }
    sendSuccess(res, { deleted: true });
  } catch (e) { next(e); }
});

router.post("/inquiry", async (req, res, next) => {
  try {
    const { name, email, phone, service, message } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      sendError(res, "name, email and message are required", 422);
      return;
    }
    const customer = await Customer.create({ name, email, phone, service, message });
    sendSuccess(res, { id: customer.id }, 201);
  } catch (e) { next(e); }
});

export default router;
