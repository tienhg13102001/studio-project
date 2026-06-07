import mongoose from "mongoose";
import { Router } from "express";
import { PageContent } from "../models/PageContent.ts";
import { Contact } from "../models/Contact.ts";
import { sendError, sendSuccess } from "../lib/response.ts";
import { generateQrDataUrl, SOCIAL_PLATFORMS, type SocialPlatform } from "../lib/qr.ts";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const landing = await PageContent.findOne({ pageType: "landing" });
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
        socialQrs: {
          zalo: contact.socialQrs?.zalo,
          facebook: contact.socialQrs?.facebook,
          instagram: contact.socialQrs?.instagram,
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

    const landing = await PageContent.findOneAndUpdate(
      { pageType: "landing" },
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

/**
 * POST /api/landing/social-qr — generate a QR code for one social URL, persist
 * both the URL and the QR (PNG data-URL) on the Contact, and return the QR.
 * Body: { platform: "zalo" | "facebook" | "instagram" | ..., url: string }
 */
router.post("/social-qr", async (req, res, next) => {
  try {
    const { platform, url } = req.body as { platform?: string; url?: string };

    if (!platform || !SOCIAL_PLATFORMS.includes(platform as SocialPlatform)) {
      sendError(res, "Invalid social platform", 400);
      return;
    }
    const trimmed = (url ?? "").trim();
    if (!trimmed) { sendError(res, "URL is required to generate a QR code", 400); return; }

    const landing = await PageContent.findOne({ pageType: "landing" });
    const contact = landing?.contactId
      ? await Contact.findById(landing.contactId)
      : await Contact.findOne();
    if (!contact) { sendError(res, "Contact not found", 404); return; }

    const qr = await generateQrDataUrl(trimmed);
    const key = platform as SocialPlatform;
    // Keep the stored URL and its QR consistent.
    contact.socials = { ...contact.socials, [key]: trimmed };
    contact.socialQrs = { ...contact.socialQrs, [key]: qr };
    await contact.save();

    sendSuccess(res, { platform: key, url: trimmed, qr });
  } catch (e) { next(e); }
});

export default router;
