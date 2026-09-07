import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { randomCode } from "../utils/crypto.js";
import { env } from "../config/env.js";
import { getUserInfo } from "../services/codeforces.js";
import { syncUser } from "../services/sync.js";

// Connection Controller for CodeForces
export const connect = asyncHandler(async (req, res) => {
  const handle = String(req.body?.handle || "").trim();
  if (!/^[A-Za-z0-9_.-]{3,24}$/.test(handle))
    throw new AppError(400, "Invalid Codeforces handle.", "VALIDATION_ERROR");
  const info = await getUserInfo(handle);
  if (!info?.length)
    throw new AppError(
      404,
      "Codeforces handle not found.",
      "CF_HANDLE_NOT_FOUND",
    );
  const code = randomCode("CFI");
  const user = await User.findById(req.user._id);
  user.codeforcesHandle = info[0].handle;
  user.codeforcesVerified = false;
  user.cfVerificationCode = code;
  user.cfVerificationExpiresAt = new Date(
    Date.now() + env.cfVerificationTtlMinutes * 60000,
  );
  user.cfVerificationAttempts = 0;
  await user.save();
  res.json({
    handle: info[0].handle,
    status: "pending",
    verificationCode: code,
    expiresAt: user.cfVerificationExpiresAt,
    message: "Handle found. Complete ownership verification.",
  });
});
// VerifyOwnership Controller for verification purpose
export const verifyOwnership = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+cfVerificationCode");
  if (!user?.codeforcesHandle)
    throw new AppError(
      400,
      "Connect a Codeforces handle first.",
      "CF_NOT_CONNECTED",
    );
  if (user.cfVerificationAttempts >= env.cfVerificationMaxAttempts)
    throw new AppError(
      429,
      "Too many verification attempts.",
      "CF_TOO_MANY_ATTEMPTS",
    );
  if (
    !user.cfVerificationExpiresAt ||
    user.cfVerificationExpiresAt < new Date()
  )
    throw new AppError(
      410,
      "Codeforces verification expired. Start again.",
      "CF_VERIFICATION_EXPIRED",
    );

  user.cfVerificationAttempts += 1;

  const info = (await getUserInfo(user.codeforcesHandle))[0];
  if (!info) {
    await user.save();
    throw new AppError(
      404,
      "Codeforces handle not found.",
      "CF_HANDLE_NOT_FOUND",
    );
  }

  // The challenge is intentionally NOT accepted from the client. The backend
  // verifies it against the public Codeforces profile, proving control.
  // Codeforces may return values across multiple editable fields and with minor
  // formatting differences, so we compare both the human-readable text and a
  // compact alphanumeric version to avoid false rejects for valid profiles.
  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_\s-]+/g, " ")
      .replace(/\s+/g, " ");

  const compactText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const profileFields = [
    info?.firstName,
    info?.lastName,
    info?.country,
    info?.city,
    info?.organization,
    info?.handle,
  ];

  const publicText = profileFields
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => normalizeText(value))
    .join(" ");

  const codeCandidates = new Set(
    [
      normalizeText(user.cfVerificationCode),
      normalizeText(user.cfVerificationCode).replace(/\s+/g, ""),
      normalizeText(user.cfVerificationCode).replace(/-/g, ""),
      normalizeText(user.cfVerificationCode)
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
      compactText(user.cfVerificationCode),
      compactText(normalizeText(user.cfVerificationCode)),
    ].filter(Boolean),
  );

  const publicCompact = compactText(publicText);
  const valid = [...codeCandidates].some((candidate) => {
    const lowered = String(candidate).toLowerCase();
    if (!lowered) return false;
    const compactCandidate = compactText(lowered);
    return (
      publicText.includes(lowered) ||
      publicText.includes(lowered.replace(/-/g, " ")) ||
      publicCompact.includes(compactCandidate)
    );
  });

  if (!valid) {
    await user.save();
    throw new AppError(
      401,
      "Verification code was not found on the Codeforces profile. Save it and try again.",
      "CF_OWNERSHIP_NOT_VERIFIED",
      {
        attemptsLeft: Math.max(
          0,
          env.cfVerificationMaxAttempts - user.cfVerificationAttempts,
        ),
      },
    );
  }

  user.codeforcesVerified = true;
  user.cfVerificationCode = undefined;
  user.cfVerificationExpiresAt = undefined;
  user.cfVerificationAttempts = 0;
  await user.save();
  res.json({ handle: user.codeforcesHandle, codeforcesVerified: true });
});

// Real Verification Challenge is here
export const verificationChallenge = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+cfVerificationCode");
  if (!user?.codeforcesHandle || user.codeforcesVerified) {
    throw new AppError(
      404,
      "No pending Codeforces verification.",
      "CF_VERIFICATION_NOT_PENDING",
    );
  }
  if (
    !user.cfVerificationCode ||
    !user.cfVerificationExpiresAt ||
    user.cfVerificationExpiresAt < new Date()
  ) {
    throw new AppError(
      410,
      "Codeforces verification expired. Start again.",
      "CF_VERIFICATION_EXPIRED",
    );
  }
  res.json({
    handle: user.codeforcesHandle,
    verificationCode: user.cfVerificationCode,
    expiresAt: user.cfVerificationExpiresAt,
    attemptsLeft: Math.max(
      0,
      env.cfVerificationMaxAttempts - (user.cfVerificationAttempts || 0),
    ),
  });
});
// Sync Controller
export const sync = asyncHandler(async (req, res) => {
  // The initial import must populate the shared problem catalog so that
  // recommendations and daily practice can work immediately after onboarding.
  const job = await syncUser(req.user._id, { includeProblemset: true });
  res.json({
    message: "Synchronization completed.",
    job: job
      ? { id: String(job._id), status: job.status, stages: job.stages }
      : null,
  });
});

// Profile Controller
export const profile = asyncHandler(async (req, res) => {
  if (!req.user.codeforcesHandle)
    throw new AppError(
      404,
      "No Codeforces account connected.",
      "CF_NOT_CONNECTED",
    );
  res.json(req.user.cfProfile || { handle: req.user.codeforcesHandle });
});

// Disconnnection Controller from codefoces account
export const disconnect = asyncHandler(async (req, res) => {
  const user = req.user;
  user.codeforcesHandle = undefined;
  user.codeforcesVerified = false;
  user.cfProfile = undefined;
  user.cfVerificationCode = undefined;
  user.cfVerificationExpiresAt = undefined;
  await user.save();
  res.json({ message: "Codeforces account disconnected." });
});
