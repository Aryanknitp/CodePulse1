import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "../../services/analyticsApi.js";
import { aiApi } from "../../services/aiApi.js";
import { ROUTES } from "../../constants/routes.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { TableSkeleton } from "../../components/common/Skeleton.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";

const STRENGTH_COLORS = {
  strong: {
    bg: "#10b981",
    border: "#10b981",
    text: "#10b981",
    label: "Strong",
  },
  average: {
    bg: "#f59e0b",
    border: "#f59e0b",
    text: "#f59e0b",
    label: "Average",
  },
  weak: { bg: "#ef4444", border: "#ef4444", text: "#ef4444", label: "Weak" },
  not_started: {
    bg: "#4b5563",
    border: "#4b5563",
    text: "#6b7280",
    label: "Not Started",
  },
};

function RoadmapNode({ topic, onClick }) {
  const strength = topic.strength || "not_started";
  const cfg = STRENGTH_COLORS[strength];

  return (
    <button
      onClick={() => onClick(topic)}
      className="bg-[#111218] border rounded-xl p-4 text-left transition-all hover:scale-[1.01] hover:shadow-lg group"
      style={{ borderColor: cfg.border + "40" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e8eaf0] capitalize mb-1">
            {topic.topic}
          </p>
          <p className="text-xs text-[#6b7280]">
            Level: {topic.currentLevel ?? "—"}
          </p>
        </div>
        <div
          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: cfg.bg }}
        />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span style={{ color: cfg.text }}>{cfg.label}</span>
          <span className="text-[#6b7280]">{topic.strengthScore ?? 0}%</span>
        </div>
        <div className="h-1 bg-[#1a1c2a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${topic.strengthScore ?? 0}%`,
              backgroundColor: cfg.bg,
            }}
          />
        </div>
      </div>
      {topic.nextAction && (
        <p className="text-[10px] text-[#6b7280] mt-2 italic group-hover:text-[#9ca3c4] transition-colors">
          Next: {topic.nextAction}
        </p>
      )}
    </button>
  );
}

export default function RoadmapPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const { codeforcesConnected } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!codeforcesConnected) {
      setLoading(false);
      return;
    }
    Promise.all([analyticsApi.getTopics(), aiApi.getRoadmap()])
      .then(([topicData, roadmap]) => {
        setTopics(topicData?.topics || []);
        setAiRoadmap(roadmap || null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, [codeforcesConnected]);

  if (!codeforcesConnected) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon="🗺️"
          title="Connect Codeforces to generate your roadmap"
          description="Your personalized DSA roadmap is generated from your actual Codeforces analytics."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">DSA Roadmap</h2>
        <p className="text-sm text-[#6b7280]">
          Your personalized learning path based on real performance data.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(STRENGTH_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: v.bg }}
            />
            <span className="text-[#9ca3c4]">{v.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-[#111218] border border-[#1e2030] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load roadmap"
          onRetry={() => window.location.reload()}
        />
      ) : !topics.length ? (
        <EmptyState
          icon="📚"
          title="No roadmap data"
          description="Sync your Codeforces account to generate your personalized DSA roadmap."
        />
      ) : (
        <>
          {aiRoadmap && (
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4 mb-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-[#e8eaf0]">
                  Gemini roadmap
                </p>
                <p className="text-sm text-[#9ca3c4] mt-1">
                  {aiRoadmap.summary}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {(aiRoadmap.phases || []).map((phase) => (
                  <div
                    key={phase.title}
                    className="border border-[#1e2030] rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-[#e8eaf0]">
                      {phase.title}
                    </p>
                    <p className="text-xs text-[#818cf8] mt-1">
                      {phase.ratingRange}
                    </p>
                    <p className="text-xs text-[#9ca3c4] mt-2">
                      {phase.objectives}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {topics.map((t) => (
              <RoadmapNode
                key={t.topic}
                topic={t}
                onClick={() => navigate(ROUTES.ANALYTICS_TOPICS)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
