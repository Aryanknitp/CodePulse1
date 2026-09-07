import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { analyticsApi } from "../../services/analyticsApi.js";
import { recommendationsApi } from "../../services/recommendationsApi.js";
import { aiApi } from "../../services/aiApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSync } from "../../hooks/useSync.js";
import { ROUTES } from "../../constants/routes.js";
import { getRatingColor, getRatingTitle } from "../../utils/formatRating.js";
import { formatRelative } from "../../utils/formatDate.js";
import StatCard from "../../components/dashboard/StatCard.jsx";
import SyncStatus from "../../components/dashboard/SyncStatus.jsx";
import {
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "../../components/common/Skeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import Button from "../../components/common/Button.jsx";

function useDataFetch(fetcher, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err }));
  };
  useEffect(load, deps);
  return { ...state, reload: load };
}

export default function DashboardPage() {
  const { user, codeforcesConnected } = useAuth();
  const { syncing, syncNow } = useSync();
  const [period, setPeriod] = useState("30d");

  const overview = useDataFetch(
    () => analyticsApi.getOverview({ period }),
    [period],
  );
  const todayRecs = useDataFetch(() => recommendationsApi.getToday());
  const insights = useDataFetch(() => aiApi.getInsights());

  const data = overview.data;

  if (!codeforcesConnected) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🔗"
          title="Connect Codeforces"
          description="Connect your Codeforces account to start analyzing your competitive programming performance."
          action={() => {}}
          actionLabel={
            <Link to={ROUTES.CONNECT_CODEFORCES} className="text-white">
              Connect Codeforces
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e8eaf0]">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Here is your competitive programming overview.
          </p>
        </div>
        <SyncStatus />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {overview.loading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : overview.error ? (
          <div className="col-span-full">
            <ErrorState
              title="Failed to load stats"
              onRetry={overview.reload}
            />
          </div>
        ) : (
          <>
            <StatCard
              label="Current Rating"
              value={data?.rating}
              color={getRatingColor(data?.rating)}
              sub={
                data?.rating ? getRatingTitle(data.rating) : "Connect to view"
              }
            />
            <StatCard
              label="Max Rating"
              value={data?.maxRating}
              color={getRatingColor(data?.maxRating)}
              sub={data?.maxRating ? getRatingTitle(data.maxRating) : "—"}
            />
            <StatCard
              label="Solved"
              value={data?.solvedCount}
              sub={data?.solvedCount ? "problems solved" : "No data yet"}
            />
            <StatCard
              label="Acceptance"
              value={data?.acceptanceRate ? `${data.acceptanceRate}%` : null}
              sub={
                data?.submissionCount
                  ? `${data.submissionCount} submissions`
                  : "No data yet"
              }
            />
            <StatCard
              label="Contests"
              value={data?.contestCount}
              sub="participated"
            />
            <StatCard
              label="Streak"
              value={data?.streak ? `${data.streak}d` : null}
              sub={data?.streak ? "current streak" : "No data yet"}
            />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Rating Overview — col span 2 */}
        <div className="lg:col-span-2 bg-[#111218] border border-[#1e2030] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">
              Rating History
            </h3>
            <div className="flex gap-1">
              {["7d", "30d", "90d", "all"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${period === p ? "bg-[#6366f1] text-white" : "text-[#6b7280] hover:text-[#9ca3c4]"}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {overview.loading ? (
            <div className="h-48 bg-[#1a1c2a] animate-pulse rounded" />
          ) : !data?.ratingHistory?.length ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-[#6b7280]">
                No rating history yet. Sync your account to view.
              </p>
            </div>
          ) : (
            <div className="h-48 flex items-end gap-0.5">
              {data.ratingHistory.slice(-20).map((point, i) => {
                const min = Math.min(
                  ...data.ratingHistory.map((p) => p.rating),
                );
                const max = Math.max(
                  ...data.ratingHistory.map((p) => p.rating),
                );
                const range = max - min || 1;
                const h = ((point.rating - min) / range) * 80 + 20;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-[#6366f1]/60 to-[#6366f1]/20 rounded-t-sm transition-all"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <h3 className="text-sm font-semibold text-[#e8eaf0]">AI Insight</h3>
          </div>
          {insights.loading ? (
            <div className="space-y-2">
              <div className="h-3 bg-[#1a1c2a] animate-pulse rounded" />
              <div className="h-3 bg-[#1a1c2a] animate-pulse rounded w-3/4" />
              <div className="h-3 bg-[#1a1c2a] animate-pulse rounded w-1/2" />
            </div>
          ) : insights.error ? (
            <p className="text-xs text-[#6b7280]">AI insights unavailable.</p>
          ) : !insights.data ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6b7280] leading-relaxed">
                Sync your Codeforces data to receive personalized AI coaching
                insights.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={syncNow}
                loading={syncing}
              >
                Generate Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#9ca3c4] leading-relaxed">
                {insights.data.summary}
              </p>
              {insights.data.recommendations?.slice(0, 2).map((r, i) => {
                const text =
                  typeof r === "string"
                    ? r
                    : r?.title || r?.detail || "AI recommendation";

                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#6366f1] mt-0.5 text-xs">›</span>
                    <span className="text-xs text-[#6b7280]">{text}</span>
                  </div>
                );
              })}
              <p className="text-[10px] text-[#4b5563]">
                Generated {formatRelative(insights.data.generatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Topic Strength */}
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">
              Topic Strength
            </h3>
            <Link
              to={ROUTES.ANALYTICS_TOPICS}
              className="text-xs text-[#6366f1] hover:text-[#818cf8]"
            >
              View All →
            </Link>
          </div>
          {overview.loading ? (
            <TableSkeleton rows={4} />
          ) : !data?.topicAnalytics?.length ? (
            <p className="text-xs text-[#6b7280]">
              No topic data. Sync to analyze your topics.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topicAnalytics.slice(0, 5).map((t) => (
                <div key={t.topic} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9ca3c4] capitalize">
                      {t.topic}
                    </span>
                    <span className="text-xs font-mono text-[#6b7280]">
                      {t.strengthScore ?? "—"}%
                    </span>
                  </div>
                  <div className="h-1 bg-[#1a1c2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full transition-all"
                      style={{ width: `${t.strengthScore ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Practice */}
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8eaf0]">
              Today&apos;s Practice
            </h3>
            <Link
              to={ROUTES.DAILY_PRACTICE}
              className="text-xs text-[#6366f1] hover:text-[#818cf8]"
            >
              View All →
            </Link>
          </div>
          {todayRecs.loading ? (
            <TableSkeleton rows={3} />
          ) : !todayRecs.data?.length ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6b7280]">
                No practice recommendations yet.
              </p>
              <Link to={ROUTES.DAILY_PRACTICE}>
                <Button variant="secondary" size="sm">
                  Generate Practice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayRecs.data.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 py-2 border-b border-[#1e2030] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e8eaf0] truncate">
                      {rec.problemName}
                    </p>
                    <p className="text-[10px] text-[#6b7280]">
                      Rating: {rec.rating} · {rec.tags?.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#6366f1] hover:text-[#818cf8] shrink-0"
                  >
                    Open ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
