import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: {
      type: String,
      required: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: [300, "Reply cannot exceed 300 characters"],
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post cannot exceed 2000 characters"],
      trim: true,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30,
      },
    ],
    category: {
      type: String,
      enum: [
        "General",
        "Academic",
        "Events",
        "Jobs",
        "Housing",
        "Lost & Found",
        "Sports",
        "Tech",
        "Other",
      ],
      default: "General",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    views: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    isPinned: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual fields
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Search and sorting indexes
postSchema.index({ content: "text", tags: "text", category: "text" });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
