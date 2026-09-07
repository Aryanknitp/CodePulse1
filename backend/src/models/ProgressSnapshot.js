import mongoose from "mongoose";

const ProgressSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    solvedCount: Number,
    rating: Number,
    acceptedSubmissions: Number,
    totalSubmissions: Number,
  },
  { timestamps: true },
);

ProgressSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

export const ProgressSnapshot = mongoose.model(
  "ProgressSnapshot",
  ProgressSnapshotSchema,
);
