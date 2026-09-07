import {
  getOverview,
  getTopics,
  getDifficulty,
  getProgress,
} from "./analytics.js";
import { Contest } from "../models/Contest.js";
import { Recommendation } from "../models/Recommendation.js";

export async function buildAiContext(user) {
  const [overview, topics, difficulty, progress, contests, recs] =
    await Promise.all([
      getOverview(user),
      getTopics(user._id),
      getDifficulty(user._id),
      getProgress(user._id, "30d"),
      Contest.find({ userId: user._id }).sort({ date: -1 }).limit(10).lean(),
      Recommendation.find({ userId: user._id })
        .sort({ recommendedAt: -1 })
        .limit(10)
        .lean(),
    ]);
  return {
    user: {
      name: user.name,
      codeforcesHandle: user.codeforcesHandle,
      emailVerified: user.emailVerified,
    },
    overview,
    topics,
    difficulty,
    progress,
    recentContests: contests,
    recentRecommendations: recs,
  };
}
