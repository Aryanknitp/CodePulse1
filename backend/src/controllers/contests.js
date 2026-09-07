import { asyncHandler, AppError } from "../utils/errors.js";
import { Contest } from "../models/Contest.js";
import { getContestStandings } from "../services/codeforces.js";
import { Problem } from "../models/Problem.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1)),
    pageSize = 20;
  const filter = { userId: req.user._id };
  const total = await Contest.countDocuments(filter);
  const rows = await Contest.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  res.json({
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
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const detail = asyncHandler(async (req, res) => {
  const c = await Contest.findOne({ _id: req.params.id, userId: req.user._id });
  if (!c) throw new AppError(404, "Contest not found.", "NOT_FOUND");
  if (!c.problems?.length) {
    const standings = await getContestStandings(
      c.contestId,
      req.user.codeforcesHandle,
      1,
    );
    const row = standings?.rows?.[0];
    if (row?.problemResults && standings?.problems) {
      c.problems = standings.problems.map((p, i) => ({
        name: p.name,
        index: p.index,
        rating: p.rating,
        tags: p.tags,
        url: `https://codeforces.com/contest/${c.contestId}/problem/${p.index}`,
        solved: Number(row.problemResults?.[i]?.points || 0) > 0,
      }));
      c.solved = c.problems.filter((p) => p.solved).length;
      await c.save();
    }
  }
  res.json({ contest: { ...c.toObject(), id: String(c._id) } });
});
