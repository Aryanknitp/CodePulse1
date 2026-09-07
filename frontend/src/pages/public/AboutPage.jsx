import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold text-[#e8eaf0] mb-4">
          About CodePulse
        </h1>
        <div className="prose prose-sm max-w-none text-[#9ca3c4] space-y-5 leading-relaxed">
          <p>
            CodePulse is an AI-powered competitive programming analytics
            platform built for serious competitive programmers who want
            data-driven clarity on their performance.
          </p>
          <p>
            Every competitive programmer knows the feeling: you have solved
            hundreds of problems, participated in dozens of contests, but you
            are not sure exactly where to focus next. Your rating has plateaued.
            You keep failing at similar problem types without understanding why.
          </p>
          <p>
            CodePulse solves this by connecting directly to your Codeforces
            account, ingesting your full history, and applying analytics and AI
            to give you a precise, actionable picture of your strengths,
            weaknesses, and next steps.
          </p>
          <p>
            The platform is designed around a core principle:{" "}
            <strong className="text-[#e8eaf0]">
              every insight must come from your real data.
            </strong>{" "}
            No fake ratings. No invented examples. No generic advice. Everything
            is grounded in your actual submission history.
          </p>
          <h3 className="text-[#e8eaf0] font-semibold">The Stack</h3>
          <p>
            Frontend: React + Vite + Tailwind CSS. Backend: Node.js + Express +
            MongoDB. AI Service: Python FastAPI + LLM. Data: Codeforces API.
            Queue: Redis + BullMQ.
          </p>
        </div>
      </div>
    </div>
  );
}
