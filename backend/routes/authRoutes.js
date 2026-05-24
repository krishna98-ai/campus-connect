const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');
const {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, uploadAvatar.single('avatar'), updateProfile);

module.exports = router;
