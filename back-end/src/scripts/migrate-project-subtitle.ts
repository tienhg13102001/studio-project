/**
 * migrate-project-subtitle.ts
 *
 * One-time migration for the Project.subtitle refactor (string → { en, vi }).
 *
 * For every Project whose `subtitle` is still a plain string, converts it to
 * a localized object `{ en: <value>, vi: <value> }`. Idempotent: documents
 * already in object form are skipped.
 *
 * Usage:
 *   # Dry-run (preview, no writes):
 *   yarn tsx src/scripts/migrate-project-subtitle.ts
 *
 *   # Apply to local DB:
 *   APPLY=true yarn tsx src/scripts/migrate-project-subtitle.ts
 *
 *   # Apply to production DB:
 *   MONGODB_URI="mongodb+srv://..." APPLY=true yarn tsx src/scripts/migrate-project-subtitle.ts
 */

import "dotenv/config";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { Project } from "../models/Project.ts";

const DRY_RUN = process.env.APPLY !== "true";

async function migrate() {
  await connectDB();
  console.log(DRY_RUN ? "🔍 DRY RUN (no writes)" : "✍️  APPLYING changes");

  // Use the raw collection so we can read the legacy string shape.
  const collection = Project.collection;
  const docs = await collection.find({}).toArray();
  console.log(`  → Found ${docs.length} Project document(s)`);

  let converted = 0;
  for (const doc of docs) {
    const sub = doc.subtitle as unknown;
    if (typeof sub !== "string") {
      continue; // already localized (or missing) — skip
    }
    converted++;
    console.log(`  · Project ${doc._id.toString()} — subtitle "${sub}" → { en, vi }`);
    if (!DRY_RUN) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { subtitle: { en: sub, vi: sub } } },
      );
    }
  }

  console.log(`\n${DRY_RUN ? "Would convert" : "Converted"} ${converted} Project document(s).`);
  if (DRY_RUN) console.log("Run again with APPLY=true to write changes.");

  await disconnectDB();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
