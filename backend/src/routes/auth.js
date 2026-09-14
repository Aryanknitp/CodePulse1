import { Router } from "express";
import * as c from "../controllers/auth.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Authentication Routes
router.post("/register", authLimiter, c.register);
router.post("/verify-email", otpLimiter, c.verifyEmail);
router.post("/resend-otp", otpLimiter, c.resendOtp);
router.post("/login", authLimiter, c.login);
router.post("/logout", c.logout);
router.get("/me", optionalAuth, (req, res) => {
  if (!req.user) return res.json({ user: null });
  return c.me(req, res);
});

// Password Management Routes
router.post("/forgot-password", authLimiter, c.forgotPassword);
router.post("/reset-password", authLimiter, c.resetPassword);

// NOTE: check kijiye agar aapka controller changePassword hai toh yahan c.changePassword likhein
router.post(
  "/change-password",
  requireAuth,
  authLimiter,
  c.changePassword || c.resetPassword,
);

export default router;
