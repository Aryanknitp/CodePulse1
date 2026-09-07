import mongoose from "mongoose";

const SyncStageSchema = new mongoose.Schema(
  {
    id: String,
    status: {
      type: String,
      enum: ["pending", "running", "complete", "failed"],
    },
    error: String,
  },
  { _id: false },
);

const SyncJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["running", "complete", "failed"],
      default: "running",
    },
    stages: [SyncStageSchema],
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    error: String,
  },
  { timestamps: true },
);

export const SyncJob = mongoose.model("SyncJob", SyncJobSchema);
