import { apiClient } from "./apiClient.js";

export const aiApi = {
  getInsights: () => apiClient.get("/api/v1/ai/insights"),
  chat: (data) => apiClient.post("/api/v1/ai/chat", data),
  getConversations: () => apiClient.get("/api/v1/ai/conversations"),
  getConversation: (id) => apiClient.get(`/api/v1/ai/conversations/${id}`),
  createConversation: (data) =>
    apiClient.post("/api/v1/ai/conversations", data),
  renameConversation: (id, data) =>
    apiClient.patch(`/api/v1/ai/conversations/${id}`, data),
  deleteConversation: (id) =>
    apiClient.delete(`/api/v1/ai/conversations/${id}`),
  getWeeklyReport: () => apiClient.get("/api/v1/ai/weekly-report"),
  generateWeeklyReport: () => apiClient.post("/api/v1/ai/weekly-report"),
  generateDailyPractice: () => apiClient.post("/api/v1/ai/daily-practice"),
  getAiRecommendations: () => apiClient.get("/api/v1/ai/recommendations"),
  getRoadmap: (days = 30) => apiClient.get(`/api/v1/ai/roadmap?days=${days}`),
};
