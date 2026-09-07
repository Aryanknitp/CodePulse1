import { asyncHandler } from "../utils/errors.js";
import * as A from "../services/analytics.js";
import { Submission } from "../models/Submission.js";
import { Contest } from "../models/Contest.js";
import { pagination, pageMeta } from "../utils/pagination.js";
import { periodStart } from "../utils/date.js";

export const overview = asyncHandler(async (req, res) =>
  res.json(await A.getOverview(req.user, req.query.period || "all")),
);

export const rating = asyncHandler(async (req, res) => {
  const data = await A.getRating(req.user, req.query.period || "all");
  res.json(data || {});
});

export const difficulty = asyncHandler(async (req, res) =>
  res.json(await A.getDifficulty(req.user._id)),
);

export const topics = asyncHandler(async (req, res) =>
  res.json({ topics: await A.getTopics(req.user._id) }),
);

export const submissions = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = pagination(req.query.page, 20);
  const filter = { userId: req.user._id };
  if (req.query.verdict) filter.verdict = req.query.verdict;
  const start = periodStart(req.query.period);
  if (start) filter.createdAt = { $gte: start };
  const total = await Submission.countDocuments(filter);
  const rows = await Submission.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();
  res.json({
    submissions: rows.map((s) => ({
      id: String(s._id),
      problemName: s.problemName,
      problemRating: s.problemRating,
      verdict: s.verdict,
      language: s.language,
      timeMs: s.timeMs,
      memoryKb: s.memoryKb,
      createdAt: s.createdAt,
      tags: s.tags,
    })),
    ...pageMeta(total, page, pageSize),
  });
});

export const contests = asyncHandler(async (req, res) => {
  const { page, pageSize, skip } = pagination(req.query.page, 20);
  const filter = { userId: req.user._id };
  const total = await Contest.countDocuments(filter);
  const rows = await Contest.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();
  const summaryRows = await Contest.find(filter)
    .select("rank ratingChange")
    .lean();
  const ranks = summaryRows
    .map((contest) => contest.rank)
    .filter((rank) => Number.isFinite(rank));
  const totalRatingChange = summaryRows.reduce(
    (sum, contest) => sum + (contest.ratingChange || 0),
    0,
  );
  res.json({
    contestCount: total,
    bestRank: ranks.length ? Math.min(...ranks) : null,
    avgRank: ranks.length
      ? Math.round(ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length)
      : null,
    totalRatingChange,
    contests: rows.map((c) => ({
      id: String(c._id),
      contestId: c.contestId,
      name: c.name,
      date: c.date,
      rank: c.rank,
      ratingChange: c.ratingChange,
      solved: c.solved,
      problems: c.problems || [],
    })),
    ...pageMeta(total, page, pageSize),
  });
});
