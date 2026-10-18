import express from "express";
import { uploadImage } from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/conversations", protect, getOrCreateConversation);
router.get("/conversations", protect, getConversations);
router.get("/conversations/:conversationId/messages", protect, getMessages);
router.post(
  "/conversations/:conversationId/messages",
  protect,
  uploadImage.single("image"),
  sendMessage,
);
router.delete("/messages/:messageId", protect, deleteMessage);

export default router;
