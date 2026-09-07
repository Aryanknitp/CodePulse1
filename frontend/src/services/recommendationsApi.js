import { apiClient } from "./apiClient.js";

function toQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams(params).toString();
  return q ? "?" + q : "";
}

export const recommendationsApi = {
  getToday: () => apiClient.get("/api/v1/recommendations/today"),
  getRecommended: (params) =>
    apiClient.get("/api/v1/recommendations" + toQuery(params)),
  markCompleted: (id) =>
    apiClient.post(`/api/v1/recommendations/${id}/complete`),
  skip: (id) => apiClient.post(`/api/v1/recommendations/${id}/skip`),
  markNotRelevant: (id) =>
    apiClient.post(`/api/v1/recommendations/${id}/not-relevant`),
  getHistory: (params) =>
    apiClient.get("/api/v1/recommendations/history" + toQuery(params)),
};
