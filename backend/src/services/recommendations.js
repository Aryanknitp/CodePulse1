import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { Recommendation } from "../models/Recommendation.js";
import { dayKey } from "../utils/date.js";
import { getTopics } from "./analytics.js";

function priorityFor(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export async function generateDailyRecommendations(user) {
  if (!user.codeforcesVerified) return [];
  const topics = await getTopics(user._id);
  const weak = topics
    .filter((t) => t.strengthScore < 70)
    .sort((a, b) => a.strengthScore - b.strengthScore);
  const solved = await Submission.find({ userId: user._id, verdict: "OK" })
    .select("problemContestId problemIndex")
    .lean();
  const solvedKeys = new Set(
    solved.map((s) => `${s.problemContestId}:${s.problemIndex}`),
  );
  const existing = await Recommendation.find({
    userId: user._id,
    dayKey: dayKey(),
  })
    .select("problemId")
    .lean();
  const existingIds = new Set(existing.map((x) => String(x.problemId)));

  const targetMin = Math.max(800, (user.cfProfile?.rating || 1200) - 300);
  const targetMax = Math.min(3500, (user.cfProfile?.rating || 1200) + 200);
  const recommendations = [];

  for (const topic of weak.slice(0, 5)) {
    const candidates = await Problem.find({
      rating: { $gte: targetMin, $lte: targetMax },
      tags: topic.topic,
      _id: { $nin: [...existingIds] },
    })
      .sort({ rating: 1 })
      .limit(20)
      .lean();
    for (const p of candidates) {
      if (solvedKeys.has(`${p.contestId}:${p.index}`)) continue;
      const reason = `${topic.topic} is one of your weaker areas (score ${topic.strengthScore}/100) and this ${p.rating || "unrated"}-rated problem targets it directly.`;
      recommendations.push({
        userId: user._id,
        problemId: p._id,
        problemName: p.name,
        rating: p.rating,
        tags: p.tags,
        reason,
        priority: priorityFor(100 - topic.strengthScore),
        status: "recommended",
        dayKey: dayKey(),
      });
      if (recommendations.length >= 5) break;
    }
    if (recommendations.length >= 5) break;
  }

  if (recommendations.length < 5) {
    const fallback = await Problem.find({
      rating: { $gte: targetMin, $lte: targetMax },
      _id: { $nin: [...existingIds] },
    })
      .sort({ rating: 1 })
      .limit(30)
      .lean();
    for (const p of fallback) {
      if (recommendations.length >= 5) break;
      if (solvedKeys.has(`${p.contestId}:${p.index}`)) continue;
      recommendations.push({
        userId: user._id,
        problemId: p._id,
        problemName: p.name,
        rating: p.rating,
        tags: p.tags,
        reason: `Selected near your current rating to broaden practice while avoiding already solved problems.`,
        priority: "low",
        status: "recommended",
        dayKey: dayKey(),
      });
    }
  }

  if (recommendations.length) {
    try {
      await Recommendation.insertMany(recommendations, { ordered: false });
    } catch {}
  }
  return Recommendation.find({ userId: user._id, dayKey: dayKey() })
    .sort({ priority: 1, rating: 1 })
    .lean();
}

export async function getRecommendations(userId, options = {}) {
  const filter = { userId };
  if (options.status) filter.status = options.status;
  const page = Math.max(1, Number(options.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(options.pageSize || 20)));
  const total = await Recommendation.countDocuments(filter);
  const recommendations = await Recommendation.find(filter)
    .populate("problemId")
    .sort({ recommendedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return {
    recommendations: recommendations.map(formatRecommendation),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getToday(userId) {
  const existing = await Recommendation.find({ userId, dayKey: dayKey() })
    .populate("problemId")
    .sort({ rating: 1 })
    .lean();
  return existing.length ? existing.map(formatRecommendation) : [];
}

export function formatRecommendation(r) {
  const url =
    r.problemId?.url ||
    `https://codeforces.com/contest/${r.problemId?.contestId}/problem/${r.problemId?.index}`;
  return {
    id: String(r._id),
    problemId: String(r.problemId?._id || r.problemId),
    problemName: r.problemName,
    rating: r.rating,
    tags: r.tags || [],
    reason: r.reason,
    priority: r.priority,
    status: r.status,
    url,
  };
}
