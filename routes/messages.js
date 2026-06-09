import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import { getConversation } from "../controllers/messageController.js";

const router = Router();

router.get("/:userId", authMiddleware, getConversation);

export default router;
