import { apiClient } from "./apiClient.js";

export const userApi = {
  getMe: () => apiClient.get("/api/v1/users/me"),
  updateMe: (data) => apiClient.patch("/api/v1/users/me", data),
  deleteMe: () => apiClient.delete("/api/v1/users/me"),
};
