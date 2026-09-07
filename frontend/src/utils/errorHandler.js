export function getErrorMessage(error) {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return "An unexpected error occurred.";
}

export function isNetworkError(error) {
  return !error.response && error.request;
}

export function isAuthError(error) {
  return error.response?.status === 401;
}

export function isRateLimitError(error) {
  return error.response?.status === 429;
}
