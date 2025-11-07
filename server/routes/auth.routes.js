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

const router = express.Router();

router.post("/register", register);
router.post("/verify-registration-otp", verifyRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", sendForgotPasswordEmail);
router.post("/verify-password-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/logout", authMiddleware, logout);
router.get("/refresh", refreshAccessToken);

export default router;
