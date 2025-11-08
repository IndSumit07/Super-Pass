// routes/pass.routes.js
import express from "express";
import { myPasses, getPassById } from "../controllers/pass.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const passRouter = express.Router();

passRouter.get("/", authMiddleware, myPasses);
passRouter.get("/:id", authMiddleware, getPassById);

export default passRouter;
