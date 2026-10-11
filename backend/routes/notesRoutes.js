import express from "express";

import { protect, authorize } from "../middleware/auth.js";
import { uploadNotes } from "../config/cloudinary.js";

import {
  uploadNote,
  getNotes,
  getNote,
  downloadNote,
  toggleLike,
  deleteNote,
  updateNote,
  getNotesStats,
} from "../controllers/notesController.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin"), getNotesStats);
router.get("/", getNotes);
router.post("/", protect, uploadNotes.single("file"), uploadNote);
router.get("/:id", getNote);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);
router.put("/:id/download", protect, downloadNote);
router.put("/:id/like", protect, toggleLike);

export default router;
