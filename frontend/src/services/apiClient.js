import { API_BASE_URL } from "../constants/app.js";

const DEFAULT_HEADERS = { "Content-Type": "application/json" };

async function request(method, path, data, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const config = {
    method,
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    credentials: "include",
    ...options,
  };
  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }
  const response = await fetch(url, config);
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const error = new Error(
      body?.message || `Request failed: ${response.status}`,
    );
    error.status = response.status;
    error.data = body;
    throw error;
  }
  return body;
}

export const apiClient = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, data, options) => request("POST", path, data, options),
  patch: (path, data, options) => request("PATCH", path, data, options),
  put: (path, data, options) => request("PUT", path, data, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
};
