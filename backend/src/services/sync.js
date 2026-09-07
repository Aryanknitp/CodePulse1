import { User } from "../models/User.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { Contest } from "../models/Contest.js";
import { SyncJob } from "../models/SyncJob.js";
import { saveProgressSnapshot } from "./analytics.js";
import { generateDailyRecommendations } from "./recommendations.js";
import { buildAiContext } from "./aiContext.js";
import { callAi } from "./aiClient.js";
import { AIInsight } from "../models/AIInsight.js";
import {
  getUserInfo,
  getUserRating,
  getUserStatus,
  getProblemset,
} from "./codeforces.js";

const stages = [
  "profile",
  "submissions",
  "problems",
  "contests",
  "analytics",
  "recommendations",
  "ai_insights",
];

function stageList() {
  return stages.map((id) => ({ id, status: "pending" }));
}

export async function syncUser(userId, { includeProblemset = true } = {}) {
  const user = await User.findById(userId);
  if (!user || !user.codeforcesVerified || !user.codeforcesHandle) return null;

  const job = await SyncJob.create({
    userId,
    status: "running",
    stages: stageList(),
  });
  const updateStage = async (id, status, error) => {
    const item = job.stages.find((s) => s.id === id);
    if (item) {
      item.status = status;
      if (error) item.error = error;
    }
    await job.save();
  };

  try {
    await User.findByIdAndUpdate(userId, {
      "cfProfile.syncStatus": "syncing",
      "cfProfile.lastSyncError": "",
    });
    await updateStage("profile", "running");
    const info = (await getUserInfo(user.codeforcesHandle))[0];
    if (!info) throw new Error("Codeforces handle not found.");
    await User.findByIdAndUpdate(userId, {
      cfProfile: {
        handle: info.handle,
        rating: info.rating,
        maxRating: info.maxRating,
        rank: info.rank,
        maxRank: info.maxRank,
        avatar: info.avatar || info.titlePhoto || "",
        lastSyncAt: new Date(),
        syncStatus: "syncing",
      },
    });
    await updateStage("profile", "complete");

    await updateStage("submissions", "running");
    const submissions = await getUserStatus(user.codeforcesHandle, 1000);
    const ops = [];
    for (const s of submissions) {
      const p = s.problem || {};
      ops.push({
        updateOne: {
          filter: { userId, submissionId: s.id },
          update: {
            userId,
            submissionId: s.id,
            contestId: s.contestId,
            problemContestId: p.contestId,
            problemIndex: p.index,
            problemName: p.name,
            problemRating: p.rating ?? null,
            tags: p.tags || [],
            verdict: s.verdict,
            language: s.programmingLanguage,
            timeMs: Number(s.timeConsumedMillis || 0),
            memoryKb: Number(s.memoryConsumedBytes || 0) / 1024,
            createdAt: new Date((s.creationTimeSeconds || 0) * 1000),
          },
          upsert: true,
        },
      });
    }
    if (ops.length) await Submission.bulkWrite(ops, { ordered: false });
    await updateStage("submissions", "complete");

    if (includeProblemset) {
      await updateStage("problems", "running");
      try {
        const problemset = await getProblemset();
        const problems = problemset?.problems || [];
        const stats = new Map(
          (problemset?.problemStatistics || []).map((s) => [
            `${s.contestId}:${s.index}`,
            s.solvedCount,
          ]),
        );
        const pOps = [];
        for (const p of problems) {
          if (p.contestId == null || !p.index) continue;
          pOps.push({
            updateOne: {
              filter: { contestId: p.contestId, index: p.index },
              update: {
                contestId: p.contestId,
                index: p.index,
                name: p.name,
                rating: p.rating ?? null,
                tags: p.tags || [],
                points: p.points ?? null,
                solvedCount: stats.get(`${p.contestId}:${p.index}`) ?? null,
                url: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
              },
              upsert: true,
            },
          });
        }
        if (pOps.length) await Problem.bulkWrite(pOps, { ordered: false });
        await updateStage("problems", "complete");
      } catch (err) {
        await updateStage("problems", "failed", err.message);
      }
    }

    await updateStage("contests", "running");
    const ratings = await getUserRating(user.codeforcesHandle);
    const solvedByContest = new Map();
    const seenByContest = new Map();
    for (const s of submissions) {
      const cid = s.contestId;
      if (cid == null) continue;
      if (!seenByContest.has(cid)) seenByContest.set(cid, new Set());
      const p = s.problem || {};
      const key = `${p.contestId}:${p.index}`;
      seenByContest.get(cid).add(key);
      if (s.verdict === "OK") {
        if (!solvedByContest.has(cid)) solvedByContest.set(cid, new Set());
        solvedByContest.get(cid).add(key);
      }
    }
    const contestOps = ratings.map((r) => ({
      updateOne: {
        filter: { userId, contestId: r.contestId },
        update: {
          userId,
          contestId: r.contestId,
          name: r.contestName,
          date: new Date((r.ratingUpdateTimeSeconds || 0) * 1000),
          rank: r.rank,
          ratingChange: r.newRating - r.oldRating,
          oldRating: r.oldRating,
          newRating: r.newRating,
          solved: solvedByContest.get(r.contestId)?.size || 0,
        },
        upsert: true,
      },
    }));
    if (contestOps.length)
      await Contest.bulkWrite(contestOps, { ordered: false });
    await updateStage("contests", "complete");

    const optionalStages = [
      [
        "analytics",
        async () => saveProgressSnapshot(userId, await User.findById(userId)),
      ],
      [
        "recommendations",
        async () => generateDailyRecommendations(await User.findById(userId)),
      ],
      [
        "ai_insights",
        async () => {
          const user = await User.findById(userId);
          const aiData = await callAi("/insights", {
            context: await buildAiContext(user),
          });
          await AIInsight.create({
            userId,
            type: "insight",
            content: aiData,
            generatedAt: new Date(),
          });
        },
      ],
    ];
    for (const [id, task] of optionalStages) {
      await updateStage(id, "running");
      try {
        await task();
        await updateStage(id, "complete");
      } catch (err) {
        await updateStage(id, "failed", err.message);
      }
    }

    job.status = "complete";
    job.completedAt = new Date();
    await job.save();
    await User.findByIdAndUpdate(userId, {
      "cfProfile.syncStatus": "up_to_date",
      "cfProfile.lastSyncAt": new Date(),
    });
    return job;
  } catch (err) {
    job.status = "failed";
    job.error = err.message;
    job.completedAt = new Date();
    await job.save();
    await User.findByIdAndUpdate(userId, {
      "cfProfile.syncStatus":
        err.statusCode === 429 ? "rate_limited" : "failed",
      "cfProfile.lastSyncError": err.message,
    });
    throw err;
  }
}
