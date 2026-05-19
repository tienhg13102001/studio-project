import type { ErrorRequestHandler } from "express";
import { sendError } from "../lib/response.ts";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[Error]", err);
  sendError(res, "Internal server error", 500);
};

export default errorHandler;
