import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema(
  {
    contestId: { type: Number, required: true, index: true },
    index: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, index: true },
    tags: { type: [String], default: [] },
    points: Number,
    solvedCount: Number,
    url: { type: String, required: true },
    createdAt: { type: Date },
  },
  { timestamps: true },
);

ProblemSchema.index({ contestId: 1, index: 1 }, { unique: true });
ProblemSchema.index({ name: "text", tags: "text" });

export const Problem = mongoose.model("Problem", ProblemSchema);
