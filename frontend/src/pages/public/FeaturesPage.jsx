import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

export default function FeaturesPage() {
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
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-[#e8eaf0] mb-4">Features</h1>
        <p className="text-[#9ca3c4] mb-12">
          Everything CodePulse offers to accelerate your competitive programming
          growth.
        </p>
        <div className="space-y-8">
          {[
            {
              title: "Real Codeforces Sync",
              desc: "Securely connects to your actual Codeforces account via handle verification. Imports your full submission history, contest participations, and rating changes.",
            },
            {
              title: "Topic Weakness Detection",
              desc: "Analyzes your solve rate, attempt count, and recent performance across every DSA topic. Identifies exactly where you are struggling with precision scoring.",
            },
            {
              title: "Personalized Problem Recommendations",
              desc: "Recommends problems at your exact difficulty level targeting your weakest topics. Every recommendation includes the reason it was selected for you.",
            },
            {
              title: "AI Coach",
              desc: "A conversational AI that answers questions about your actual performance. Explains why you are weak at a topic, creates study plans, analyzes your contests — all based on your real data.",
            },
            {
              title: "DSA Roadmap",
              desc: "Generates a personalized learning path based on your analytics. Shows your current level in each topic and what to focus on next.",
            },
            {
              title: "Daily Practice",
              desc: "Curates a daily problem set specifically for your current needs. Tracks your practice completion over time.",
            },
            {
              title: "Progress Tracking",
              desc: "Monitors your rating progression, solved count growth, topic improvement, and practice streaks over weeks and months.",
            },
            {
              title: "Contest Analytics",
              desc: "Breaks down every contest you have participated in — rank, rating change, problems attempted, problems solved.",
            },
          ].map((f) => (
            <div key={f.title} className="border-l-2 border-[#6366f1] pl-5">
              <h3 className="text-base font-semibold text-[#e8eaf0] mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-[#9ca3c4] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
