/**
 * One-time migration for the Landing + TeamContent → PageContent merge.
 *
 * The two former models lived in their own collections (`landings`,
 * `teamcontents`). They are now a single `PageContent` model (collection
 * `pagecontents`) distinguished by `pageType`. This script copies the existing
 * documents across, stamping the right `pageType`.
 *
 * SAFE TO RUN MULTIPLE TIMES (idempotent — upserts by pageType, never deletes
 * the source collections). Run it against a DB BEFORE the new code starts
 * serving from it to avoid a gap where the landing page 404s.
 *
 *   yarn migrate-page-content
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../lib/db.ts";
import { PageContent } from "../models/PageContent.ts";

async function migrate() {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ No database connection");
    await disconnectDB();
    process.exit(1);
  }

  console.log("🔀 Migrating landings + teamcontents → pagecontents");

  // ── Landing ──
  const landing = await db.collection("landings").findOne({});
  if (landing) {
    const { _id, __v, ...rest } = landing;
    void _id;
    void __v;
    await PageContent.findOneAndUpdate(
      { pageType: "landing" },
      { ...rest, pageType: "landing" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log("  ✓ landing migrated");
  } else {
    console.log("  · no `landings` document found — skipped");
  }

  // ── Team (Who We Are) ──
  const team = await db.collection("teamcontents").findOne({});
  if (team) {
    const { _id, __v, ...rest } = team;
    void _id;
    void __v;
    await PageContent.findOneAndUpdate(
      { pageType: "team" },
      { ...rest, pageType: "team" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log("  ✓ team migrated");
  } else {
    console.log("  · no `teamcontents` document found — skipped");
  }

  console.log("✅ Done. (Old collections left intact; drop them manually once verified.)");
  await disconnectDB();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
