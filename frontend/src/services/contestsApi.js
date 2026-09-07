import { apiClient } from "./apiClient.js";

function toQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams(params).toString();
  return q ? "?" + q : "";
}

export const contestsApi = {
  getContests: (params) => apiClient.get("/api/v1/contests" + toQuery(params)),
  getContest: (id) => apiClient.get(`/api/v1/contests/${id}`),
};
