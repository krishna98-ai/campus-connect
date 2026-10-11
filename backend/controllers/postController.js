import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {cloudinary} from "../config/cloudinary.js"

import {
  sendSuccess,
  createError,
  sendPaginated,
  getPaginationParams,
  buildPaginationMeta,
} from "../utils/apiResponse.js";

import { getIO } from "../socket/index.js";

// @desc    Create post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { content, category, tags } = req.body;

    const postData = {
      author: req.user.id,
      content,
      category: category || "General",
      tags: tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((t) => t.trim())
        : [],
    };

    if (req.files && req.files.length > 0) {
      postData.images = req.files.map((f) => ({
        public_id: f.filename,
        url: f.path,
      }));
    }

    const post = await Post.create(postData);
    await post.populate("author", "name username avatar");

    sendSuccess(res, 201, "Post created successfully", { post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts feed (paginated)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { sort = "recent", category, search } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === "trending") {
      sortOption = { views: -1, likes: -1, createdAt: -1 };
    } else if (sort === "popular") {
      sortOption = { "likes.length": -1, createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("author", "name username avatar college")
        .populate("comments.user", "name username avatar")
        .lean(),
      Post.countDocuments(filter),
    ]);

    sendPaginated(
      res,
      200,
      "Posts fetched",
      posts,
      buildPaginationMeta(total, page, limit),
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    )
      .populate("author", "name username avatar college bio")
      .populate("comments.user", "name username avatar")
      .populate("comments.replies.user", "name username avatar");

    if (!post) return next(createError("Post not found", 404));

    sendSuccess(res, 200, "Post fetched", { post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (owner)
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return next(createError("Not authorized to edit this post", 403));
    }

    const { content, category, tags } = req.body;
    const updates = { isEdited: true, editedAt: new Date() };
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags)
      updates.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim());

    post = await Post.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("author", "name username avatar");

    sendSuccess(res, 200, "Post updated", { post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (owner/admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return next(createError("Not authorized to delete this post", 403));
    }

    // Delete images from cloudinary
    if (post.images && post.images.length > 0) {
      
      await Promise.all(
        post.images.map((img) => cloudinary.uploader.destroy(img.public_id)),
      );
    }

    await post.deleteOne();
    sendSuccess(res, 200, "Post deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    const userId = req.user.id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);

      // Send notification to post author (not self)
      if (post.author.toString() !== userId) {
        const notification = await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id,
          message: `${req.user.name} liked your post`,
        });

        const io = getIO();
        if (io) {
          io.to(post.author.toString()).emit("notification", notification);
        }
      }
    }

    await post.save();
    sendSuccess(res, 200, isLiked ? "Post unliked" : "Post liked", {
      liked: !isLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return next(createError("Comment text is required", 400));

    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    const comment = { user: req.user.id, text };
    post.comments.push(comment);
    await post.save();

    await post.populate("comments.user", "name username avatar");

    const newComment = post.comments[post.comments.length - 1];

    // Notification
    if (post.author.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: "comment",
        post: post._id,
        message: `${req.user.name} commented on your post`,
      });

      const io = getIO();
      if (io) {
        io.to(post.author.toString()).emit("notification", notification);
      }
    }

    sendSuccess(res, 201, "Comment added", { comment: newComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return next(createError("Comment not found", 404));

    const isOwner = comment.user.toString() === req.user.id;
    const isPostOwner = post.author.toString() === req.user.id;

    if (!isOwner && !isPostOwner && req.user.role !== "admin") {
      return next(createError("Not authorized", 403));
    }

    comment.deleteOne();
    await post.save();

    sendSuccess(res, 200, "Comment deleted");
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to comment
// @route   POST /api/posts/:id/comments/:commentId/replies
// @access  Private
export const addReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return next(createError("Reply text is required", 400));

    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return next(createError("Comment not found", 404));

    comment.replies.push({ user: req.user.id, text });
    await post.save();
    await post.populate("comments.replies.user", "name username avatar");

    const updatedComment = post.comments.id(req.params.commentId);
    sendSuccess(res, 201, "Reply added", { comment: updatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending posts (aggregation)
// @route   GET /api/posts/trending
// @access  Public
export const getTrendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 3] },
              { $multiply: [{ $size: "$comments" }, 2] },
              "$views",
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
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
    ]);

    sendSuccess(res, 200, "Trending posts fetched", { posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/unsave post
// @route   PUT /api/posts/:id/save
// @access  Private
export const toggleSavePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError("Post not found", 404));

    const user = await User.findById(req.user.id);
    const isSaved = user.savedPosts.includes(req.params.id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== req.params.id,
      );
    } else {
      user.savedPosts.push(req.params.id);
    }

    await user.save({ validateBeforeSave: false });
    sendSuccess(res, 200, isSaved ? "Post unsaved" : "Post saved", {
      saved: !isSaved,
    });
  } catch (error) {
    next(error);
  }
};
