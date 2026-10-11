import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createError } from "../utils/apiResponse.js";

// Get token from cookie or Authorization header
const getToken = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

// Protect routes
const protect = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return next(createError("Authentication required. Please log in.", 401));
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return next(createError("Session expired. Please log in again.", 401));
      }

      return next(createError("Invalid authentication token.", 401));
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(createError("User no longer exists.", 401));
    }

    if (!user.isActive) {
      return next(createError("Your account has been deactivated.", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError("Access denied.", 403));
    }

    next();
  };
};

// Attach user if a valid token exists
const optionalAuth = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user?.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Continue without a user if the token is invalid
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { protect, authorize, optionalAuth };
