import mongoose from "mongoose";
import { Router } from "express";
import { Landing } from "../models/Landing.ts";
import { Contact } from "../models/Contact.ts";
import { sendError, sendSuccess } from "../lib/response.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const landing = await Landing.findOne();
    if (!landing) { sendError(res, "Landing content not found", 404); return; }

    // Contact is the single source of truth for phone/email/address/socials.
    // Resolve the linked contact (fallback to the first one) and overlay it.
    const contact = landing.contactId
      ? await Contact.findById(landing.contactId)
      : await Contact.findOne();

    const data = {
      ...landing.toJSON(),
      ...(contact && {
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        socials: {
          zalo: contact.socials?.zalo,
          facebook: contact.socials?.facebook,
          instagram: contact.socials?.instagram,
        },
      }),
    };
    sendSuccess(res, data);
  } catch (e) { next(e); }
});

/** PUT /api/landing — update the single landing document (upsert) */
router.put("/", async (req, res, next) => {
  try {
    const { heroLine1, heroLine2, subheading, videoBackground, contactId, phone, email, address, socials } =
      req.body as Record<string, unknown>;

    const landing = await Landing.findOneAndUpdate(
      {},
      { heroLine1, heroLine2, subheading, videoBackground, ...(contactId ? { contactId } : {}) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    // Contact info is owned by the Contact document — write it there, not on Landing.
    if (phone !== undefined || email !== undefined || address !== undefined || socials !== undefined) {
      const contact = landing.contactId
        ? await Contact.findById(landing.contactId)
        : await Contact.findOne();
      if (contact) {
        if (phone !== undefined) contact.phone = phone as string;
        if (email !== undefined) contact.email = email as string;
        if (address !== undefined) contact.address = address as { en: string; vi: string };
        if (socials !== undefined) {
          contact.socials = { ...contact.socials, ...(socials as Record<string, string>) };
        }
        await contact.save();
        // Keep the link in sync if it was missing.
        if (!landing.contactId) {
          landing.contactId = contact._id as mongoose.Types.ObjectId;
          await landing.save();
        }
      }
    }

    sendSuccess(res, landing);
  } catch (e) { next(e); }
});

export default router;
