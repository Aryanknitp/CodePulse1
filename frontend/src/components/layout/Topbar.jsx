import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const PAGE_TITLES = {
  "/app/dashboard": "Dashboard",
  "/app/analytics": "Analytics",
  "/app/analytics/rating": "Rating Analytics",
  "/app/analytics/difficulty": "Difficulty Analytics",
  "/app/analytics/topics": "Topic Analytics",
  "/app/analytics/submissions": "Submission Analytics",
  "/app/analytics/contests": "Contest Analytics",
  "/app/problems": "Problems",
  "/app/problems/recommended": "Recommended Problems",
  "/app/problems/history": "Problem History",
  "/app/daily-practice": "Daily Practice",
  "/app/ai-coach": "AI Coach",
  "/app/roadmap": "DSA Roadmap",
  "/app/progress": "Progress",
  "/app/contests": "Contests",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || "CodePulse";

  return (
    <header className="h-14 bg-[#0d0e14] border-b border-border flex items-center gap-4 px-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open menu"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-6 h-6 rounded bg-linear-to-br from-[#6366f1] to-accent flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[#e8eaf0]">
          CF Insights
        </span>
      </div>

      <h1 className="hidden lg:block text-sm font-semibold text-[#e8eaf0]">
        {title}
      </h1>

      <div className="flex-1" />

      <button
        onClick={() => navigate("/app/profile")}
        aria-label="Open profile"
        className="w-7 h-7 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-xs font-semibold text-[#818cf8] hover:bg-[#6366f1]/30"
      >
        {user?.name?.[0]?.toUpperCase() || "U"}
      </button>
    </header>
  );
}
