import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found.", code: "NOT_FOUND" });
}

export function errorHandler(err, req, res, next) {
  console.error("[api-error]", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message:
      status >= 500 && env.nodeEnv === "production"
        ? "Internal server error."
        : err.message,
    code: err.code || "INTERNAL_ERROR",
    details: err.details,
  });
}
