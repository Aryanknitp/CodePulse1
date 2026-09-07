import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // index: true,
    },
    passwordHash: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },
    emailVerificationCodeHash: { type: String },
    emailVerificationExpiresAt: { type: Date },
    emailVerificationAttempts: { type: Number, default: 0 },
    emailOtpLastSentAt: { type: Date },

    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date },

    codeforcesHandle: { type: String, trim: true, index: true },
    codeforcesVerified: { type: Boolean, default: false },
    cfVerificationCode: { type: String, select: false },
    cfVerificationExpiresAt: { type: Date },
    cfVerificationAttempts: { type: Number, default: 0 },

    notificationPrefs: {
      daily: { type: Boolean, default: true },
      weekly: { type: Boolean, default: true },
      syncFail: { type: Boolean, default: true },
    },
    aiFocus: {
      type: String,
      enum: ["competitive", "balanced", "foundations"],
      default: "balanced",
    },
    autoSync: { type: Boolean, default: true },

    cfProfile: {
      handle: String,
      rating: Number,
      maxRating: Number,
      rank: String,
      maxRank: String,
      avatar: String,
      lastSyncAt: Date,
      syncStatus: String,
      lastSyncError: String,
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model("User", UserSchema);
