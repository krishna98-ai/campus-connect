import User from "../models/User.js";
import Post from "../models/Post.js";
import Note from "../models/Note.js";
import Notification from "../models/Notification.js";

import {
  sendSuccess,
  createError,
  sendPaginated,
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/apiResponse.js";

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalNotes,
      recentUsers,
      topPosts,
      usersByMonth,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Post.countDocuments(),
      Note.countDocuments(),

      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name username avatar college createdAt"),

      Post.aggregate([
        {
          $addFields: {
            likeCount: { $size: "$likes" },
            commentCount: { $size: "$comments" },
          },
        },
        { $sort: { likeCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [{ $project: { name: 1, username: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            content: 1,
            likeCount: 1,
            commentCount: 1,
            author: 1,
            createdAt: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ]);

    const notesByCategory = await Note.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          downloads: { $sum: "$downloads" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    sendSuccess(res, 200, "Dashboard data fetched", {
      stats: { totalUsers, totalPosts, totalNotes },
      recentUsers,
      topPosts,
      usersByMonth,
      notesByCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, role } = req.query;

    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(),

      User.countDocuments(filter),
    ]);

    sendPaginated(
      res,
      200,
      "Users fetched",
      users,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Admin
export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError("User not found", 404));
    }

    if (user.role === "admin") {
      return next(createError("Cannot deactivate admin users", 403));
    }

    user.isActive = !user.isActive;

    await user.save({ validateBeforeSave: false });

    sendSuccess(
      res,
      200,
      `User ${user.isActive ? "activated" : "deactivated"}`,
      { isActive: user.isActive },
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError("User not found", 404));
    }

    if (user.role === "admin") {
      return next(createError("Cannot delete admin users", 403));
    }

    // Clean up user's content and notifications
    await Promise.all([
      Post.deleteMany({ author: req.params.id }),
      Note.deleteMany({ uploader: req.params.id }),
      Notification.deleteMany({
        $or: [{ recipient: req.params.id }, { sender: req.params.id }],
      }),
    ]);

    await user.deleteOne();

    sendSuccess(res, 200, "User and associated data deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported content
// @route   GET /api/admin/reported
// @access  Admin
export const getReportedContent = async (req, res, next) => {
  try {
    const [reportedPosts, reportedNotes] = await Promise.all([
      Post.find({ isReported: true })
        .populate("author", "name username avatar")
        .populate("reportedBy", "name username")
        .sort({ createdAt: -1 })
        .limit(20),

      Note.find({ isReported: true })
        .populate("uploader", "name username avatar")
        .populate("reportedBy", "name username")
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    sendSuccess(res, 200, "Reported content fetched", {
      reportedPosts,
      reportedNotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return next(createError("Invalid role", 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return next(createError("User not found", 404));
    }

    sendSuccess(res, 200, "User role updated", { user });
  } catch (error) {
    next(error);
  }
};
