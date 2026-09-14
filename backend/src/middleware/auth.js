import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { verifySession } from "../utils/auth.js";
import { AppError } from "../utils/errors.js";

export async function requireAuth(req, res, next) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      throw new AppError(401, "Authentication required.", "UNAUTHORIZED");
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    req.user = await getAuthenticatedUser(req);
    next();
  } catch (err) {
    if (err.code === "UNAUTHORIZED") {
      req.user = null;
      return next();
    }
    next(err);
  }
}

async function getAuthenticatedUser(req) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return null;
  const payload = verifySession(token);
  return User.findById(payload.sub);
}
