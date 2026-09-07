import { asyncHandler, AppError } from "../utils/errors.js";
import { AIConversation } from "../models/AIConversation.js";
import { AIInsight } from "../models/AIInsight.js";
import { buildAiContext } from "../services/aiContext.js";
import { callAi } from "../services/aiClient.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";

async function aiContextWithCandidates(user) {
  const context = await buildAiContext(user);
  const solved = await Submission.find({ userId: user._id, verdict: "OK" })
    .select("problemContestId problemIndex")
    .lean();
  const solvedKeys = new Set(
    solved.map((item) => `${item.problemContestId}:${item.problemIndex}`),
  );
  const rating = user.cfProfile?.rating || 1200;
  const candidates = await Problem.find({
    rating: {
      $gte: Math.max(800, rating - 300),
      $lte: Math.min(3500, rating + 300),
    },
  })
    .sort({ solvedCount: -1 })
    .limit(80)
    .lean();
  return {
    context,
    candidates: candidates
      .filter(
        (problem) => !solvedKeys.has(`${problem.contestId}:${problem.index}`),
      )
      .slice(0, 40)
      .map(
        ({
          _id,
          contestId,
          index,
          name,
          rating: problemRating,
          tags,
          url,
        }) => ({
          problemId: String(_id),
          contestId,
          index,
          title: name,
          rating: problemRating,
          tags,
          url,
        }),
      ),
  };
}

export const insights = asyncHandler(async (req, res) => {
  const recent = await AIInsight.findOne({
    userId: req.user._id,
    type: "insight",
  })
    .sort({ generatedAt: -1 })
    .lean();
  if (recent)
    return res.json({
      ...recent.content,
      generatedAt: recent.generatedAt,
      id: String(recent._id),
    });
  const context = await buildAiContext(req.user);
  const data = await callAi("/insights", { context });
  await AIInsight.create({
    userId: req.user._id,
    type: "insight",
    content: data,
  });
  res.json({ ...data, generatedAt: new Date() });
});

export const conversations = asyncHandler(async (req, res) => {
  const rows = await AIConversation.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("_id title createdAt updatedAt")
    .lean();
  res.json({
    conversations: rows.map((c) => ({
      id: String(c._id),
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
});

export const conversation = asyncHandler(async (req, res) => {
  const c = await AIConversation.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();
  if (!c) throw new AppError(404, "Conversation not found.", "NOT_FOUND");
  res.json({
    conversation: { id: String(c._id), title: c.title, createdAt: c.createdAt },
    messages: c.messages,
  });
});

export const createConversation = asyncHandler(async (req, res) => {
  const c = await AIConversation.create({
    userId: req.user._id,
    title: req.body?.title || "New Conversation",
  });
  res.status(201).json({
    conversation: {
      id: String(c._id),
      title: c.title,
      createdAt: c.createdAt,
    },
  });
});

export const renameConversation = asyncHandler(async (req, res) => {
  const c = await AIConversation.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title: String(req.body?.title || "Conversation").slice(0, 120) },
    { new: true },
  );
  if (!c) throw new AppError(404, "Conversation not found.", "NOT_FOUND");
  res.json({
    conversation: {
      id: String(c._id),
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    },
  });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  await AIConversation.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ message: "Conversation deleted." });
});

export const chat = asyncHandler(async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message)
    throw new AppError(400, "Message is required.", "VALIDATION_ERROR");
  let conversation = req.body?.conversationId
    ? await AIConversation.findOne({
        _id: req.body.conversationId,
        userId: req.user._id,
      })
    : null;
  if (!conversation)
    conversation = await AIConversation.create({
      userId: req.user._id,
      title: message.slice(0, 60),
    });
  conversation.messages.push({ role: "user", content: message });
  const context = await buildAiContext(req.user);
  const history = conversation.messages
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));
  const data = await callAi("/chat", {
    message,
    history,
    context,
    focus: req.user.aiFocus,
  });
  conversation.messages.push({
    role: "assistant",
    content: data.response || "No response received.",
  });
  if (conversation.title === "New Conversation")
    conversation.title = message.slice(0, 60);
  await conversation.save();
  res.json({
    response: data.response,
    conversationId: String(conversation._id),
  });
});

export const weeklyReport = asyncHandler(async (req, res) => {
  if (req.method === "GET") {
    const recent = await AIInsight.findOne({
      userId: req.user._id,
      type: "weekly_report",
    })
      .sort({ generatedAt: -1 })
      .lean();
    return res.json(
      recent
        ? {
            ...recent.content,
            generatedAt: recent.generatedAt,
            id: String(recent._id),
          }
        : {},
    );
  }
  const context = await buildAiContext(req.user);
  const data = await callAi("/weekly-report", { context });
  const saved = await AIInsight.create({
    userId: req.user._id,
    type: "weekly_report",
    content: data,
  });
  res.json({ ...data, generatedAt: saved.generatedAt, id: String(saved._id) });
});

export const dailyPractice = asyncHandler(async (req, res) => {
  const { context, candidates } = await aiContextWithCandidates(req.user);
  res.json(await callAi("/daily-practice", { context, candidates }));
});

export const aiRecommendations = asyncHandler(async (req, res) => {
  const { context, candidates } = await aiContextWithCandidates(req.user);
  res.json(await callAi("/recommendations", { context, candidates }));
});

export const roadmap = asyncHandler(async (req, res) => {
  const context = await buildAiContext(req.user);
  res.json(
    await callAi("/roadmap", { context, days: Number(req.query.days || 30) }),
  );
});
