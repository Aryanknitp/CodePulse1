import { apiClient } from "./apiClient.js";

function toQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams(params).toString();
  return q ? "?" + q : "";
}

export const problemsApi = {
  getProblems: (params) => apiClient.get("/api/v1/problems" + toQuery(params)),
  getProblem: (id) => apiClient.get(`/api/v1/problems/${id}`),
  getHistory: (params) =>
    apiClient.get("/api/v1/problems/history" + toQuery(params)),
};
