// routes/event.routes.js
import { Router } from "express";
import {
  createEvent,
  updateEvent,
  getEvents,
  getEventById,
  deleteEvent,
} from "../controllers/event.controller.js";
import { uploadEventMedia } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// If you have auth middleware, plug it here:

const eventRouter = Router();

// Public: list + details
eventRouter.get("/", getEvents);
eventRouter.get("/:idOrSlug", getEventById);

// Protected: create/update/delete
eventRouter.post("/create", authMiddleware, uploadEventMedia, createEvent);
eventRouter.put("/:idOrSlug", authMiddleware, uploadEventMedia, updateEvent);
eventRouter.delete("/:idOrSlug", authMiddleware, deleteEvent);

export default eventRouter;
