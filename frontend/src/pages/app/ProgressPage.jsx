import { useState, useEffect } from "react";
import { progressApi } from "../../services/progressApi.js";
import {
  StatCardSkeleton,
  ChartSkeleton,
} from "../../components/common/Skeleton.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { PROGRESS_PERIODS } from "../../constants/app.js";

export default function ProgressPage() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    progressApi
      .getProgress({ period })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  };

  useEffect(load, [period]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e8eaf0]">Progress</h2>
          <p className="text-sm text-[#6b7280]">
            Track your improvement over time.
          </p>
        </div>
        <div className="flex gap-1">
          {PROGRESS_PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${period === p.value ? "bg-[#6366f1] text-white" : "bg-[#111218] border border-[#1e2030] text-[#6b7280] hover:text-[#9ca3c4]"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load progress" onRetry={load} />
      ) : !data ? (
        <EmptyState
          icon="📈"
          title="No progress data"
          description="Sync your Codeforces account and start practicing to see your progress."
        />
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Rating Change",
                value:
                  data.ratingChange !== undefined
                    ? data.ratingChange > 0
                      ? `+${data.ratingChange}`
                      : String(data.ratingChange)
                    : "—",
                color:
                  data.ratingChange > 0
                    ? "#10b981"
                    : data.ratingChange < 0
                      ? "#ef4444"
                      : "#9ca3af",
              },
              {
                label: "Problems Solved",
                value: data.solvedThisPeriod ?? "—",
                sub: "in selected period",
              },
              {
                label: "Current Streak",
                value: data.streak ? `${data.streak}d` : "—",
                sub: "days",
              },
              {
                label: "Recommendations Completed",
                value: data.recommendationsCompleted ?? "—",
                sub: "completed",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#111218] border border-[#1e2030] rounded-lg p-4"
              >
                <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">
                  {s.label}
                </p>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: s.color || "#e8eaf0" }}
                >
                  {s.value}
                </p>
                {s.sub && (
                  <p className="text-[11px] text-[#6b7280] mt-1">{s.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Activity chart */}
          {data.dailyActivity && (
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
              <p className="text-sm font-medium text-[#e8eaf0] mb-4">
                Daily Activity
              </p>
              <div className="flex items-end gap-1 h-24">
                {data.dailyActivity.map((day, i) => {
                  const max = Math.max(
                    ...data.dailyActivity.map((d) => d.solved),
                  );
                  const h = max ? Math.max((day.solved / max) * 100, 4) : 4;
                  return (
                    <div
                      key={i}
                      title={`${day.date}: ${day.solved} solved`}
                      className="flex-1 bg-gradient-to-t from-[#6366f1]/60 to-[#6366f1]/20 rounded-t-sm hover:from-[#6366f1]/80 transition-colors cursor-default"
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Topic improvement */}
          {data.topicImprovement?.length > 0 && (
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
              <p className="text-sm font-medium text-[#e8eaf0] mb-4">
                Topic Improvement
              </p>
              <div className="space-y-3">
                {data.topicImprovement.slice(0, 6).map((t) => (
                  <div key={t.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#9ca3c4] capitalize">
                        {t.topic}
                      </span>
                      <span className="text-[#10b981] font-mono">
                        {t.change > 0 ? `+${t.change}` : t.change}%
                      </span>
                    </div>
                    <div className="h-1 bg-[#1a1c2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6366f1] to-[#10b981] rounded-full"
                        style={{ width: `${t.score ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
