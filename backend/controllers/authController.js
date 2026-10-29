import crypto from "crypto";
import User from "../models/User.js";
import { sendTokenResponse, clearTokenCookie } from "../utils/jwt.js";
import { sendSuccess, createError } from "../utils/apiResponse.js";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSignupOtpEmail
} from "../services/emailService.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
// export const signup = async (req, res, next) => {
//   try {

//     console.log("1. Signup controller started");
//     const { name, username, email, password } = req.body;

//     if (!name || !username || !email || !password) {
//       return next(createError("All fields are required", 400));
//     }

//     const normalizedEmail = email.trim().toLowerCase();
//     const normalizedUsername = username.trim().toLowerCase();
// const existingEmail = await User.findOne({
//   email: normalizedEmail,
// });

// if (existingEmail) {
//   // Verified account: do not resend OTP
//   if (existingEmail.isEmailVerified) {
//     return next(
//       createError("Email already registered. Please login.", 409)
//     );
//   }

//   // Existing unverified account: generate a fresh OTP
//   const previousToken = existingEmail.emailVerificationToken;
//   const previousExpire = existingEmail.emailVerificationExpire;

//   const otp = existingEmail.getEmailVerificationToken();

//   await existingEmail.save({ validateBeforeSave: false });
// console.log("2. User saved");

// console.log("3. Sending OTP email");
//   try {
//     await sendSignupOtpEmail(
//       existingEmail.email,
//       existingEmail.name,
//       otp
//     );
//     console.log("4. OTP email function completed");
//   } catch (emailError) {
//     // Restore the previous OTP if email sending fails
//     existingEmail.emailVerificationToken = previousToken;
//     existingEmail.emailVerificationExpire = previousExpire;

//     await existingEmail.save({ validateBeforeSave: false });

//     return next(
//       createError("Unable to send OTP. Please try again.", 500)
//     );
//   }

//   return sendSuccess(
//     res,
//     200,
//     "Your account is not verified. A new OTP has been sent.",
//     {
//       email: existingEmail.email,
//       otpSent: true,
//     }
//   );
// }

//     const existingUsername = await User.findOne({
//       username: normalizedUsername,
//     });

//     if (existingUsername) {
//       return next(createError("Username already taken", 409));
//     }

//     const user = new User({
//       name: name.trim(),
//       username: normalizedUsername,
//       email: normalizedEmail,
//       password,
//       isEmailVerified: false,
//     });

//     const otp = user.getEmailVerificationToken();

//     await user.save();

//     try {
//       await sendSignupOtpEmail(user.email, user.name, otp);
//     } catch (emailError) {
//       await User.deleteOne({ _id: user._id });
//       throw emailError;
//     }

