const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const {
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
} = require('../controllers/postController');

router.get('/trending', getTrendingPosts);
router.get('/', optionalAuth, getPosts);
router.post('/', protect, uploadImage.array('images', 4), createPost);
router.get('/:id', optionalAuth, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/save', protect, toggleSavePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/comments/:commentId/replies', protect, addReply);

module.exports = router;
