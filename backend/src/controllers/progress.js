import { asyncHandler } from "../utils/errors.js";
import { getProgress } from "../services/analytics.js";
export const progress = asyncHandler(async (req, res) =>
  res.json(await getProgress(req.user._id, req.query.period || "month")),
);
