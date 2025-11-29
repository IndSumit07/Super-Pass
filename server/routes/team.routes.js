// routes/team.routes.js
import { Router } from "express";
import {
  createTeamRegistration,
  getTeamRegistration,
  getInviteByToken,
  sendInviteOTP,
  verifyInviteOTP,
  getMyTeams,
  resendInvite,
  cancelTeamRegistration,
} from "../controllers/team.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const teamRouter = Router();

// Protected routes (require authentication)
teamRouter.post("/register", authMiddleware, createTeamRegistration);
teamRouter.get("/my-teams", authMiddleware, getMyTeams);
teamRouter.get("/:teamId", authMiddleware, getTeamRegistration);
teamRouter.post("/:teamId/resend-invite", authMiddleware, resendInvite);
teamRouter.delete("/:teamId", authMiddleware, cancelTeamRegistration);

// Invite-specific routes (require authentication)
teamRouter.get("/invite/:token", getInviteByToken); // Can be accessed without auth to see invite details
teamRouter.post("/invite/:token/send-otp", authMiddleware, sendInviteOTP);
teamRouter.post("/invite/:token/verify-otp", authMiddleware, verifyInviteOTP);

export default teamRouter;
