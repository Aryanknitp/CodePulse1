export const APP_NAME = "CodePulse";
export const APP_TAGLINE =
  "Your Codeforces History. Your DSA Intelligence. Your Next Best Problem.";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const SYNC_STAGES = [
  { id: "profile", label: "Profile" },
  { id: "submissions", label: "Submissions" },
  { id: "problems", label: "Problems" },
  { id: "contests", label: "Contests" },
  { id: "analytics", label: "Analytics" },
  { id: "recommendations", label: "Recommendations" },
  { id: "ai_insights", label: "AI Insights" },
];

export const STAGE_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETE: "complete",
  FAILED: "failed",
};

export const SYNC_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  SYNCING: "syncing",
  UP_TO_DATE: "up_to_date",
  FAILED: "failed",
  RATE_LIMITED: "rate_limited",
};

export const RATING_PERIODS = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "All", value: "all" },
];

export const PROGRESS_PERIODS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
  { label: "All Time", value: "all" },
];
