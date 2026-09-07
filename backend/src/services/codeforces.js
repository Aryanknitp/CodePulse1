import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

let lastRequestAt = 0;
let queue = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttledFetch(url) {
  const request = queue.then(async () => {
    const wait = Math.max(0, 2200 - (Date.now() - lastRequestAt));
    if (wait) await sleep(wait);
    lastRequestAt = Date.now();
    const response = await fetch(url, {
      headers: { "User-Agent": "Codeforces-Insights/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    if (!response.ok)
      throw new AppError(
        503,
        "Codeforces API is unavailable.",
        "CF_UNAVAILABLE",
      );
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new AppError(
        503,
        "Invalid response from Codeforces.",
        "CF_BAD_RESPONSE",
      );
    }
    if (body.status !== "OK") {
      const comment = body.comment || "Codeforces request failed.";
      if (/call limit/i.test(comment))
        throw new AppError(429, comment, "CF_RATE_LIMITED");
      throw new AppError(502, comment, "CF_API_FAILED");
    }
    console.log("correctly data", {
      endpoint: new URL(url).pathname,
      count: Array.isArray(body.result) ? body.result.length : 1,
    });
    return body.result;
  });

  const safeRequest = request.catch((err) => {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      throw new AppError(503, "Codeforces request timed out.", "CF_TIMEOUT");
    }
    throw err;
  });

  queue = safeRequest.catch(() => undefined);
  return safeRequest;
}

function api(path, params) {
  const url = new URL(`${env.cfApiUrl}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  return throttledFetch(url.toString());
}

export function getUserInfo(handle) {
  return api("/user.info", { handles: handle });
}

export function getUserRating(handle) {
  return api("/user.rating", { handle });
}

export function getUserStatus(handle, count = 1000) {
  return api("/user.status", { handle, from: 1, count });
}

export function getProblemset() {
  return api("/problemset.problems");
}

export function getContestStandings(contestId, handle, count = 1) {
  return api("/contest.standings", {
    contestId,
    handles: handle,
    from: 1,
    count,
  });
}
