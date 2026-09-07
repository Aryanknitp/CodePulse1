import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { verifySession } from "../utils/auth.js";
import { AppError } from "../utils/errors.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token)
      throw new AppError(401, "Authentication required.", "UNAUTHORIZED");
    const payload = verifySession(token);
    const user = await User.findById(payload.sub);
    if (!user)
      throw new AppError(
        401,
        "User session is no longer valid.",
        "UNAUTHORIZED",
      );
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
