import { asyncHandler, AppError } from "../utils/errors.js";
import { User } from "../models/User.js";
import { Submission } from "../models/Submission.js";
import { Contest } from "../models/Contest.js";
import { Recommendation } from "../models/Recommendation.js";
import { AIConversation } from "../models/AIConversation.js";
import { AIInsight } from "../models/AIInsight.js";
import { clearSessionCookie } from "../utils/auth.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  delete user.passwordHash;
  delete user.cfVerificationCode;
  delete user.emailVerificationCodeHash;
  delete user.passwordResetTokenHash;
  res.json({ user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "notificationPrefs", "aiFocus", "autoSync"];
  for (const key of allowed)
    if (req.body?.[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  res.json({ user: req.user.toObject() });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Promise.all([
    Submission.deleteMany({ userId }),
    Contest.deleteMany({ userId }),
    Recommendation.deleteMany({ userId }),
    AIConversation.deleteMany({ userId }),
    AIInsight.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);
  clearSessionCookie(res);
  res.json({ message: "Account deleted." });
});
