import { apiClient } from "./apiClient.js";

export const authApi = {
  register: (data) => apiClient.post("/api/v1/auth/register", data),
  verifyEmail: (data) => apiClient.post("/api/v1/auth/verify-email", data),
  resendOTP: (data) => apiClient.post("/api/v1/auth/resend-otp", data),
  login: (data) => apiClient.post("/api/v1/auth/login", data),
  logout: () => apiClient.post("/api/v1/auth/logout"),
  forgotPassword: (data) =>
    apiClient.post("/api/v1/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/api/v1/auth/reset-password", data),
  changePassword: (data) =>
    apiClient.post("/api/v1/auth/change-password", data),
  getCurrentUser: () => apiClient.get("/api/v1/auth/me"),
};
