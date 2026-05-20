import cors from "cors";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./middleware/errorHandler.ts";
import { sendError, sendSuccess } from "./lib/response.ts";
import featuredRouter from "./routes/featured.ts";
import landingRouter from "./routes/landing.ts";
import servicesRouter from "./routes/services.ts";
import contactRouter from "./routes/contact.ts";
import usersRouter from "./routes/users.ts";
import brandsRouter from "./routes/brands.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/api/public", express.static(join(__dirname, "../public")));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  sendSuccess(res, { status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/landing", landingRouter);
app.use("/api/services", servicesRouter);
app.use("/api/featured", featuredRouter);
app.use("/api/contact", contactRouter);
app.use("/api/users", usersRouter);
app.use("/api/brands", brandsRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, "Route not found", 404);
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
