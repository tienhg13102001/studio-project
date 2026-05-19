import "dotenv/config";
import app from "./app.ts";
import { connectDB } from "./lib/db.ts";

const PORT = Number(process.env.PORT) || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BeeZ API running on http://localhost:${PORT}`);
    console.log(`   GET /api/health`);
    console.log(`   GET /api/landing`);
    console.log(`   GET /api/services`);
    console.log(`   GET /api/featured`);
  });
});
