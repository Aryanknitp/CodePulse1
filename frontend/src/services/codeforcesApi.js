import { apiClient } from "./apiClient.js";

export const codeforcesApi = {
  connectHandle: (data) => apiClient.post("/api/v1/codeforces/connect", data),
  verifyOwnership: (data) => apiClient.post("/api/v1/codeforces/verify", data),
  getVerificationChallenge: () =>
    apiClient.get("/api/v1/codeforces/verification-challenge"),
  syncAccount: () => apiClient.post("/api/v1/codeforces/sync"),
  getProfile: () => apiClient.get("/api/v1/codeforces/profile"),
  disconnect: () => apiClient.post("/api/v1/codeforces/disconnect"),
};