//     return sendSuccess(
//       res,
//       200,
//       "OTP sent successfully. Please verify your email.",
//       {
//         email: user.email,
//         otpSent: true,
//       },
//     );
//   } catch (error) {
//     next(error);
//   }
// };
export const signup = async (req, res, next) => {
  try {
    console.log("[SIGNUP 1] Controller started");

    const { name, username, email, password } = req.body;

    console.log("[SIGNUP 2] Request fields checked:", {
      hasName: Boolean(name),
      hasUsername: Boolean(username),
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
    });

    if (!name || !username || !email || !password) {
      console.log("[SIGNUP STOP] Required field missing");
      return next(createError("All fields are required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    console.log("[SIGNUP 3] Checking existing email");

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    console.log("[SIGNUP 4] Existing email check complete:", {
      found: Boolean(existingEmail),
      verified: existingEmail?.isEmailVerified,
    });

    if (existingEmail) {
      if (existingEmail.isEmailVerified) {
        console.log("[SIGNUP STOP] Email already verified");
        return next(
          createError("Email already registered. Please login.", 409),
        );
      }

      console.log("[SIGNUP 5] Existing unverified user; generating OTP");

      const previousToken = existingEmail.emailVerificationToken;
      const previousExpire = existingEmail.emailVerificationExpire;
      const otp = existingEmail.getEmailVerificationToken();

      console.log("[SIGNUP 6] Saving refreshed OTP");
      await existingEmail.save({ validateBeforeSave: false });
      console.log("[SIGNUP 7] Refreshed OTP saved");

      try {
        console.log("[SIGNUP 8] Sending OTP to existing user");
        await sendSignupOtpEmail(existingEmail.email, existingEmail.name, otp);
        console.log("[SIGNUP 9] OTP email completed");
      } catch (emailError) {
        console.error("[SIGNUP EMAIL FAILED - EXISTING USER]", {
          code: emailError.code,
          message: emailError.message,
        });

        existingEmail.emailVerificationToken = previousToken;
        existingEmail.emailVerificationExpire = previousExpire;
        await existingEmail.save({ validateBeforeSave: false });

        return next(createError("Unable to send OTP. Please try again.", 500));
      }

      console.log("[SIGNUP 10] Sending success response");
      return sendSuccess(
        res,
        200,
        "Your account is not verified. A new OTP has been sent.",
        {
          email: existingEmail.email,
          otpSent: true,
        },
      );
    }

    console.log("[SIGNUP 11] Checking username");

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });

    console.log("[SIGNUP 12] Username check complete:", {
      found: Boolean(existingUsername),
    });

    if (existingUsername) {
      console.log("[SIGNUP STOP] Username already taken");
      return next(createError("Username already taken", 409));
    }

    console.log("[SIGNUP 13] Creating user");

    const user = new User({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      isEmailVerified: false,
    });

    const otp = user.getEmailVerificationToken();

    console.log("[SIGNUP 14] Saving new user");
    await user.save();
    console.log("[SIGNUP 15] New user saved");

    try {
      console.log("[SIGNUP 16] Sending OTP to new user");
      await sendSignupOtpEmail(user.email, user.name, otp);
      console.log("[SIGNUP 17] OTP email completed");
    } catch (emailError) {
      console.error("[SIGNUP EMAIL FAILED - NEW USER]", {
        code: emailError.code,
        message: emailError.message,
      });

      await User.deleteOne({ _id: user._id });
      console.log("[SIGNUP 18] New user deleted after email failure");

      throw emailError;
    }

    console.log("[SIGNUP 19] Sending signup success response");

    return sendSuccess(
      res,
      200,
      "OTP sent successfully. Please verify your email.",
      {
        email: user.email,
        otpSent: true,
      },
    );
  } catch (error) {
    console.error("[SIGNUP FATAL ERROR]", {
      name: error.name,
      code: error.code,
      message: error.message,
    });

    next(error);
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError("Please provide email and password", 400));
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return next(createError("Invalid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(createError("Invalid credentials", 401));
    }

  if (!user.isEmailVerified) {
    const otp = user.getEmailVerificationToken();

    await user.save({ validateBeforeSave: false });

    try {
      await sendSignupOtpEmail(user.email, user.name, otp);
    } catch (emailError) {
      return next(createError("Unable to send OTP. Please try again.", 500));
    }

    return next(
      createError("Please verify your email. A new OTP has been sent.", 403),
    );
  }

    if (!user.isActive) {
      return next(
        createError("Your account has been deactivated. Contact support.", 403),
      );
    }

    user.lastSeen = Date.now();

    await user.save({ validateBeforeSave: false });

    return sendTokenResponse(user, 200, res, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify signup email using 4-digit OTP and log in the user
// @access  Public

export const verifySignupOtp = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp ?? "").trim();

    if (!email || !/^\d{4}$/.test(otp)) {
      return next(createError("Email and valid 4-digit OTP are required", 400));
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      isEmailVerified: false,
      emailVerificationToken: otpHash,
      emailVerificationExpire: { $gt: new Date() },
    });

    if (!user) {
      return next(createError("Invalid or expired OTP", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();
    sendWelcomeEmail(user.email,user.name)

    return sendTokenResponse(user, 200, res, "Email verified successfully");
  } catch (error) {
    next(error);
  }
};


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    sendSuccess(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar");

    sendSuccess(res, 200, "User fetched", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether the email exists
      return sendSuccess(
        res,
        200,
        "If that email is registered, a reset link has been sent.",
      );
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      sendSuccess(res, 200, "Password reset email sent");
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(createError("Email sending failed. Please try again.", 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return next(createError("Password is required", 400));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(createError("Invalid or expired reset token", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res, "Password reset successful");
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError("Please provide current and new password", 400));
    }

    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return next(createError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "bio", "college", "department", "year"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar from Cloudinary
      if (req.user.avatar?.public_id) {
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

    sendSuccess(res, 200, "Profile updated successfully", { user });
  } catch (error) {
    next(error);
  }
};
