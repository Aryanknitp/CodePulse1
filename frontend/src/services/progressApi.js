import { apiClient } from "./apiClient.js";

function toQuery(params) {
  if (!params) return "";
  const q = new URLSearchParams(params).toString();
  return q ? "?" + q : "";
}

export const progressApi = {
  getProgress: (params) => apiClient.get("/api/v1/progress" + toQuery(params)),
};
