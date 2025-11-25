// routes/payment.routes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paymentLimiter } from "../middlewares/security.middleware.js";

const paymentRouter = express.Router();

// Apply stricter rate limiting to payment endpoints
paymentRouter.use(paymentLimiter);

paymentRouter.post("/order", authMiddleware, createOrder);
paymentRouter.post("/verify", authMiddleware, verifyPayment);

export default paymentRouter;
