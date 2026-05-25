/**
 * clone-prod.ts
 *
 * Clones all data from a production MongoDB to a local/test MongoDB.
 * Does NOT copy binary files (videos, images) — only database documents.
 *
 * Usage:
 *   PROD_URI="mongodb://..." LOCAL_URI="mongodb://..." yarn clone-prod
 *   # or with .env.local:
 *   yarn clone-prod
 *
 * The script reads:
 *   PROD_URI  — production MongoDB connection string  (required)
 *   LOCAL_URI — local/test MongoDB connection string  (falls back to MONGODB_URI)
 *
 * Collections cloned: Landing, Service, Project, Contact, User, Brand
 * Users: passwords are preserved as-is (already hashed in prod). Admin
 *        account is kept so you can log in with the real credentials.
 */

import "dotenv/config";
import mongoose, { type Connection } from "mongoose";

// ─── Config ───────────────────────────────────────────────────────────────────
const PROD_URI = process.env.PROD_URI;
const LOCAL_URI = process.env.LOCAL_URI ?? process.env.MONGODB_URI;

if (!PROD_URI) {
  console.error("❌  PROD_URI env variable is required.");
  console.error("    Example: PROD_URI='mongodb+srv://user:pass@cluster/beez' yarn clone-prod");
  process.exit(1);
}
if (!LOCAL_URI) {
  console.error("❌  LOCAL_URI (or MONGODB_URI) env variable is required.");
  process.exit(1);
}

// Collections to clone — order matters (Service before Project due to refs)
const COLLECTIONS = [
  "landings",
  "services",
  "projects",
  "contacts",
  "users",
  "brands",
  "customers",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function openConnection(uri: string, name: string): Promise<Connection> {
  const conn = mongoose.createConnection(uri);
  await conn.asPromise();
  console.log(`✅  Connected to ${name}`);
  return conn;
}

async function cloneCollection(
  prodConn: Connection,
  localConn: Connection,
  collectionName: string,
): Promise<void> {
  const prodCol = prodConn.collection(collectionName);
  const localCol = localConn.collection(collectionName);

  const docs = await prodCol.find({}).toArray();

  if (docs.length === 0) {
    console.log(`   ⤷ ${collectionName}: empty — skipped`);
    return;
  }

  // Drop existing local data for this collection
  await localCol.deleteMany({});

  // Insert all production documents as-is (ObjectIds preserved)
  await localCol.insertMany(docs, { ordered: false });
  console.log(`   ✓ ${collectionName}: ${docs.length} document(s) cloned`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("🚀  Starting production → local clone...\n");
  console.log(`   PROD  : ${maskUri(PROD_URI!)}`);
  console.log(`   LOCAL : ${maskUri(LOCAL_URI!)}\n`);

  const [prodConn, localConn] = await Promise.all([
    openConnection(PROD_URI!, "production"),
    openConnection(LOCAL_URI!, "local"),
  ]);

  console.log("\n📦  Cloning collections...");

  for (const col of COLLECTIONS) {
    try {
      await cloneCollection(prodConn, localConn, col);
    } catch (err) {
      // Non-fatal: log and continue with other collections
      console.warn(`   ⚠️  ${col}: failed — ${(err as Error).message}`);
    }
  }

  await Promise.all([prodConn.close(), localConn.close()]);
  console.log("\n✅  Clone complete!");
  console.log("   ℹ️  Note: media files (videos, images) are NOT cloned.");
  console.log("   ℹ️  Run the app locally and media paths will resolve to production URLs");
  console.log("       if you set VITE_API_URL to the production API in front-end/.env\n");
}

/** Hide password in URI for safe logging */
function maskUri(uri: string): string {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

main().catch((err: Error) => {
  console.error("❌  Clone failed:", err.message);
  process.exit(1);
});
