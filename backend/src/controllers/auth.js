import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { randomNumericOtp, sha256, randomToken } from "../utils/crypto.js";
import { env } from "../config/env.js";
import { sendEmailOtp, sendPasswordReset } from "../services/mailer.js";
import {
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from "../utils/auth.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordErrors(password = "") {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters.");
  if (!/[A-Z]/.test(password))
    errors.push("Password must include an uppercase letter.");
  if (!/[a-z]/.test(password))
    errors.push("Password must include a lowercase letter.");
  if (!/\d/.test(password)) errors.push("Password must include a number.");
  return errors;
}

// function for register routes
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim())
    throw new AppError(400, "Name is required.", "VALIDATION_ERROR");
  if (!emailRegex.test(email || ""))
    throw new AppError(400, "Enter a valid email address.", "VALIDATION_ERROR");
  const pwErrors = passwordErrors(password);
  if (pwErrors.length) throw new AppError(400, pwErrors[0], "VALIDATION_ERROR");

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user?.emailVerified)
    throw new AppError(
      409,
      "An account with this email already exists.",
      "EMAIL_EXISTS",
    );
  // console.log(email);

  // Hashing the password
  const passwordHash = await bcrypt.hash(password, 12);
  // console.log(password);
  const otp = randomNumericOtp();
  if (!user) {
    user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
    });
  } else {
    user.name = name.trim();
    user.passwordHash = passwordHash;
  }
  user.emailVerificationCodeHash = sha256(otp);
  user.emailVerificationExpiresAt = new Date(
    Date.now() + env.emailOtpTtlMinutes * 60000,
  );
  user.emailVerificationAttempts = 0;
  user.emailOtpLastSentAt = new Date();
  await user.save();
  await sendEmailOtp(user.email, otp);
  res.status(201).json({
    message: "Verification code sent to your email.",
    email: user.email,
  });
});

// Verify Email Message
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user) throw new AppError(404, "Account not found.", "NOT_FOUND");
  if (user.emailVerified)
    return res.json({ message: "Email already verified." });
  if (user.emailVerificationAttempts >= 5)
    throw new AppError(
      429,
      "Too many attempts. Please request a new code later.",
      "TOO_MANY_ATTEMPTS",
    );
  if (
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt < new Date()
  )
    throw new AppError(410, "Verification code expired.", "OTP_EXPIRED");
  user.emailVerificationAttempts += 1;
  if (sha256(String(otp)) !== user.emailVerificationCodeHash) {
    await user.save();
    throw new AppError(401, "Invalid verification code.", "OTP_INVALID");
  }
  user.emailVerified = true;
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();
  setSessionCookie(res, signSession(user));
  res.json({
    message: "Email verified.",
    user: { id: String(user._id), email: user.email, emailVerified: true },
  });
});

// Functino for resendOtp
export const resendOtp = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, "Account not found.", "NOT_FOUND");
  if (user.emailVerified)
    return res.json({ message: "Email already verified." });
  if (
    user.emailOtpLastSentAt &&
    Date.now() - user.emailOtpLastSentAt.getTime() <
      env.emailOtpResendSeconds * 1000
  ) {
    throw new AppError(
      429,
      "Please wait before requesting another code.",
      "OTP_COOLDOWN",
    );
  }
  const otp = randomNumericOtp();
  user.emailVerificationCodeHash = sha256(otp);
  user.emailVerificationExpiresAt = new Date(
    Date.now() + env.emailOtpTtlMinutes * 60000,
  );
  user.emailVerificationAttempts = 0;
  user.emailOtpLastSentAt = new Date();
  await user.save();
  await sendEmailOtp(user.email, otp);
  res.json({ message: "Verification code sent." });
});

// Login Controller
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  if (!user.emailVerified)
    throw new AppError(
      403,
      "Please verify your email before signing in.",
      "EMAIL_NOT_VERIFIED",
    );
  setSessionCookie(res, signSession(user));
  res.json({ message: "Logged in." });
});

// Logout Controller
export const logout = asyncHandler(async (req, res) => {
  clearSessionCookie(res);
  res.json({ message: "Logged out." });
});

// Me Controller
export const me = asyncHandler(async (req, res) => {
  const u = req.user.toObject();
  delete u.passwordHash;
  delete u.emailVerificationCodeHash;
  delete u.passwordResetTokenHash;
  delete u.cfVerificationCode;
  res.json({ user: u });
});

// forgotPassword Controller
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").toLowerCase();
  const user = await User.findOne({ email });
  if (!user)
    return res.json({
      message: "If an account exists, a reset email has been sent.",
    });
  const token = randomToken();
  user.passwordResetTokenHash = sha256(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60000);
  await user.save();
  await sendPasswordReset(user.email, token);
  res.json({ message: "If an account exists, a reset email has been sent." });
});

// ResetPassword Controller
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, currentPassword } = req.body || {};
  const pwErrors = passwordErrors(password);
  if (pwErrors.length) throw new AppError(400, pwErrors[0], "VALIDATION_ERROR");

  if (currentPassword) {
    const user = req.user;
    if (!(await bcrypt.compare(currentPassword, user.passwordHash)))
      throw new AppError(
        401,
        "Current password is incorrect.",
        "INVALID_PASSWORD",
      );
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    return res.json({ message: "Password changed." });
  }

  if (!token)
    throw new AppError(400, "Reset token is required.", "VALIDATION_ERROR");
  const user = await User.findOne({
    passwordResetTokenHash: sha256(token),
    passwordResetExpiresAt: { $gt: new Date() },
  });
  if (!user)
    throw new AppError(
      410,
      "Reset link expired or invalid.",
      "RESET_TOKEN_EXPIRED",
    );
  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  res.json({ message: "Password reset successfully." });
});
