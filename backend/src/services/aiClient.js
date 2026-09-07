import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export async function callAi(path, payload) {
  try {
    const response = await fetch(`${env.aiServiceUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.aiServiceToken}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new AppError(
        response.status,
        data?.detail || data?.message || "AI service error.",
        "AI_SERVICE_ERROR",
      );
    return data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(503, "AI service unavailable.", "AI_UNAVAILABLE");
  }
}
