import cors from "cors";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.ts";
import { sendError, sendSuccess } from "./lib/response.ts";
import projectsRouter from "./routes/projects.ts";
import landingRouter from "./routes/landing.ts";
import servicesRouter from "./routes/services.ts";
import contactRouter from "./routes/contact.ts";
import usersRouter from "./routes/users.ts";
import brandsRouter from "./routes/brands.ts";
import authRouter from "./routes/auth.ts";
import uploadRouter from "./routes/upload.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

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
app.get("/api/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/landing", landingRouter);
app.use("/api/services", servicesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/users", usersRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
