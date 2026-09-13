import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import codeforcesRoutes from "./routes/codeforces.js";
import analyticsRoutes from "./routes/analytics.js";
import problemsRoutes from "./routes/problems.js";
import recommendationRoutes from "./routes/recommendations.js";
import aiRoutes from "./routes/ai.js";
import progressRoutes from "./routes/progress.js";
import contestRoutes from "./routes/contests.js";
import userRoutes from "./routes/users.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
app.disable("x-powered-by");
app.use(cors(
  { origin: env.frontendOrigin, credentials: true }
));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "codeforces-insights-backend" }),
  
);
app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/codeforces", codeforcesRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/problems", problemsRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
