import { Router } from "express";
import { Contact } from "../models/Contact.ts";
import { Customer } from "../models/Customer.ts";
import { sendError, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res) => {
  const contact = await Contact.findOne();
  if (!contact) {
    sendError(res, "Contact content not found", 404);
    return;
  }
  sendSuccess(res, contact);
});

router.post("/inquiry", async (req, res) => {
  const { name, email, phone, service, message } = req.body as Record<string, string>;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    sendError(res, "name, email and message are required", 422);
    return;
  }
  const customer = await Customer.create({ name, email, phone, service, message });
  sendSuccess(res, { id: customer.id }, 201);
});

export default router;
