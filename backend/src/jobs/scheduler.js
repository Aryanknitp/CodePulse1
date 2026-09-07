import cron from "node-cron";
import { User } from "../models/User.js";
import { syncUser } from "../services/sync.js";
import { generateDailyRecommendations } from "../services/recommendations.js";

export function startScheduler() {
  // Run every 30 minutes by default. Jobs for multiple users are processed sequentially.
  const expression = `*/${Math.max(5, Math.min(59, Number(process.env.CODEFORCES_SYNC_INTERVAL_MINUTES || 30)))} * * * *`;
  cron.schedule(expression, async () => {
    const users = await User.find({
      emailVerified: true,
      codeforcesVerified: true,
      autoSync: true,
    }).select("_id");
    for (const user of users) {
      try {
        await syncUser(user._id, { includeProblemset: false });
        await generateDailyRecommendations(await User.findById(user._id));
      } catch (err) {
        console.error("[scheduler] sync failed", String(user._id), err.message);
      }
    }
  });
  console.log(
    "[scheduler] background synchronization enabled (every 30 minutes)",
  );
}
