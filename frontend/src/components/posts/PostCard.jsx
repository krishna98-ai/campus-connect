import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Edit, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toggleLike, deletePost } from '../../store/postsSlice';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function PostCard({ post, onUpdate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || post.likeCount || 0);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id) || post._liked || false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const isOwner = post.author?._id === user?._id || post.author === user?._id;

  const handleLike = async () => {
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await dispatch(toggleLike({ postId: post._id, userId: user._id }));
    } catch {
      setLiked(prev);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/posts/${post._id}/save`);
      setSaved((s) => !s);
      toast.success(saved ? 'Post unsaved' : 'Post saved');
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await dispatch(deletePost(post._id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
    setMenuOpen(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text: commentText });
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText('');
    } catch {
      toast.error('Failed to add comment');
    }
    setCommentLoading(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    toast.success('Link copied!');
  };

  return (
    <article className="card p-5 space-y-4 hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
          <Avatar user={post.author} size="sm" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
              {post.author?.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>@{post.author?.username}</span>
              {post.author?.college && <><span>·</span><span className="truncate max-w-[120px]">{post.author.college}</span></>}
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="btn-ghost p-1.5 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated py-1 z-10 animate-fade-in">
              {isOwner && (
                <>
                  <button
                    onClick={() => { navigate(`/posts/${post._id}?edit=1`); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4" /> Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}
              {!isOwner && (
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <Flag className="w-4 h-4" /> Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category badge */}
      {post.category && post.category !== 'General' && (
        <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
          {post.category}
        </span>
      )}

      {/* Content */}
      <Link to={`/posts/${post._id}`}>
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </Link>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt=""
              className="w-full rounded-xl object-cover max-h-80 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(img.url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-primary-600 dark:text-primary-400 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            liked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setCommenting((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleSave}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            saved ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comment section */}
      {commenting && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          {/* Existing comments */}
          {comments.slice(-3).map((c) => (
            <div key={c._id} className="flex gap-2.5">
              <Avatar user={c.user} size="xs" />
              <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mr-2">
                  {c.user?.name}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{c.text}</span>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex gap-2">
            <Avatar user={user} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="input-field text-xs py-2"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="btn-primary px-3 py-2 text-xs"
              >
                {commentLoading ? '...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
