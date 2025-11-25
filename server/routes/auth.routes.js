import express from "express";
import {
  register,
  verifyRegistrationOtp,
  login,
  logout,
  refreshAccessToken,
  sendForgotPasswordEmail,
  verifyPasswordResetOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/security.middleware.js";
import {
  validateRegistration,
  validateLogin,
  validateOTPInput,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post("/register", validateRegistration, register);
router.post("/verify-registration-otp", validateOTPInput, verifyRegistrationOtp);
router.post("/login", login); // Temporarily removed validation
router.post("/forgot-password", sendForgotPasswordEmail);
router.post("/verify-password-reset-otp", validateOTPInput, verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/logout", authMiddleware, logout);
router.get("/refresh", refreshAccessToken);

export default router;
