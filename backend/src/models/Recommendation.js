import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    problemName: String,
    rating: Number,
    tags: [String],
    preferredLanguage: String,
    reason: String,
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "recommended",
        "opened",
        "completed",
        "skipped",
        "not_relevant",
        "expired",
      ],
      default: "recommended",
    },
    recommendedAt: { type: Date, default: Date.now, index: true },
    completedAt: Date,
    dayKey: String,
  },
  { timestamps: true },
);

RecommendationSchema.index(
  { userId: 1, dayKey: 1, problemId: 1 },
  { unique: true },
);

export const Recommendation = mongoose.model(
  "Recommendation",
  RecommendationSchema,
);
