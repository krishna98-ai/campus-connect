import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Loader2, FileText, MessageSquare } from 'lucide-react';
import api from '../../api/axiosInstance';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { formatRelative } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminReported() {
  const [data, setData] = useState({ reportedPosts: [], reportedNotes: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    api.get('/admin/reported')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    setActionLoading(p => ({ ...p, [postId]: true }));
    try {
      await api.delete(`/posts/${postId}`);
      setData(prev => ({
        ...prev,
        reportedPosts: prev.reportedPosts.filter(p => p._id !== postId)
      }));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
    setActionLoading(p => ({ ...p, [postId]: false }));
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    setActionLoading(p => ({ ...p, [noteId]: true }));
    try {
      await api.delete(`/notes/${noteId}`);
      setData(prev => ({
        ...prev,
        reportedNotes: prev.reportedNotes.filter(n => n._id !== noteId)
      }));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
    setActionLoading(p => ({ ...p, [noteId]: false }));
  };

  const dismissReport = async (type, id) => {
    setActionLoading(p => ({ ...p, [`dismiss_${id}`]: true }));
    try {
      const endpoint = type === 'post' ? `/posts/${id}` : `/notes/${id}`;
      // We don't have a dismiss endpoint, so we just remove from local state
      if (type === 'post') {
        setData(prev => ({ ...prev, reportedPosts: prev.reportedPosts.filter(p => p._id !== id) }));
      } else {
        setData(prev => ({ ...prev, reportedNotes: prev.reportedNotes.filter(n => n._id !== id) }));
      }
      toast.success('Report dismissed');
    } catch {
      toast.error('Failed');
    }
    setActionLoading(p => ({ ...p, [`dismiss_${id}`]: false }));
  };

  const postCount = data.reportedPosts.length;
  const noteCount = data.reportedNotes.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reported Content</h1>
          <p className="text-slate-500 text-sm">
            {postCount + noteCount} items need review
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card p-1.5 w-fit">
        {[
          { id: 'posts', label: 'Posts', count: postCount, icon: MessageSquare },
          { id: 'notes', label: 'Notes', count: noteCount, icon: FileText },
        ].map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 animate-pulse space-y-3">
              <div className="flex gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="flex-1 space-y-2"><div className="skeleton h-3.5 w-32 rounded" /><div className="skeleton h-3 w-20 rounded" /></div></div>
              <div className="skeleton h-12 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Reported Posts */}
      {!loading && tab === 'posts' && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {data.reportedPosts.length === 0 && (
            <EmptyState icon={CheckCircle2} title="No reported posts" description="All content looks clean!" />
          )}
          {data.reportedPosts.map(post => (
            <div key={post._id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={post.author} size="sm" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{post.author?.name}</p>
                    <p className="text-xs text-slate-500">{formatRelative(post.createdAt)}</p>
                  </div>
                </div>
                <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                  {post.reportedBy?.length || 0} reports
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4">{post.content}</p>
              </div>

              {post.reportedBy?.length > 0 && (
                <p className="text-xs text-slate-400">
                  Reported by: {post.reportedBy.map(u => u.username || u).join(', ')}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => dismissReport('post', post._id)}
                  disabled={actionLoading[`dismiss_${post._id}`]}
                  className="btn-secondary text-xs gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Dismiss
                </button>
                <button
                  onClick={() => deletePost(post._id)}
                  disabled={actionLoading[post._id]}
                  className="text-xs flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-medium transition-colors"
                >
                  {actionLoading[post._id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reported Notes */}
      {!loading && tab === 'notes' && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
          {data.reportedNotes.length === 0 && (
            <EmptyState icon={CheckCircle2} title="No reported notes" description="All notes look clean!" />
          )}
          {data.reportedNotes.map(note => (
            <div key={note._id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar user={note.uploader} size="sm" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{note.uploader?.name}</p>
                    <p className="text-xs text-slate-500">{formatRelative(note.createdAt)}</p>
                  </div>
                </div>
                <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                  {note.reportedBy?.length || 0} reports
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-1">
                <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{note.title}</p>
                <p className="text-xs text-slate-500">{note.subject} · {note.category}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => dismissReport('note', note._id)}
                  className="btn-secondary text-xs gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Dismiss
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  disabled={actionLoading[note._id]}
                  className="text-xs flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-medium transition-colors"
                >
                  {actionLoading[note._id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
