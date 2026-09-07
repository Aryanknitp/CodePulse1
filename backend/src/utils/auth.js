import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errors.js';

export function signSession(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifySession(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, 'Authentication required.', 'UNAUTHORIZED');
  }
}

export function setSessionCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(env.cookieName, { httpOnly: true, secure: env.cookieSecure, sameSite: env.cookieSameSite, path: '/' });
}
