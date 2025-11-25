import express from "express";
import {
  getWithdrawalDashboard,
  requestWithdrawal,
  getWithdrawalHistory,
  cancelWithdrawal,
  processWithdrawal,
  getAllWithdrawals,
} from "../controllers/withdrawal.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// User routes
router.get("/dashboard", getWithdrawalDashboard);
router.post("/request", requestWithdrawal);
router.get("/history", getWithdrawalHistory);
router.patch("/:withdrawalId/cancel", cancelWithdrawal);

// Admin routes
router.patch("/:withdrawalId/process", adminMiddleware, processWithdrawal);
router.get("/admin/all", adminMiddleware, getAllWithdrawals);

export default router;
