import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

import { toggleLike, deletePost } from "../../store/postsSlice";
import Avatar from "../common/Avatar";
import api from "../../api/axiosInstance";

export default function PostCard({ post, onUpdate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [liked, setLiked] = useState(
    post.likes?.includes(user?._id) || post._liked || false,
  );

  const [likeCount, setLikeCount] = useState(
    post.likes?.length || post.likeCount || 0,
  );

  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [comments, setComments] = useState(post.comments || []);

  const isOwner = post.author?._id === user?._id || post.author === user?._id;

  // Like post
  const handleLike = async () => {
    const previousLiked = liked;

    // Update UI immediately
    setLiked(!liked);
    setLikeCount((count) => (liked ? count - 1 : count + 1));

    try {
      await dispatch(
        toggleLike({
          postId: post._id,
          userId: user._id,
        }),
      );
    } catch (error) {
      // If API fails, restore old state
      setLiked(previousLiked);

      setLikeCount((count) => (previousLiked ? count + 1 : count - 1));
    }
  };

  // Save / unsave post
  const handleSave = async () => {
    try {
      await api.put(`/posts/${post._id}/save`);

      setSaved(!saved);

      toast.success(saved ? "Post unsaved" : "Post saved");
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  // Delete post
  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this post?");

    if (!confirmed) return;

    try {
      await dispatch(deletePost(post._id));

      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }

    setMenuOpen(false);
  };

  // Add comment
  const handleComment = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    setCommentLoading(true);

    try {
      const response = await api.post(`/posts/${post._id}/comments`, {
        text: commentText,
      });

      setComments((previousComments) => [
        ...previousComments,
        response.data.comment,
      ]);

      setCommentText("");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Copy post URL
  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;

    navigator.clipboard.writeText(postUrl);

    toast.success("Link copied!");
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          {/* Author */}
          <Link
            to={`/profile/${post.author?.username}`}
            className="flex min-w-0 items-center gap-3"
          >
            <Avatar user={post.author} size="sm" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {post.author?.name}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <span className="truncate">@{post.author?.username}</span>

                {post.author?.college && (
                  <>
                    <span>·</span>

                    <span className="max-w-[140px] truncate">
                      {post.author.college}
                    </span>
                  </>
                )}

                <span>·</span>

                <span className="shrink-0">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </Link>

          {/* More button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/posts/${post._id}?edit=1`);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Post
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      {post.category && post.category !== "General" && (
        <div className="px-4 pt-3 sm:px-5">
          <span className="inline-flex rounded-md bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
            {post.category}
          </span>
        </div>
      )}

      {/* Content */}
      <Link to={`/posts/${post._id}`} className="block px-4 pt-3 sm:px-5">
        <p className="break-words whitespace-pre-wrap text-[15px] leading-6 text-slate-700 dark:text-slate-200">
          {post.content}
        </p>
      </Link>

      {/* Images */}
      {post.images?.length > 0 && (
        <div
          className={`mt-4 grid gap-1.5 ${
            post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt=""
              className="max-h-[420px] w-full cursor-pointer object-cover"
              onClick={() => window.open(image.url, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 pt-3 sm:px-5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="cursor-pointer text-xs text-primary-600 hover:underline dark:text-primary-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mx-4 mt-4 flex items-center border-t border-slate-100 dark:border-slate-700 sm:mx-5">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-3 text-xs font-medium sm:text-sm ${
            liked
              ? "text-red-500"
              : "text-slate-500 hover:text-red-500 dark:text-slate-400"
          }`}
        >
          <Heart
            className={`h-[17px] w-[17px] ${liked ? "fill-current" : ""}`}
          />

          <span>{likeCount}</span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={() => setCommenting(!commenting)}
          className="flex items-center gap-1.5 px-2.5 py-3 text-xs font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 sm:text-sm"
        >
          <MessageCircle className="h-[17px] w-[17px]" />
          <span>{comments.length}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center px-2.5 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <Share2 className="h-[17px] w-[17px]" />
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className={`ml-auto flex items-center justify-center px-2.5 py-3 ${
            saved
              ? "text-primary-600 dark:text-primary-400"
              : "text-slate-500 hover:text-primary-600 dark:text-slate-400"
          }`}
        >
          <Bookmark
            className={`h-[17px] w-[17px] ${saved ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* Comments */}
      {commenting && (
        <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-700 sm:px-5">
          {/* Last 3 comments */}
          {comments.slice(-3).map((comment) => (
            <div key={comment._id} className="flex gap-2.5">
              <Avatar user={comment.user} size="xs" />

              <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-900/50">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {comment.user?.name}
                  </span>

                  <span className="break-words text-xs text-slate-600 dark:text-slate-400">
                    {comment.text}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Comment form */}
          <form onSubmit={handleComment} className="flex items-center gap-2.5">
            <Avatar user={user} size="xs" />

            <div className="flex min-w-0 flex-1 gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />

              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="h-9 shrink-0 rounded-lg bg-primary-600 px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {commentLoading ? "..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
