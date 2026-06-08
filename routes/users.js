import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import { searchUsers, getMe, getUserById } from "../controllers/userController.js";

const router = Router();

router.get("/", authMiddleware, searchUsers);
router.get("/me", authMiddleware, getMe);
router.get("/:id", authMiddleware, getUserById);

export default router;
