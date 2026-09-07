import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { Recommendation } from "../models/Recommendation.js";
import { Contest } from "../models/Contest.js";
import { User } from "../models/User.js";
import { ProgressSnapshot } from "../models/ProgressSnapshot.js";
import { startOfDay, periodStart } from "../utils/date.js";

export async function uniqueSolvedCount(userId, extraFilter = {}) {
  const rows = await Submission.aggregate([
    { $match: { userId, verdict: "OK", ...extraFilter } },
    {
      $group: {
        _id: { contestId: "$problemContestId", index: "$problemIndex" },
      },
    },
    { $count: "count" },
  ]);
  return rows[0]?.count || 0;
}

export async function calculateStreak(userId) {
  const rows = await Submission.aggregate([
    { $match: { userId, verdict: "OK" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  if (!rows.length) return 0;
  const days = new Set(rows.map((r) => r._id));
  const today = startOfDay();
  let cursor = today;
  if (!days.has(cursor.toISOString().slice(0, 10)))
    cursor = new Date(cursor.getTime() - 86400000);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export async function getOverview(user, period = "all") {
  if (!user.codeforcesVerified) return null;
  const since = new Date(Date.now() - 3650 * 86400000);
  const solvedCount = await uniqueSolvedCount(user._id, {
    createdAt: { $gte: since },
  });
  const submissionCount = await Submission.countDocuments({ userId: user._id });
  const accepted = await Submission.countDocuments({
    userId: user._id,
    verdict: "OK",
  });
  const languageRows = await Submission.aggregate([
    { $match: { userId: user._id, language: { $type: "string", $ne: "" } } },
    { $group: { _id: "$language", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  const contests = await Contest.countDocuments({ userId: user._id });
  const streak = await calculateStreak(user._id);
  const ratingStart = periodStart(period);

  const ratings = await Contest.find({
    userId: user._id,
    ...(ratingStart ? { date: { $gte: ratingStart } } : {}),
  })
    .sort({ date: 1 })
    .select("date newRating ratingChange contestId name")
    .lean();
  const topicAnalytics = await getTopics(user._id);
  return {
    rating: user.cfProfile?.rating,
    maxRating: user.cfProfile?.maxRating,
    solvedCount,
    submissionCount,
    acceptanceRate: submissionCount
      ? Number(((accepted / submissionCount) * 100).toFixed(1))
      : 0,
    contestCount: contests,
    streak,
    avgDifficulty: await averageSolvedRating(user._id),
    ratingHistory: ratings.map((r) => ({
      date: r.date,
      rating: r.newRating,
      ratingChange: r.ratingChange,
      contestId: r.contestId,
    })),
    topicAnalytics: topicAnalytics.slice(0, 10),
    preferredLanguage: languageRows[0]?._id || null,
  };
}

async function averageSolvedRating(userId) {
  const rows = await Submission.aggregate([
    { $match: { userId, verdict: "OK", problemRating: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: "$problemRating" } } },
  ]);
  return rows[0] ? Math.round(rows[0].avg) : null;
}

export async function getRating(user, period = "all") {
  if (!user.codeforcesVerified) return null;
  const start = periodStart(period);
  const filter = { userId: user._id };
  if (start) filter.date = { $gte: start };
  const ratings = await Contest.find(filter).sort({ date: 1 }).lean();
  let change = 0;
  if (ratings.length)
    change = ratings.reduce((sum, r) => sum + (r.ratingChange || 0), 0);
  return {
    currentRating: user.cfProfile?.rating,
    rating: user.cfProfile?.rating,
    maxRating: user.cfProfile?.maxRating,
    ratingChange: change,
    history: ratings.map((r) => ({
      date: r.date,
      rating: r.newRating,
      ratingChange: r.ratingChange,
      name: r.name,
      contestId: r.contestId,
    })),
  };
}

export async function getDifficulty(userId) {
  const agg = await Submission.aggregate([
    { $match: { userId, problemRating: { $ne: null } } },
    {
      $group: {
        _id: "$problemRating",
        attempted: { $sum: 1 },
        solved: { $sum: { $cond: [{ $eq: ["$verdict", "OK"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const distribution = agg.map((r) => ({
    rating: r._id,
    attempted: r.attempted,
    solved: r.solved,
  }));
  const solvedRatings = distribution.flatMap((d) =>
    Array.from({ length: d.solved }, () => d.rating),
  );
  const avg = solvedRatings.length
    ? Math.round(
        solvedRatings.reduce((a, b) => a + b, 0) / solvedRatings.length,
      )
    : null;
  const max = solvedRatings.length ? Math.max(...solvedRatings) : null;
  return {
    avgSolvedRating: avg,
    hardestSolved: max,
    recommendedNextDifficulty: userSuggestedDifficulty(avg),
    distribution,
  };
}

function userSuggestedDifficulty(avg) {
  if (!avg) return null;
  return Math.max(800, Math.round(avg / 100) * 100 + 100);
}

export async function getTopics(userId) {
  const rows = await Submission.aggregate([
    { $match: { userId } },
    { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: "$tags",
        attempts: { $sum: 1 },
        solved: { $sum: { $cond: [{ $eq: ["$verdict", "OK"] }, 1, 0] } },
        avgRating: { $avg: "$problemRating" },
        last30: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $gte: ["$createdAt", new Date(Date.now() - 30 * 86400000)],
                  },
                  { $eq: ["$verdict", "OK"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { attempts: -1 } },
  ]);
  return rows.map((r) => {
    const successRate = r.attempts
      ? Number(((r.solved / r.attempts) * 100).toFixed(1))
      : 0;
    const volume = Math.min(100, r.attempts * 2);
    const difficulty = r.avgRating ? Math.min(100, r.avgRating / 20) : 0;
    const recency = Math.min(100, r.last30 * 5);
    const strengthScore = Math.round(
      successRate * 0.45 + difficulty * 0.25 + volume * 0.15 + recency * 0.15,
    );
    const weaknessReason =
      strengthScore < 56
        ? `Your success rate is ${successRate}% across ${r.attempts} attempts in ${r._id}. Focus on fundamentals and smaller difficulty steps.`
        : "";
    return {
      topic: r._id,
      attempts: r.attempts,
      solved: r.solved,
      successRate,
      avgRating: r.avgRating ? Math.round(r.avgRating) : null,
      recentSuccess: r.last30,
      strengthScore,
      weaknessReason,
    };
  });
}

export async function generateTopicImprovement(userId, start) {
  const topics = await getTopics(userId);
  return topics.map((t) => ({
    topic: t.topic,
    currentScore: t.strengthScore,
    previousScore: t.strengthScore,
    change: 0,
  }));
}

export async function getProgress(userId, period = "month") {
  const start = periodStart(period);
  const match = { userId };
  if (start) match.createdAt = { $gte: start };
  const solvedThisPeriod = await uniqueSolvedCount(
    userId,
    start ? { createdAt: { $gte: start } } : {},
  );
  const recommendationFilter = { userId, status: "completed" };
  if (start) recommendationFilter.completedAt = { $gte: start };
  const recommendationsCompleted =
    await Recommendation.countDocuments(recommendationFilter);

  const startRating = await Contest.findOne({
    userId,
    ...(start ? { date: { $gte: start } } : {}),
  })
    .sort({ date: 1 })
    .lean();
  const ratingChange = startRating
    ? (await User.findById(userId).lean())?.cfProfile?.rating -
      (startRating.oldRating || 0)
    : 0;
  const dailyAgg = await Submission.aggregate([
    { $match: { ...match, verdict: "OK" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        solved: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const activity = new Map(dailyAgg.map((d) => [d._id, d.solved]));
  const activityDays = [];
  const firstDay = start
    ? new Date(start)
    : new Date(Date.now() - 29 * 86400000);
  firstDay.setUTCHours(0, 0, 0, 0);
  const lastDay = new Date();
  lastDay.setUTCHours(0, 0, 0, 0);
  for (
    const day = new Date(firstDay);
    day <= lastDay;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const date = day.toISOString().slice(0, 10);
    activityDays.push({ date, solved: activity.get(date) || 0 });
  }
  return {
    ratingChange: Number(ratingChange || 0),
    solvedThisPeriod,
    streak: await calculateStreak(userId),
    recommendationsCompleted,
    dailyActivity: activityDays,
    topicImprovement: await generateTopicImprovement(userId, start),
  };
}

export async function saveProgressSnapshot(userId, user) {
  const date = startOfDay();
  const solvedCount = await uniqueSolvedCount(userId);
  const acceptedSubmissions = await Submission.countDocuments({
    userId,
    verdict: "OK",
  });
  const totalSubmissions = await Submission.countDocuments({ userId });
  await ProgressSnapshot.findOneAndUpdate(
    { userId, date },
    {
      userId,
      date,
      solvedCount,
      rating: user.cfProfile?.rating ?? null,
      acceptedSubmissions,
      totalSubmissions,
    },
    { upsert: true, new: true },
  );
}
