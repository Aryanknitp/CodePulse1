import dotenv from "dotenv";
dotenv.config();

const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "AI_SERVICE_URL",
  "AI_SERVICE_TOKEN",
];
for (const key of required) {
  if (!process.env[key])
    console.warn(
      `[env] Missing ${key}; some functionality may be unavailable.`,
    );
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cfApiUrl: process.env.CODEFORCES_API_URL || "https://codeforces.com/api",
  syncIntervalMinutes: Number(
    process.env.CODEFORCES_SYNC_INTERVAL_MINUTES || 20,
  ),
  problemsetSyncHours: Number(
    process.env.CODEFORCES_PROBLEMSET_SYNC_HOURS || 24,
  ),
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  aiServiceToken: process.env.AI_SERVICE_TOKEN,
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "CodePulse <no-reply@example.com>",
  },
  passwordResetUrl:
    process.env.PASSWORD_RESET_URL || "http://localhost:3000/reset-password",
  emailOtpTtlMinutes: Number(process.env.EMAIL_OTP_TTL_MINUTES || 5),
  emailOtpResendSeconds: Number(process.env.EMAIL_OTP_RESEND_SECONDS || 60),
  cfVerificationTtlMinutes: Number(
    process.env.CF_VERIFICATION_TTL_MINUTES || 20,
  ),
  cfVerificationMaxAttempts: Number(
    process.env.CF_VERIFICATION_MAX_ATTEMPTS || 5,
  ),
  cookieName: process.env.COOKIE_NAME || "cfi_session",
  cookieSecure: String(process.env.COOKIE_SECURE || "false") === "true",
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
};
