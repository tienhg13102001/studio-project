import type { ErrorRequestHandler } from "express";
import { sendError } from "../lib/response.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler: ErrorRequestHandler = (err: any, _req, res, _next) => {
  console.error("[Error]", err);

  // ── Mongoose ValidationError ───────────────────────────────────────────────
  // e.g. required field missing, enum mismatch, unique violation
  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => e.message as string)
      .join("; ");
    sendError(res, messages, 400);
    return;
  }

  // ── Mongoose CastError (invalid ObjectId) ──────────────────────────────────
  if (err.name === "CastError") {
    sendError(res, `Invalid value for field "${err.path}": ${err.value}`, 400);
    return;
  }

  // ── MongoDB duplicate key (E11000) ─────────────────────────────────────────
  if (err.code === 11000 || err.code === "11000") {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    sendError(res, `Duplicate value: "${field}" already exists`, 409);
    return;
  }

  // ── Generic error with a message ──────────────────────────────────────────
  if (err.message) {
    sendError(res, err.message, err.status ?? err.statusCode ?? 500);
    return;
  }

  sendError(res, "Internal server error", 500);
};

export default errorHandler;
