import { Router } from "express";
import {
  createTicket,
  myTickets,
  allTickets,
} from "../controllers/help.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const helpRouter = Router();

// Create ticket (allow logged-in; optionally accept guests if you want)
helpRouter.post("/", authMiddleware, createTicket);

// Current user's tickets
helpRouter.get("/mine", authMiddleware, myTickets);

// Admin view (optional)
helpRouter.get("/", authMiddleware, allTickets);

export default helpRouter;
