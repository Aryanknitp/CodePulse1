import dotenv from "dotenv";
dotenv.config();

const required = [
  "MONGODB_URI",
  "JWT_SECRET",
  "AI_SERVICE_URL",
  "AI_SERVICE_TOKEN",
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(
      `[env] Warning: Missing ${key}; some functionality may be unavailable.`,
    );
  }
}

// Render local production validation fallback
const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin =
  process.env.FRONTEND_ORIGIN || "https://code-pulse1-sy6d.vercel.app";
export const env = {
  // Render injected PORT ensures absolute precedence
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin,
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
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "CodePulse <no-reply@example.com>",
  },
  resendApiKey:
    process.env.RESEND_API_KEY ||
    "https://code-pulse1-sy6d.vercel.app/resend-otp",
  passwordResetUrl: process.env.PASSWORD_RESET_URL,
  emailOtpTtlMinutes: Number(process.env.EMAIL_OTP_TTL_MINUTES || 5),
  emailOtpResendSeconds: Number(process.env.EMAIL_OTP_RESEND_SECONDS || 60),
  cfVerificationTtlMinutes: Number(
    process.env.CF_VERIFICATION_TTL_MINUTES || 20,
  ),
  cfVerificationMaxAttempts: Number(
    process.env.CF_VERIFICATION_MAX_ATTEMPTS || 5,
  ),
  cookieName: process.env.COOKIE_NAME || "cfi_session",
  // Production environment mein secure cookies aur cookies samesite property strict handle hoti hai
  cookieSecure: isProduction
    ? true
    : String(process.env.COOKIE_SECURE || "false") === "true",
  cookieSameSite: isProduction ? "none" : process.env.COOKIE_SAME_SITE || "lax",
};
