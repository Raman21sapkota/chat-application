import { Router } from "express";
import authMiddleware from "../middleware/auth.js";
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  listFriends,
  listRequests,
} from "../controllers/friendController.js";

const router = Router();

router.get("/", authMiddleware, listFriends);
router.get("/requests", authMiddleware, listRequests);
router.post("/request/:id", authMiddleware, sendRequest);
router.post("/accept/:id", authMiddleware, acceptRequest);
router.post("/reject/:id", authMiddleware, rejectRequest);

export default router;
