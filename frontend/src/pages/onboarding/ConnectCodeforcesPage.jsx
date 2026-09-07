import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { codeforcesApi } from "../../services/codeforcesApi.js";
import { ROUTES } from "../../constants/routes.js";
import { validateHandle } from "../../utils/validators.js";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";

const STATUS = {
  IDLE: "idle",
  CHECKING: "checking",
  VALID: "valid",
  NOT_FOUND: "not_found",
  RATE_LIMITED: "rate_limited",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
};

export default function ConnectCodeforcesPage() {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateHandle(handle)) {
      setError(
        "Handle must be 3–24 alphanumeric characters, dashes, dots, or underscores.",
      );
      return;
    }
    setError("");
    setStatus(STATUS.CHECKING);
    try {
      const data = await codeforcesApi.connectHandle({ handle });
      setStatus(STATUS.VALID);
      navigate(ROUTES.VERIFY_CODEFORCES, {
        state: {
          handle,
          code: data?.verificationCode || "",
          expiresAt: data?.expiresAt || null,
        },
      });
    } catch (err) {
      if (err?.status === 404) setStatus(STATUS.NOT_FOUND);
      else if (err?.status === 429) setStatus(STATUS.RATE_LIMITED);
      else if (err?.status === 503) setStatus(STATUS.UNAVAILABLE);
      else setStatus(STATUS.ERROR);
    }
  };

  const statusMessages = {
    [STATUS.NOT_FOUND]: {
      text: "Codeforces handle not found. Check the spelling and try again.",
      color: "text-[#ef4444]",
    },
    [STATUS.RATE_LIMITED]: {
      text: "Codeforces is rate limiting requests. Please wait a moment and try again.",
      color: "text-[#f59e0b]",
    },
    [STATUS.UNAVAILABLE]: {
      text: "Codeforces is currently unavailable. Please try again later.",
      color: "text-[#f59e0b]",
    },
    [STATUS.ERROR]: {
      text: "Something went wrong. Please try again.",
      color: "text-[#ef4444]",
    },
  };

  const msg = statusMessages[status];

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-[#6366f1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#e8eaf0]">
            Connect Your Codeforces Account
          </h1>
          <p className="text-sm text-[#6b7280] mt-2 max-w-sm mx-auto">
            Connect your Codeforces profile so CodePulse can analyze your real
            competitive programming activity.
          </p>
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Codeforces Handle"
              type="text"
              placeholder="e.g. tourist"
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                setStatus(STATUS.IDLE);
                setError("");
              }}
              error={error}
              hint="Your exact Codeforces username"
              required
            />

            {msg && (
              <p className={`text-xs ${msg.color}`} role="alert">
                {msg.text}
              </p>
            )}

            <Button
              type="submit"
              loading={status === STATUS.CHECKING}
              className="w-full"
            >
              Verify Handle
            </Button>
          </form>

          <div className="mt-6 border-t border-[#1e2030] pt-4">
            <p className="text-xs text-[#6b7280] leading-relaxed">
              <strong className="text-[#9ca3c4]">Note:</strong> Entering a
              handle doesn&apos;t verify ownership. You will be asked to prove
              you control this account in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
