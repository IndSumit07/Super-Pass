import express from "express";
import {
  getPricingPlans,
  getCurrentSubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route
router.get("/pricing", getPricingPlans);

// Protected routes
router.get("/current", authMiddleware, getCurrentSubscription);
router.post("/create-order", authMiddleware, createSubscriptionOrder);
router.post("/verify-payment", authMiddleware, verifySubscriptionPayment);
router.post("/cancel", authMiddleware, cancelSubscription);

export default router;
