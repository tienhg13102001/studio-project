/**
 * migrate-urls.ts
 *
 * One-time migration: converts all relative media paths stored in MongoDB
 * (/uploads/…, /videos/…, /images/…, /brands/…) into full absolute URLs.
 *
 * Usage:
 *   # Dry-run (preview changes, no writes):
 *   yarn migrate-urls
 *
 *   # Apply to local DB:
 *   APPLY=true yarn migrate-urls
 *
 *   # Apply to production DB:
 *   MONGODB_URI="mongodb+srv://..." APPLY=true yarn migrate-urls
 *
 * Env vars:
 *   MONGODB_URI  — target database (default: value from .env)
 *   PUBLIC_URL   — base URL to prepend (default: value from .env, e.g. https://beezvn.com)
 *   APPLY        — set to "true" to write changes; omit for dry-run
 */

import "dotenv/config";
import mongoose from "mongoose";

// ─── Config ───────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const PUBLIC_URL   = (process.env.PUBLIC_URL ?? "").replace(/\/$/, "");
const DRY_RUN      = process.env.APPLY !== "true";

if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set.");
  process.exit(1);
}
if (!PUBLIC_URL) {
  console.error("❌  PUBLIC_URL is not set (e.g. https://beezvn.com).");
  process.exit(1);
}

// ─── URL builder ──────────────────────────────────────────────────────────────
/**
 * Maps a relative path to its canonical full URL.
 * Returns null if the value is already a full URL or empty.
 */
function toFullUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return null; // already full URL

  if (value.startsWith("/videos/")) {
    return `${PUBLIC_URL}/api/videos${value.slice("/videos".length)}`;
  }
  // /uploads/…, /images/…, /brands/…, /public/… → /api/public/…
  return `${PUBLIC_URL}/api/public${value}`;
}

// ─── Migration helpers ────────────────────────────────────────────────────────
let totalUpdated = 0;

async function migrateStringField(
  col: mongoose.Collection,
  filter: Record<string, unknown>,
  field: string,
): Promise<void> {
  const docs = await col.find(filter).toArray();
  for (const doc of docs) {
    const raw = doc[field] as string | undefined;
    const newUrl = toFullUrl(raw);
    if (!newUrl) continue;

    console.log(`  [${col.collectionName}] ${field}: "${raw}" → "${newUrl}"`);
    if (!DRY_RUN) {
      await col.updateOne({ _id: doc._id }, { $set: { [field]: newUrl } });
    }
    totalUpdated++;
  }
}

async function migrateArrayField(
  col: mongoose.Collection,
  filter: Record<string, unknown>,
  field: string,
): Promise<void> {
  const docs = await col.find(filter).toArray();
  for (const doc of docs) {
    const arr = doc[field] as string[] | undefined;
    if (!Array.isArray(arr) || arr.length === 0) continue;

    const updated = arr.map((v) => toFullUrl(v) ?? v);
    const hasChanges = updated.some((v, i) => v !== arr[i]);
    if (!hasChanges) continue;

    arr.forEach((old, i) => {
      if (old !== updated[i]) {
        console.log(`  [${col.collectionName}] ${field}[${i}]: "${old}" → "${updated[i]}"`);
      }
    });

    if (!DRY_RUN) {
      await col.updateOne({ _id: doc._id }, { $set: { [field]: updated } });
    }
    totalUpdated += updated.filter((v, i) => v !== arr[i]).length;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log("🔍  DRY-RUN mode — no changes will be written.");
    console.log("    Run with APPLY=true to apply changes.\n");
  } else {
    console.log("✏️   APPLY mode — changes WILL be written to the database.\n");
  }

  console.log(`📡  Connecting to: ${maskUri(MONGODB_URI!)}`);
  console.log(`🌐  Public URL   : ${PUBLIC_URL}\n`);

  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db!;

  // ── projects ──────────────────────────────────────────────────────────────
  console.log("📦  Migrating: projects");
  const projects = db.collection("projects");
  await migrateStringField(projects, {
    thumbnailImage: { $not: /^https?:\/\// }
  }, "thumbnailImage");
  await migrateStringField(projects, {
    video: { $exists: true, $not: /^https?:\/\// }
  }, "video");
  await migrateArrayField(projects, {
    photos: { $exists: true, $not: { $size: 0 } }
  }, "photos");

  // ── services ──────────────────────────────────────────────────────────────
  console.log("📦  Migrating: services");
  const services = db.collection("services");
  await migrateStringField(services, {
    thumbnailImage: { $not: /^https?:\/\// }
  }, "thumbnailImage");

  // ── users ─────────────────────────────────────────────────────────────────
  console.log("📦  Migrating: users");
  const users = db.collection("users");
  await migrateStringField(users, {
    photo: { $exists: true, $not: /^https?:\/\// }
  }, "photo");

  // ── brands ────────────────────────────────────────────────────────────────
  console.log("📦  Migrating: brands");
  const brands = db.collection("brands");
  await migrateStringField(brands, {
    logo: { $not: /^https?:\/\// }
  }, "logo");

  // ── landings ──────────────────────────────────────────────────────────────
  console.log("📦  Migrating: landings");
  const landings = db.collection("landings");
  await migrateStringField(landings, {
    videoBackground: { $not: /^https?:\/\// }
  }, "videoBackground");

  // ── Summary ───────────────────────────────────────────────────────────────
  await mongoose.disconnect();

  console.log(`\n${DRY_RUN ? "🔍" : "✅"}  Migration ${DRY_RUN ? "preview" : "complete"}: ${totalUpdated} field(s) ${DRY_RUN ? "would be" : "were"} updated.`);

  if (DRY_RUN && totalUpdated > 0) {
    console.log("    Run with APPLY=true to apply the above changes.");
  }
  if (totalUpdated === 0) {
    console.log("    Nothing to migrate — all paths are already full URLs.");
  }
}

function maskUri(uri: string): string {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

main().catch((err: Error) => {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
});
