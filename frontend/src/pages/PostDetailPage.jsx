import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, Loader2, Heart, Trash2, CornerDownRight } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import { PostSkeleton } from '../components/common/Skeletons';
import { formatRelative } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data.post);
        setLikeCount(res.data.post.likes?.length || 0);
        setLiked(res.data.post.likes?.includes(user?._id));
      } catch {
        toast.error('Post not found');
        navigate(-1);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleLike = async () => {
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      await api.put(`/posts/${id}/like`);
    } catch {
      setLiked(prev);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { text: commentText });
      setPost((p) => ({ ...p, comments: [...p.comments, res.data.comment] }));
      setCommentText('');
    } catch {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${id}/comments/${commentId}/replies`, { text: replyText });
      setPost((p) => ({
        ...p,
        comments: p.comments.map((c) => (c._id === commentId ? res.data.comment : c)),
      }));
      setReplyText('');
      setReplyTo(null);
    } catch {
      toast.error('Failed to post reply');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost((p) => ({ ...p, comments: p.comments.filter((c) => c._id !== commentId) }));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) return <div className="space-y-4"><PostSkeleton /></div>;
  if (!post) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Post */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <Avatar user={post.author} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${post.author?.username}`} className="font-bold text-slate-900 dark:text-white hover:text-primary-600">{post.author?.name}</Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>@{post.author?.username}</span>
              <span>·</span>
              <span>{formatRelative(post.createdAt)}</span>
              {post.isEdited && <><span>·</span><span className="italic">edited</span></>}
            </div>
          </div>
        </div>

        {post.category !== 'General' && (
          <span className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">{post.category}</span>
        )}

        <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.images?.length > 0 && (
          <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : ''}`}>
            {post.images.map((img, i) => (
              <img key={i} src={img.url} alt="" className="rounded-xl object-cover w-full max-h-96 cursor-pointer" onClick={() => window.open(img.url, '_blank')} />
            ))}
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => <span key={t} className="text-xs font-medium text-primary-600 dark:text-primary-400">#{t}</span>)}
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </button>
          <span className="text-sm text-slate-400">{post.comments?.length} comments</span>
          <span className="text-sm text-slate-400 ml-auto">{post.views} views</span>
        </div>
      </div>

      {/* Comment input */}
      <div className="card p-4">
        <form onSubmit={handleComment} className="flex gap-3 items-start">
          <Avatar user={user} size="sm" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary px-3">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {post.comments?.map((comment) => (
          <div key={comment._id} className="card p-4 space-y-3">
            <div className="flex gap-3">
              <Link to={`/profile/${comment.user?.username}`}>
                <Avatar user={comment.user} size="xs" />
              </Link>
              <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{comment.user?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                    {(comment.user?._id === user?._id || post.author?._id === user?._id) && (
                      <button onClick={() => handleDeleteComment(comment._id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
              </div>
            </div>

            {/* Replies */}
            {comment.replies?.map((reply) => (
              <div key={reply._id} className="flex gap-3 ml-8">
                <CornerDownRight className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
                <Avatar user={reply.user} size="xs" />
                <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{reply.user?.name}</span>
                    <span className="text-xs text-slate-400">{formatRelative(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{reply.text}</p>
                </div>
              </div>
            ))}

            {/* Reply toggle */}
            <button onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)} className="ml-8 text-xs text-primary-600 hover:underline font-medium">
              Reply
            </button>

            {replyTo === comment._id && (
              <div className="ml-8 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="input-field flex-1 text-xs py-2"
                  autoFocus
                />
                <button onClick={() => handleReply(comment._id)} disabled={submitting || !replyText.trim()} className="btn-primary px-3 py-2 text-xs">
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
                <button onClick={() => setReplyTo(null)} className="btn-secondary px-2 py-2 text-xs">✕</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
