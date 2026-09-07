import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

const STEPS = [
  {
    n: 1,
    title: "Create Your Account",
    desc: "Register with your email and verify it with a 6-digit OTP code.",
  },
  {
    n: 2,
    title: "Connect Codeforces",
    desc: "Enter your Codeforces handle. We verify you own the account via a short challenge.",
  },
  {
    n: 3,
    title: "Initial Sync",
    desc: "We import your full submission history, rating history, and contest records from Codeforces.",
  },
  {
    n: 4,
    title: "Analytics Generation",
    desc: "Our system analyzes your data — calculating topic scores, identifying weaknesses, and generating insights.",
  },
  {
    n: 5,
    title: "Personalized Recommendations",
    desc: "The recommendation engine selects problems based on your rating, weak topics, and difficulty progression.",
  },
  {
    n: 6,
    title: "AI Coaching",
    desc: "Ask your AI Coach anything. It uses your real analytics to give you data-driven guidance.",
  },
  {
    n: 7,
    title: "Automatic Re-sync",
    desc: "When you solve new problems on Codeforces, your data re-syncs automatically and analytics update.",
  },
  {
    n: 8,
    title: "Track Improvement",
    desc: "Monitor your progress over time and see exactly how your weak areas are improving.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-[#e8eaf0]">
      <nav className="border-b border-[#1e2030] px-6 py-4 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-sm font-semibold text-[#e8eaf0]">
          ← CodePulse
        </Link>
        <Link
          to={ROUTES.REGISTER}
          className="text-sm bg-[#6366f1] hover:bg-[#5254cc] text-white px-4 py-2 rounded-md transition-colors"
        >
          Get Started
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-[#e8eaf0] mb-4">How It Works</h1>
        <p className="text-[#9ca3c4] mb-12">
          From account creation to personalized coaching in minutes.
        </p>
        <div className="space-y-6">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-5">
              <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                {step.n}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#e8eaf0] mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-[#9ca3c4] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
