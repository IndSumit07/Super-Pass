// routes/checkin.routes.js
import express from "express";
import { isEventOwner } from "../middlewares/isEventOwner.js";
import {
  listCheckins,
  listParticipants,
  scanPass,
} from "../controllers/checkin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const checkinRouter = express.Router();

// Creator-only
checkinRouter.post("/:eventId/scan", authMiddleware, scanPass);
checkinRouter.get("/:eventId", authMiddleware, listCheckins);
checkinRouter.get("/:eventId/participants", authMiddleware, listParticipants);

export default checkinRouter;
