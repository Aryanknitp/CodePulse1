import { useState, useEffect } from "react";
import { recommendationsApi } from "../../services/recommendationsApi.js";
import { aiApi } from "../../services/aiApi.js";
import { useApp } from "../../context/AppContext.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { TableSkeleton } from "../../components/common/Skeleton.jsx";

const STATUS_CONFIG = {
  not_started: "neutral",
  opened: "info",
  completed: "success",
  skipped: "neutral",
};

export default function DailyPracticePage() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [aiPlan, setAiPlan] = useState(null);
  const { toast } = useApp();

  const load = () => {
    setLoading(true);
    Promise.all([recommendationsApi.getToday(), aiApi.generateDailyPractice()])
      .then(([recommendations, plan]) => {
        setRecs(recommendations || []);
        setAiPlan(plan || null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const plan = await aiApi.generateDailyPractice();
      setAiPlan(plan || null);
      await recommendationsApi.getToday();
      await load();
      toast.success("Practice generated for today!");
    } catch {
      toast.error("Failed to generate practice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading((s) => ({ ...s, [id]: action }));
    try {
      if (action === "complete") await recommendationsApi.markCompleted(id);
      else await recommendationsApi.skip(id);
      setRecs((r) =>
        r.map((x) =>
          x.id === id
            ? { ...x, status: action === "complete" ? "completed" : "skipped" }
            : x,
        ),
      );
    } catch {
      toast.error("Action failed.");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: null }));
    }
  };

  const completed = recs.filter((r) => r.status === "completed").length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e8eaf0]">
            Your Personalized Practice
          </h2>
          <p className="text-sm text-[#6b7280]">
            Today&apos;s curated problems based on your performance.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          loading={generating}
          variant="secondary"
          size="sm"
        >
          Generate Today&apos;s Practice
        </Button>
      </div>

      {/* Progress */}
      {!loading && recs.length > 0 && (
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#9ca3c4]">
              Today&apos;s Progress
            </span>
            <span className="text-sm font-mono text-[#e8eaf0]">
              {completed} / {recs.length}
            </span>
          </div>
          <div className="h-2 bg-[#1a1c2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#10b981] rounded-full transition-all"
              style={{
                width: `${recs.length ? (completed / recs.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {!loading && aiPlan && (
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-[#e8eaf0]">
              Gemini&apos;s plan for today
            </p>
            <p className="text-sm text-[#9ca3c4] mt-1">{aiPlan.summary}</p>
          </div>
          {aiPlan.goals?.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-[#9ca3c4] space-y-1">
              {aiPlan.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <ErrorState title="Failed to load practice" onRetry={load} />
      ) : !recs.length ? (
        <EmptyState
          icon="📅"
          title="No practice for today"
          description="Generate your personalized daily practice set to get started."
          action={handleGenerate}
          actionLabel="Generate Practice"
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8eaf0]">
                      {rec.problemName}
                    </span>
                    <StatusBadge
                      status={STATUS_CONFIG[rec.status] || "neutral"}
                    >
                      {rec.status?.replace("_", " ") || "pending"}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-[#6b7280] font-mono">
                      Rating: {rec.rating}
                    </span>
                    {rec.tags?.slice(0, 3).map((t) => (
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
                      Why: {rec.reason}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <a href={rec.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      Open ↗
                    </Button>
                  </a>
                  {rec.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={actionLoading[rec.id] === "complete"}
                      onClick={() => handleAction(rec.id, "complete")}
                      className="text-[#10b981] text-xs"
                    >
                      ✓ Done
                    </Button>
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
