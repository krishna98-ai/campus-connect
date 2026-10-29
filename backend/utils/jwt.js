import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    maxAge: (Number(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000,
  };

  const userObj = user.toObject ? user.toObject() : { ...user };

  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;
  delete userObj.emailVerificationToken;
  delete userObj.emailVerificationExpire;

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });
};

export { generateToken, sendTokenResponse, clearTokenCookie };
