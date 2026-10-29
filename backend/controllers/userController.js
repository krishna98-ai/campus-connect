import User from "../models/User.js";
import Post from "../models/Post.js";
import Note from "../models/Note.js";

import {
  sendSuccess,
  createError,
  sendPaginated,
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/apiResponse.js";

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar");

    if (!user) return next(createError("User not found", 404));

    // Get user's posts count and notes count
    const [postsCount, notesCount] = await Promise.all([
      Post.countDocuments({ author: user._id }),
      Note.countDocuments({ uploader: user._id }),
    ]);

    sendSuccess(res, 200, "User profile fetched", {
      user,
      stats: { postsCount, notesCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts
// @route   GET /api/users/:username/posts
// @access  Public
const getUserPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const user = await User.findOne({ username: req.params.username });
    if (!user) return next(createError("User not found", 404));

    const [posts, total] = await Promise.all([
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name username avatar"),
      Post.countDocuments({ author: user._id }),
    ]);

    sendPaginated(
      res,
      200,
      "User posts fetched",
      posts,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return next(createError("You cannot follow yourself", 400));
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(createError("User not found", 404));

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id,
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user.id,
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.id);
    }

    await Promise.all([
      currentUser.save({ validateBeforeSave: false }),
      targetUser.save({ validateBeforeSave: false }),
    ]);

    sendSuccess(res, 200, isFollowing ? "Unfollowed" : "Followed", {
      following: !isFollowing,
      followerCount: targetUser.followers.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public

const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
            { college: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("name username avatar bio college department")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    sendSuccess(res, 200, "Users found", { users });
  } catch (error) {
    next(error);
  }
};


// @desc    Get saved posts
// @route   GET /api/users/saved-posts
// @access  Private
const getSavedPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const user = await User.findById(req.user.id);
    const total = user.savedPosts.length;

    const savedPosts = await Post.find({ _id: { $in: user.savedPosts } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar");

    sendPaginated(
      res,
      200,
      "Saved posts fetched",
      savedPosts,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users (not following yet)
// @route   GET /api/users/suggestions
// @access  Private
const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const excluded = [...currentUser.following, req.user.id];

    const users = await User.find({ _id: { $nin: excluded }, isActive: true })
      .select("name username avatar bio college")
      .limit(10)
      .lean();

    sendSuccess(res, 200, "Suggested users", { users });
  } catch (error) {
    next(error);
  }
};

export {
  getUserProfile,
  getUserPosts,
  toggleFollow,
  searchUsers,
  getSavedPosts,
  getSuggestedUsers,
};