import { apiClient } from "./apiClient.js";

export const analyticsApi = {
  getOverview: (params) =>
    apiClient.get("/api/v1/analytics/overview" + toQuery(params)),
  getRating: (params) =>
    apiClient.get("/api/v1/analytics/rating" + toQuery(params)),
  getDifficulty: (params) =>
    apiClient.get("/api/v1/analytics/difficulty" + toQuery(params)),
  getTopics: (params) =>
    apiClient.get("/api/v1/analytics/topics" + toQuery(params)),
  getSubmissions: (params) =>
    apiClient.get("/api/v1/analytics/submissions" + toQuery(params)),
  getContests: (params) =>
    apiClient.get("/api/v1/analytics/contests" + toQuery(params)),
};

function toQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams(params).toString();
  return q ? "?" + q : "";
}
