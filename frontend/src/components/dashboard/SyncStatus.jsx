import { useAuth } from "../../context/AuthContext.jsx";
import { useSync } from "../../hooks/useSync.js";

const STATUS_CONFIG = {
  not_connected: {
    label: "Not Connected",
    color: "text-[#6b7280]",
    dot: "bg-[#6b7280]",
  },
  connected: {
    label: "Connected",
    color: "text-[#10b981]",
    dot: "bg-[#10b981]",
  },
  syncing: {
    label: "Syncing…",
    color: "text-[#3b82f6]",
    dot: "bg-[#3b82f6] animate-pulse",
  },
  up_to_date: {
    label: "Up to Date",
    color: "text-[#10b981]",
    dot: "bg-[#10b981]",
  },
  failed: {
    label: "Sync Failed",
    color: "text-[#ef4444]",
    dot: "bg-[#ef4444]",
  },
  rate_limited: {
    label: "Rate Limited",
    color: "text-[#f59e0b]",
    dot: "bg-[#f59e0b]",
  },
};

export default function SyncStatus({ showButton = true }) {
  const { codeforcesConnected } = useAuth();
  const { syncing, syncNow } = useSync();

  const statusKey = !codeforcesConnected
    ? "not_connected"
    : syncing
      ? "syncing"
      : "up_to_date";
  const cfg = STATUS_CONFIG[statusKey];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>
      {showButton && codeforcesConnected && !syncing && (
        <button
          onClick={syncNow}
          className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Sync Now
        </button>
      )}
    </div>
  );
}
