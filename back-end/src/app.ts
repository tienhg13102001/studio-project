import cors from "cors";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.ts";
import { sendError } from "./lib/response.ts";
import apiRouter from "./routes/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Sau nginx/Cloudflare → tin proxy để req.ip là IP thật của client.
app.set("trust proxy", true);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/api/public", express.static(join(__dirname, "../public")));

// Dedicated video endpoint: express.static supports HTTP Range natively (seek/scrub),
// and we apply a long immutable cache because filenames are unique (UUID-based).
app.use(
  "/api/videos",
  express.static(join(__dirname, "../public/videos"), {
    maxAge: "30d",
    immutable: true,
    acceptRanges: true,
    fallthrough: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    },
  }),
);

// ─── Routes ──────────────────────────────────────────────────────────────────
// Toàn bộ endpoint khai báo trong routes/index.ts và mount chung dưới /api.
app.use("/api", apiRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
