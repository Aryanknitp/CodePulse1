import mongoose from "mongoose";

const AIInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["insight", "weekly_report"],
      default: "insight",
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

AIInsightSchema.index({ userId: 1, type: 1, generatedAt: -1 });

export const AIInsight = mongoose.model("AIInsight", AIInsightSchema);
