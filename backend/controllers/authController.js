const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwt');
const { sendSuccess, createError } = require('../utils/apiResponse');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return next(createError('Email already registered', 409));

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return next(createError('Username already taken', 409));

    const user = await User.create({ name, username, email, password });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(console.error);

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(createError('Invalid credentials', 401));

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return next(createError('Invalid credentials', 401));

    if (!user.isActive) {
      return next(createError('Your account has been deactivated. Contact support.', 403));
    }

    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    sendSuccess(res, 200, 'User fetched', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(createError('Email is required', 400));

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent.');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      sendSuccess(res, 200, 'Password reset email sent');
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(createError('Email sending failed. Please try again.', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return next(createError('Password is required', 400));

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return next(createError('Invalid or expired reset token', 400));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return next(createError('Current password is incorrect', 401));

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'college', 'department', 'year'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle avatar upload
    if (req.file) {
      const { cloudinary } = require('../config/cloudinary');

      // Delete old avatar from cloudinary
      if (req.user.avatar && req.user.avatar.public_id) {
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
      }

      updates.avatar = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};
