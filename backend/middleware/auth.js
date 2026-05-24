const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/apiResponse');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check cookie first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(createError('Authentication required. Please log in.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createError('Session expired. Please log in again.', 401));
      }
      return next(createError('Invalid authentication token.', 401));
    }

    // Get user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(createError('User no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(createError('Your account has been deactivated.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(`Access denied. Required role: ${roles.join(', ')}`, 403));
    }
    next();
  };
};

// Optional auth - attach user if token present but don't block
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // ignore token errors for optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
