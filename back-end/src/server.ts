import "dotenv/config";
import { connectDB } from "./lib/db.ts";
import app from "./app.ts";

const PORT = Number(process.env.PORT) || 5002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BeeZ API running on http://localhost:${PORT}`);
    console.log(`   GET /api/health`);
    console.log(`   GET /api/landing`);
    console.log(`   GET /api/services`);
    console.log(`   GET /api/featured`);
  });
});
