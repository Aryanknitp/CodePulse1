import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found.", code: "NOT_FOUND" });
}

export function errorHandler(err, req, res, next) {
  const isExpectedUnauthenticatedCheck =
    err.code === "UNAUTHORIZED" && req.path === "/me";
  if (!isExpectedUnauthenticatedCheck) {
    console.error("[api-error]", err);
  }
  const status = err.statusCode || 500;
  res.status(status).json({
    message:
      status >= 500 && env.nodeEnv === "production" && !err.expose
        ? "Internal server error."
        : err.message,
    code: err.code || "INTERNAL_ERROR",
    details: err.details,
  });
}
