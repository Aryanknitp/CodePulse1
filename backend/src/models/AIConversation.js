import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, default: "New Conversation", maxlength: 120 },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

export const AIConversation = mongoose.model(
  "AIConversation",
  ConversationSchema,
);
