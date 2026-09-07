import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    contestId: { type: Number, required: true },
    name: String,
    date: Date,
    rank: Number,
    ratingChange: Number,
    oldRating: Number,
    newRating: Number,
    solved: { type: Number, default: 0 },
    problems: [
      {
        name: String,
        index: String,
        solved: Boolean,
        rating: Number,
        tags: [String],
        url: String,
      },
    ],
  },
  { timestamps: true },
);

ContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });

export const Contest = mongoose.model("Contest", ContestSchema);
