import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { asyncHandler } from "../utils/errors.js";
import { pagination, pageMeta } from "../utils/pagination.js";
import { Recommendation } from "../models/Recommendation.js";

export const list = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = pagination(req.query.page, 20);
  const filter = {};
  if (req.query.search)
    filter.name = { $regex: req.query.search, $options: "i" };
  if (req.query.topic) filter.tags = req.query.topic;
  if (req.query.ratingMin || req.query.ratingMax)
    filter.rating = {
      ...(req.query.ratingMin ? { $gte: Number(req.query.ratingMin) } : {}),
      ...(req.query.ratingMax ? { $lte: Number(req.query.ratingMax) } : {}),
    };
  const userSolved =
    req.query.solved === undefined
      ? null
      : new Set(
          (
            await Submission.find({ userId: req.user._id, verdict: "OK" })
              .select("problemContestId problemIndex")
              .lean()
          ).map((s) => `${s.problemContestId}:${s.problemIndex}`),
        );
  let rows = await Problem.find(filter)
    .sort({ rating: 1, contestId: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();
  if (userSolved) {
    rows = rows.filter(
      (p) =>
        userSolved.has(`${p.contestId}:${p.index}`) ===
        (req.query.solved === "true"),
    );
  }
  const total = await Problem.countDocuments(filter);
  res.json({
    problems: rows.map((p) => ({
      id: String(p._id),
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating,
      tags: p.tags,
      url: p.url,
    })),
    ...pageMeta(total, page, pageSize),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const p = await Problem.findById(req.params.id).lean();
  if (!p)
    return res
      .status(404)
      .json({ message: "Problem not found.", code: "NOT_FOUND" });
  res.json({ problem: { ...p, id: String(p._id) } });
});

export const history = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = pagination(req.query.page, 20);
  const filter = { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const total = await Recommendation.countDocuments(filter);
  const rows = await Recommendation.find(filter)
    .populate("problemId")
    .sort({ recommendedAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();
  res.json({
    history: rows.map((r) => ({
      id: String(r._id),
      problemName: r.problemName,
      topic: r.tags?.[0] || r.problemId?.tags?.[0] || "—",
      difficulty: r.rating,
      recommendedAt: r.recommendedAt,
      status: r.status,
      completedAt: r.completedAt,
      url: r.problemId?.url,
    })),
    ...pageMeta(total, page, pageSize),
  });
});
