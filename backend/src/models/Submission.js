import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    submissionId: { type: Number, required: true },
    contestId: Number,
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    problemContestId: Number,
    problemIndex: String,
    problemName: String,
    problemRating: Number,
    tags: { type: [String], default: [] },
    verdict: String,
    language: String,
    timeMs: Number,
    memoryKb: Number,
    createdAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

SubmissionSchema.index({ userId: 1, submissionId: 1 }, { unique: true });
SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ userId: 1, verdict: 1, createdAt: -1 });

export const Submission = mongoose.model("Submission", SubmissionSchema);
