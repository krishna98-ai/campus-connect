const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadNotes } = require('../config/cloudinary');
const {
  uploadNote,
  getNotes,
  getNote,
  downloadNote,
  toggleLike,
  deleteNote,
  updateNote,
  getNotesStats,
} = require('../controllers/notesController');

router.get('/stats', protect, authorize('admin'), getNotesStats);
router.get('/', getNotes);
router.post('/', protect, uploadNotes.single('file'), uploadNote);
router.get('/:id', getNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);
router.put('/:id/download', protect, downloadNote);
router.put('/:id/like', protect, toggleLike);

module.exports = router;
