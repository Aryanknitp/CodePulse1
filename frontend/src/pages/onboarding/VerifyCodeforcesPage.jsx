import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { codeforcesApi } from "../../services/codeforcesApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../constants/routes.js";
import Button from "../../components/common/Button.jsx";

const STATUS = {
  WAITING: "waiting",
  CHECKING: "checking",
  VERIFIED: "verified",
  INVALID: "invalid",
  EXPIRED: "expired",
  TOO_MANY: "too_many",
  RATE_LIMITED: "rate_limited",
  UNAVAILABLE: "unavailable",
};

export default function VerifyCodeforcesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(STATUS.WAITING);
  const [syncing, setSyncing] = useState(false);
  const [syncStages, setSyncStages] = useState(null);
  const [syncError, setSyncError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [verificationCode, setVerificationCode] = useState(
    location.state?.code || "",
  );
  const [challengeExpiresAt, setChallengeExpiresAt] = useState(
    location.state?.expiresAt || null,
  );
  const { refreshUser } = useAuth();
  const handle = location.state?.handle || "";

  useEffect(() => {
    if (verificationCode || !handle) return;
    codeforcesApi
      .getVerificationChallenge()
      .then((data) => {
        setVerificationCode(data?.verificationCode || "");
        setChallengeExpiresAt(data?.expiresAt || null);
        if (data?.attemptsLeft !== undefined)
          setAttemptsLeft(data.attemptsLeft);
      })
      .catch(() => {});
  }, [handle, verificationCode]);

  const handleVerify = async () => {
    setSyncError("");
    setStatus(STATUS.CHECKING);
    try {
      const data = await codeforcesApi.verifyOwnership({ handle });
      if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
      setStatus(STATUS.VERIFIED);
      setSyncing(true);
      await startSync();
    } catch (err) {
      if (err?.status === 400) setStatus(STATUS.INVALID);
      else if (err?.status === 410) setStatus(STATUS.EXPIRED);
      else if (err?.status === 429) {
        if (err?.data?.code === "TOO_MANY_ATTEMPTS") setStatus(STATUS.TOO_MANY);
        else setStatus(STATUS.RATE_LIMITED);
      } else if (err?.status === 503) setStatus(STATUS.UNAVAILABLE);
      else setStatus(STATUS.INVALID);
    }
  };

  const startSync = async () => {
    const stages = [
      "profile",
      "submissions",
      "problems",
      "contests",
      "analytics",
      "recommendations",
      "ai_insights",
    ];
    setSyncStages(stages.map((id) => ({ id, status: "pending" })));
    try {
      const data = await codeforcesApi.syncAccount();
      console.log("correctly data", data);
      if (data?.job?.stages) setSyncStages(data.job.stages);
      const refreshedUser = await refreshUser();
      console.log("correctly data", refreshedUser);
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1500);
    } catch (err) {
      setSyncError(
        err?.message || "Unable to fetch Codeforces data. Please try again.",
      );
      setSyncing(false);
    }
  };

  if (syncing) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#e8eaf0]">
              Setting Up Your Account
            </h1>
            <p className="text-sm text-[#6b7280] mt-2">
              Importing your Codeforces data…
            </p>
          </div>
          <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 space-y-3">
            {[
              "Profile",
              "Submissions",
              "Problems",
              "Contests",
              "Analytics",
              "Recommendations",
              "AI Insights",
            ].map((label, i) => {
              const stage = syncStages?.[i];
              const isComplete = stage?.status === "complete";
              const isRunning =
                stage?.status === "running" || (!stage && i === 0);
              const isFailed = stage?.status === "failed";
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isComplete ? (
                      <svg
                        className="w-4 h-4 text-[#10b981]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : isRunning ? (
                      <svg
                        className="w-4 h-4 text-[#6366f1] animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-[#252840]" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${isComplete ? "text-[#10b981]" : isFailed ? "text-[#ef4444]" : isRunning ? "text-[#e8eaf0]" : "text-[#4b5563]"}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-[#4b5563] ml-auto">
                    {isComplete
                      ? "Complete"
                      : isFailed
                        ? "Skipped"
                        : isRunning
                          ? "Running…"
                          : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
          {syncError && (
            <p className="mt-4 text-xs text-[#ef4444]" role="alert">
              {syncError}
            </p>
          )}
        </div>
      </div>
    );
  }

  const errorMessages = {
    [STATUS.INVALID]:
      "Verification failed. Make sure you added the code correctly to your Codeforces profile.",
    [STATUS.EXPIRED]:
      "Verification code expired. Please go back and start again.",
    [STATUS.TOO_MANY]:
      "Too many verification attempts. Please try again later.",
    [STATUS.RATE_LIMITED]:
      "Codeforces is rate limiting. Please wait before trying again.",
    [STATUS.UNAVAILABLE]: "Codeforces is unavailable. Please try again later.",
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#e8eaf0]">
            Verify Codeforces Ownership
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Prove you control{" "}
            <span className="text-[#818cf8] font-mono">{handle}</span>
          </p>
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6 space-y-5">
          <div className="bg-[#6366f1]/5 border border-[#6366f1]/15 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-[#e8eaf0]">How to verify:</p>
            <ol className="text-xs text-[#9ca3c4] space-y-2 list-decimal pl-4">
              <li>Go to your Codeforces profile settings</li>
              <li>
                Add the verification code below to your{" "}
                <strong className="text-[#e8eaf0]">First name</strong> field
              </li>
              <li>Save your profile</li>
              <li>
                Click{" "}
                <strong className="text-[#e8eaf0]">Verify Ownership</strong>{" "}
                below
              </li>
              <li>Remove the code from your profile after verification</li>
            </ol>
          </div>

          <div className="bg-[#0d0e14] border border-[#1e2030] rounded-lg p-3 flex items-center justify-between gap-3">
            <span className="text-sm font-mono text-[#818cf8]">
              {verificationCode || "Loading verification code…"}
            </span>
            <span className="text-xs text-[#6b7280]">From backend</span>
          </div>

          <p className="text-xs text-[#6b7280]">
            Code expires in 20 minutes. You have limited attempts.
          </p>

          {errorMessages[status] && (
            <p className="text-xs text-[#ef4444]" role="alert">
              {errorMessages[status]}
            </p>
          )}

          {attemptsLeft !== null && (
            <p className="text-xs text-[#f59e0b]">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
            </p>
          )}

          {syncError && (
            <p className="text-xs text-[#ef4444]" role="alert">
              {syncError}
            </p>
          )}

          <div className="flex gap-3">
            <Link to={ROUTES.CONNECT_CODEFORCES} className="flex-1">
              <Button variant="secondary" className="w-full">
                Change Handle
              </Button>
            </Link>
            <Button
              onClick={handleVerify}
              loading={status === STATUS.CHECKING}
              className="flex-1"
            >
              Verify Ownership
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
