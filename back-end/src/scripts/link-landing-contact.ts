/**
 * link-landing-contact.ts
 *
 * One-time migration for the Landing ↔ Contact refactor.
 *
 * Contact is now the single source of truth for phone/email/address/socials.
 * Landing references it via `contactId` instead of storing its own copies.
 *
 * This script, for every Landing document:
 *   1. Sets `contactId` to the linked Contact (the first Contact, if unset).
 *   2. Removes the now-stale duplicate fields (phone, email, address, socials)
 *      from the Landing document.
 *
 * Usage:
 *   # Dry-run (preview changes, no writes):
 *   yarn tsx src/scripts/link-landing-contact.ts
 *
 *   # Apply to local DB:
 *   APPLY=true yarn tsx src/scripts/link-landing-contact.ts
 *
 *   # Apply to production DB:
 *   MONGODB_URI="mongodb+srv://..." APPLY=true yarn tsx src/scripts/link-landing-contact.ts
 *
 * Env vars:
 *   MONGODB_URI  — target database (default: value from .env)
 *   APPLY        — set to "true" to write changes; omit for dry-run
 */

import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { PageContent } from "../models/PageContent.ts";
import { Contact } from "../models/Contact.ts";

const DRY_RUN = process.env.APPLY !== "true";

const STALE_FIELDS = ["phone", "email", "address", "socials"] as const;

async function migrate() {
  await connectDB();
  console.log(DRY_RUN ? "🔍 DRY RUN (no writes)" : "✍️  APPLYING changes");

  const contact = await Contact.findOne();
  if (!contact) {
    console.error("❌ No Contact document found — create one before running this migration.");
    await disconnectDB();
    process.exit(1);
  }
  console.log(`  → Using Contact ${contact._id.toString()} (${contact.email})`);

  // Use the raw collection so we can read & $unset the legacy fields that are
  // no longer part of the schema. (Legacy one-off migration — landing content
  // now lives in PageContent with pageType "landing".)
  const collection = PageContent.collection;
  const landings = await collection.find({ pageType: "landing" }).toArray();
  console.log(`  → Found ${landings.length} Landing document(s)`);

  let linked = 0;
  let cleaned = 0;

  for (const doc of landings) {
    const set: Record<string, unknown> = {};
    const unset: Record<string, "">  = {};

    if (!doc.contactId) {
      set.contactId = contact._id;
      linked++;
    }

    const staleFound = STALE_FIELDS.filter((f) => doc[f] !== undefined);
    for (const f of staleFound) unset[f] = "";
    if (staleFound.length > 0) cleaned++;

    const hasChanges = Object.keys(set).length > 0 || Object.keys(unset).length > 0;
    if (!hasChanges) {
      console.log(`  · Landing ${doc._id.toString()} — already migrated, skipped`);
      continue;
    }

    console.log(
      `  · Landing ${doc._id.toString()}` +
        (set.contactId ? ` — link → contactId` : "") +
        (staleFound.length ? ` — remove [${staleFound.join(", ")}]` : ""),
    );

    if (!DRY_RUN) {
      const update: Record<string, unknown> = {};
      if (Object.keys(set).length) update.$set = set;
      if (Object.keys(unset).length) update.$unset = unset;
      await collection.updateOne({ _id: doc._id }, update);
    }
  }

  console.log(
    `\n${DRY_RUN ? "Would link" : "Linked"} ${linked} and ` +
      `${DRY_RUN ? "would clean" : "cleaned"} ${cleaned} Landing document(s).`,
  );
  if (DRY_RUN) console.log("Run again with APPLY=true to write changes.");

  await disconnectDB();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
