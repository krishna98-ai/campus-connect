import express from "express";

import { protect } from "../middleware/auth.js";
import { uploadAvatar } from "../config/cloudinary.js";

import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/update-password", protect, updatePassword);
router.put(
  "/update-profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile,
);

export default router;
