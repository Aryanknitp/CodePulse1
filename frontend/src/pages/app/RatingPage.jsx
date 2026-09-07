import { useState, useEffect } from "react";
import { analyticsApi } from "../../services/analyticsApi.js";
import {
  getRatingColor,
  getRatingTitle,
  formatRatingChange,
} from "../../utils/formatRating.js";
import { formatDate } from "../../utils/formatDate.js";
import {
  ChartSkeleton,
  StatCardSkeleton,
} from "../../components/common/Skeleton.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function RatingPage() {
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    analyticsApi
      .getRating({ period })
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
          <h2 className="text-lg font-semibold text-[#e8eaf0]">
            Rating Analytics
          </h2>
          <p className="text-sm text-[#6b7280]">
            Your Codeforces rating history and changes.
          </p>
        </div>
        <div className="flex gap-1">
          {["7d", "30d", "90d", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${period === p ? "bg-[#6366f1] text-white" : "bg-[#111218] border border-[#1e2030] text-[#6b7280] hover:text-[#9ca3c4]"}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load rating data" onRetry={load} />
      ) : !data ? (
        <EmptyState
          icon="📈"
          title="No rating data"
          description="Sync your Codeforces account to view rating analytics."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Current Rating",
                value: data.rating,
                color: getRatingColor(data.rating),
                sub: getRatingTitle(data.rating),
              },
              {
                label: "Maximum Rating",
                value: data.maxRating,
                color: getRatingColor(data.maxRating),
                sub: getRatingTitle(data.maxRating),
              },
              {
                label: "Rating Change",
                value: formatRatingChange(data.ratingChange),
                color:
                  data.ratingChange > 0
                    ? "#10b981"
                    : data.ratingChange < 0
                      ? "#ef4444"
                      : "#9ca3af",
                sub: "in selected period",
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
                  style={{ color: s.color }}
                >
                  {s.value ?? "—"}
                </p>
                <p className="text-[11px] text-[#6b7280] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Contest list */}
          {data.history?.length ? (
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1e2030]">
                <p className="text-sm font-medium text-[#e8eaf0]">
                  Contest Rating Changes
                </p>
              </div>
              <div className="divide-y divide-[#1e2030]">
                {data.history
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#e8eaf0] truncate">
                          {entry.name}
                        </p>
                        <p className="text-[11px] text-[#6b7280]">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-sm font-mono font-semibold"
                          style={{ color: getRatingColor(entry.newRating) }}
                        >
                          {entry.newRating}
                        </p>
                        <p
                          className="text-xs font-mono"
                          style={{
                            color:
                              entry.ratingChange > 0 ? "#10b981" : "#ef4444",
                          }}
                        >
                          {formatRatingChange(entry.ratingChange)}
                        </p>
                      </div>
                      <div className="text-xs text-[#6b7280] text-right shrink-0 w-14">
                        #{entry.rank}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon="🏆"
              title="No contest history"
              description="Participate in Codeforces contests to see your rating history here."
            />
          )}
        </div>
      )}
    </div>
  );
}
