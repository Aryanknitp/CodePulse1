import { useState, useEffect } from "react";
import { recommendationsApi } from "../../services/recommendationsApi.js";
import { aiApi } from "../../services/aiApi.js";
import { useApp } from "../../context/AppContext.jsx";
import { TableSkeleton } from "../../components/common/Skeleton.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";

const PRIORITY_STATUS = { high: "error", medium: "warning", low: "neutral" };

export default function RecommendedProblemsPage() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [aiGuidance, setAiGuidance] = useState(null);
  const { toast } = useApp();

  const load = () => {
    setLoading(true);
    Promise.all([
      recommendationsApi.getRecommended(),
      aiApi.getAiRecommendations(),
    ])
      .then(([d, guidance]) => {
        setRecs(d?.recommendations || []);
        setAiGuidance(guidance || null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const handleAction = async (id, action) => {
    setActionLoading((s) => ({ ...s, [id]: action }));
    try {
      if (action === "complete") await recommendationsApi.markCompleted(id);
      else if (action === "skip") await recommendationsApi.skip(id);
      else await recommendationsApi.markNotRelevant(id);
      setRecs((r) =>
        r.map((x) =>
          x.id === id
            ? {
                ...x,
                status:
                  action === "complete"
                    ? "completed"
                    : action === "skip"
                      ? "skipped"
                      : "not_relevant",
              }
            : x,
        ),
      );
      toast.success(
        action === "complete" ? "Marked as completed!" : "Problem skipped.",
      );
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: null }));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">
          Recommended Problems
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Recommendations are based on your current rating, solving history,
          weak topics, difficulty progression and recent performance.
        </p>
      </div>

      {!loading && aiGuidance?.summary && (
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4">
          <p className="text-sm font-medium text-[#e8eaf0]">
            Gemini recommendation analysis
          </p>
          <p className="text-sm text-[#9ca3c4] mt-1">{aiGuidance.summary}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111218] border border-[#1e2030] rounded-xl h-24 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load recommendations" onRetry={load} />
      ) : !recs.length ? (
        <EmptyState
          icon="⭐"
          title="No recommendations yet"
          description="Sync your Codeforces data to receive personalized problem recommendations."
        />
      ) : (
        <div className="space-y-3">
          {recs.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#111218] border border-[#1e2030] rounded-xl p-4 hover:border-[#252840] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#e8eaf0]">
                      {rec.problemName}
                    </span>
                    {rec.priority && (
                      <StatusBadge status={PRIORITY_STATUS[rec.priority]}>
                        {rec.priority} priority
                      </StatusBadge>
                    )}
                    {rec.status !== "recommended" && (
                      <StatusBadge
                        status={
                          rec.status === "completed" ? "success" : "neutral"
                        }
                      >
                        {rec.status}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[#6b7280]">
                    <span className="font-mono">Rating: {rec.rating}</span>
                    {rec.tags?.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="bg-[#6366f1]/10 text-[#818cf8] px-1.5 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                    {rec.preferredLanguage && (
                      <span className="text-xs text-[#9ca3c4]">
                        Practice in {rec.preferredLanguage}
                      </span>
                    )}
                  </div>
                  {rec.reason && (
                    <p className="text-xs text-[#6b7280] italic">
                      "{rec.reason}"
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={rec.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      Open ↗
                    </Button>
                  </a>
                  {rec.status === "recommended" && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={actionLoading[rec.id] === "complete"}
                        onClick={() => handleAction(rec.id, "complete")}
                        className="text-[10px] px-2 py-1 text-[#10b981]"
                      >
                        ✓ Done
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={actionLoading[rec.id] === "skip"}
                        onClick={() => handleAction(rec.id, "skip")}
                        className="text-[10px] px-2 py-1 text-[#6b7280]"
                      >
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
