// routes/checkin.routes.js
import express from "express";
import { isEventOwner } from "../middlewares/isEventOwner.js";
import {
  scanPass,
  getEventCheckins,
} from "../controllers/checkin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const checkinRouter = express.Router();

// Creator-only
checkinRouter.post("/:eventId/scan", authMiddleware, isEventOwner, scanPass);
checkinRouter.get("/:eventId", authMiddleware, isEventOwner, getEventCheckins);

export default checkinRouter;
