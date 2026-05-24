// userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { getUserProfile, getUserPosts, toggleFollow, searchUsers, getSavedPosts, getSuggestedUsers } = require('../controllers/userController');

router.get('/search', searchUsers);
router.get('/suggestions', protect, getSuggestedUsers);
router.get('/saved-posts', protect, getSavedPosts);
router.get('/:username', optionalAuth, getUserProfile);
router.get('/:username/posts', getUserPosts);
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;
