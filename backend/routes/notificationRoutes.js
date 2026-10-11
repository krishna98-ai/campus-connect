import express from "express";

import { protect } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;
