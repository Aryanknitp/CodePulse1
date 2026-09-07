import { asyncHandler, AppError } from "../utils/errors.js";
import { Recommendation } from "../models/Recommendation.js";
import {
  generateDailyRecommendations,
  getRecommendations,
  getToday,
} from "../services/recommendations.js";

export const today = asyncHandler(async (req, res) => {
  let rows = await getToday(req.user._id);
  if (!rows.length) rows = await generateDailyRecommendations(req.user);
  res.json(rows);
});

export const list = asyncHandler(async (req, res) =>
  res.json(await getRecommendations(req.user._id, req.query)),
);

async function change(req, res, status) {
  const rec = await Recommendation.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!rec) throw new AppError(404, "Recommendation not found.", "NOT_FOUND");
  rec.status = status;
  if (status === "completed") rec.completedAt = new Date();
  await rec.save();
  res.json({ message: `Recommendation marked ${status}.`, status: rec.status });
}
export const complete = asyncHandler((req, res) =>
  change(req, res, "completed"),
);
export const skip = asyncHandler((req, res) => change(req, res, "skipped"));
export const notRelevant = asyncHandler((req, res) =>
  change(req, res, "not_relevant"),
);
export const history = asyncHandler(async (req, res) =>
  res.json(
    await getRecommendations(req.user._id, {
      ...req.query,
      status: req.query.status,
    }),
  ),
);
