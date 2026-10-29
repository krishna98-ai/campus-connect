import express from "express";

import { protect, optionalAuth } from "../middleware/auth.js";
import {
  getUserProfile,
  getUserPosts,
  toggleFollow,
  searchUsers,
  getSavedPosts,
  getSuggestedUsers,
} from "../controllers/userController.js";

const router = express.Router();
router.get("/search", searchUsers);
router.get("/suggestions", protect, getSuggestedUsers);
router.get("/saved-posts", protect, getSavedPosts);
router.get("/:username", optionalAuth, getUserProfile);
router.get("/:username/posts", getUserPosts);
router.put("/:id/follow", protect, toggleFollow);

export default router;
