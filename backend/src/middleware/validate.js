import { AppError } from "../utils/errors.js";

export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body?.[f] === undefined || String(req.body[f]).trim() === "",
    );
    if (missing.length)
      return next(
        new AppError(
          400,
          `Missing required fields: ${missing.join(", ")}`,
          "VALIDATION_ERROR",
        ),
      );
    next();
  };
}
