import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-[#e8eaf0]">
      {/* Nav */}
      <nav className="border-b border-[#1e2030] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span className="font-semibold text-[#e8eaf0]">CodePulse</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#9ca3c4]">
          <Link
            to={ROUTES.FEATURES}
            className="hover:text-[#e8eaf0] transition-colors"
          >
            Features
          </Link>
          <Link
            to={ROUTES.HOW_IT_WORKS}
            className="hover:text-[#e8eaf0] transition-colors"
          >
            How It Works
          </Link>
          <Link
            to={ROUTES.ABOUT}
            className="hover:text-[#e8eaf0] transition-colors"
          >
            About
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-[#9ca3c4] hover:text-[#e8eaf0] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="text-sm bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-[#818cf8] bg-[#6366f1]/10 border border-[#6366f1]/20 px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
          AI-Powered DSA Coaching
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#e8eaf0] leading-tight mb-6 max-w-4xl mx-auto">
          Turn Your Codeforces History Into Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">
            Personal DSA Coach.
          </span>
        </h1>
        <p className="text-lg text-[#9ca3c4] max-w-2xl mx-auto mb-10 leading-relaxed">
          Analyze real Codeforces performance, discover your weak topics, get
          personalized problems, and understand exactly what to improve next.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={ROUTES.REGISTER}
            className="bg-[#6366f1] hover:bg-[#5254cc] text-white px-8 py-3 rounded-md font-medium transition-colors text-sm flex items-center gap-2"
          >
            Get Started Free
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="border border-[#1e2030] hover:border-[#252840] text-[#9ca3c4] hover:text-[#e8eaf0] px-8 py-3 rounded-md font-medium transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
          <div className="bg-[#0d0e14] border-b border-[#1e2030] px-4 py-3 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/60" />
            <span className="text-xs text-[#4b5563] ml-2 font-mono">
              app/dashboard
            </span>
          </div>
          <div className="p-6">
            {/* Mock KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                "Current Rating",
                "Max Rating",
                "Solved",
                "Acceptance",
                "Contests",
                "Streak",
              ].map((label) => (
                <div
                  key={label}
                  className="bg-[#0d0e14] border border-[#1e2030] rounded-lg p-3"
                >
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <div className="h-6 bg-[#1a1c2a] rounded animate-pulse" />
                  <p className="text-[10px] text-[#4b5563] mt-1">
                    Connect to view
                  </p>
                </div>
              ))}
            </div>
            {/* Mock charts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0d0e14] border border-[#1e2030] rounded-lg p-4">
                <p className="text-xs font-medium text-[#e8eaf0] mb-3">
                  Rating History
                </p>
                <div className="h-32 flex items-end gap-1">
                  {[40, 55, 45, 70, 60, 80, 65, 85, 75, 90, 78, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#6366f1]/40 to-[#6366f1]/10 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="bg-[#0d0e14] border border-[#1e2030] rounded-lg p-4">
                <p className="text-xs font-medium text-[#e8eaf0] mb-3">
                  Topic Strength
                </p>
                <div className="space-y-2">
                  {[
                    "Dynamic Programming",
                    "Graphs",
                    "Binary Search",
                    "Greedy",
                  ].map((t, i) => (
                    <div key={t} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6b7280] w-28 truncate">
                        {t}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1c2a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full"
                          style={{ width: `${[75, 60, 85, 50][i]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1e2030]">
        <h2 className="text-2xl font-bold text-center text-[#e8eaf0] mb-3">
          Everything You Need to Level Up
        </h2>
        <p className="text-sm text-center text-[#9ca3c4] mb-12">
          A complete intelligence layer for your Codeforces journey.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 hover:border-[#252840] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#6366f1]/10 flex items-center justify-center mb-4">
                <f.icon />
              </div>
              <h3 className="text-sm font-semibold text-[#e8eaf0] mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[#1e2030]">
        <h2 className="text-2xl font-bold text-center text-[#e8eaf0] mb-12">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row items-start justify-center gap-0">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className="flex flex-col items-center text-center flex-1 relative"
            >
              <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center text-sm font-bold text-white mb-3 z-10 relative">
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-[#1e2030] z-0" />
              )}
              <p className="text-sm font-medium text-[#e8eaf0] mb-1">
                {step.label}
              </p>
              <p className="text-xs text-[#6b7280] max-w-[120px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1e2030] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#e8eaf0] mb-4">
            Ready to understand your competitive programming?
          </h2>
          <p className="text-sm text-[#9ca3c4] mb-8">
            Connect your Codeforces account and get your personalized insights
            in minutes.
          </p>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#5254cc] text-white px-8 py-3 rounded-md font-medium transition-colors text-sm"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2030] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
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
            <span className="text-sm text-[#6b7280]">CodePulse</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#6b7280]">
            <Link to={ROUTES.FEATURES} className="hover:text-[#9ca3c4]">
              Features
            </Link>
            <Link to={ROUTES.HOW_IT_WORKS} className="hover:text-[#9ca3c4]">
              How It Works
            </Link>
            <Link to={ROUTES.ABOUT} className="hover:text-[#9ca3c4]">
              About
            </Link>
            <span className="hover:text-[#9ca3c4] cursor-pointer">Privacy</span>
            <span className="hover:text-[#9ca3c4] cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: "Codeforces Analytics",
    description:
      "Deep-dive into your rating trends, contest history, submissions, and performance patterns.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#6366f1]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "DSA Intelligence",
    description:
      "Identify your strongest and weakest algorithm topics with precision scoring across all Codeforces tags.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#8b5cf6]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    title: "Personalized Recommendations",
    description:
      "Get problems recommended specifically for your rating level, weak topics, and difficulty progression.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#6366f1]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
  {
    title: "AI Coach",
    description:
      "Ask your AI Coach anything about your performance. Get data-driven coaching based on your actual Codeforces history.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#8b5cf6]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
  {
    title: "DSA Roadmap",
    description:
      "Your personalized learning path generated from your analytics — see exactly what to study next.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#6366f1]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your improvement over time — rating growth, solved count, topic mastery, and practice streaks.",
    icon: () => (
      <svg
        className="w-4 h-4 text-[#8b5cf6]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M22 12h-4l-3 9L9 3l-3 9H2"
        />
      </svg>
    ),
  },
];

const STEPS = [
  { label: "Connect", desc: "Link your Codeforces account" },
  { label: "Sync", desc: "We import your history" },
  { label: "Analyze", desc: "AI processes your data" },
  { label: "Practice", desc: "Get personalized problems" },
  { label: "Improve", desc: "Track your growth" },
];
