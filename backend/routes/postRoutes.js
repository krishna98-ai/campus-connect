import express from "express";

import { protect, optionalAuth } from "../middleware/auth.js";
import { uploadImage } from "../config/cloudinary.js";

import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  addReply,
  getTrendingPosts,
  toggleSavePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/trending", getTrendingPosts);
router.get("/", optionalAuth, getPosts);
router.post("/", protect, uploadImage.array("images", 4), createPost);
router.get("/:id", optionalAuth, getPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, toggleLike);
router.put("/:id/save", protect, toggleSavePost);
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);
router.post("/:id/comments/:commentId/replies", protect, addReply);

export default router;
