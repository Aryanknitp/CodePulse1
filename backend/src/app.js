import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";

// Routes Imports
import authRoutes from "./routes/auth.js";
import codeforcesRoutes from "./routes/codeforces.js";
import analyticsRoutes from "./routes/analytics.js";
import problemsRoutes from "./routes/problems.js";
import recommendationRoutes from "./routes/recommendations.js";
import aiRoutes from "./routes/ai.js";
import progressRoutes from "./routes/progress.js";
import contestRoutes from "./routes/contests.js";
import userRoutes from "./routes/users.js";

// Middleware Imports
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

// Security Setting
app.disable("x-powered-by");

// CORS Configuration (Production ke liye dynamic fallback ke saath)
// CORS Configuration (Production ready with strict credentials checking)
const allowedOrigin = env.frontendOrigin || "https://vercel.app";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Direct Health Checks
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "codeforces-insights-backend" }),
);
app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));

// Feature Main API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/codeforces", codeforcesRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/problems", problemsRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/contests", contestRoutes);
app.use("/api/v1/users", userRoutes);

// Error Handling Middlewares (Saare routes ke hamesha baad mein)
app.use(notFound);
app.use(errorHandler);

export default app;
