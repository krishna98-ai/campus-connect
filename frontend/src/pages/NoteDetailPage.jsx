import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Heart, Trash2, ExternalLink, FileText, Tag } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import { useSelector } from 'react-redux';
import { categoryColors, formatRelative, formatFullDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data.note);
        setLikeCount(res.data.note.likes?.length || 0);
        setLiked(res.data.note.likes?.includes(user?._id));
      } catch {
        toast.error('Note not found');
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
    try { await api.put(`/notes/${id}/like`); }
    catch { setLiked(prev); setLikeCount((c) => (liked ? c + 1 : c - 1)); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.put(`/notes/${id}/download`);
      window.open(res.data.fileUrl, '_blank');
      setNote((n) => ({ ...n, downloads: n.downloads + 1 }));
    } catch {
      toast.error('Download failed');
    }
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted');
      navigate('/notes');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="max-w-2xl space-y-4 animate-pulse">
      <div className="skeleton h-9 w-24 rounded-lg" />
      <div className="card p-6 space-y-4">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
  if (!note) return null;

  const isOwner = note.uploader?._id === user?._id || note.uploader === user?._id;

  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => navigate(-1)} className="btn-ghost gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Notes
      </button>

      <div className="card overflow-hidden">
        {/* Preview area */}
        <div className="bg-slate-100 dark:bg-slate-700 p-8 flex items-center justify-center min-h-48">
          {note.file?.fileType === 'image' ? (
            <img src={note.file.url} alt={note.title} className="max-h-96 rounded-xl object-contain" />
          ) : (
            <div className="text-center space-y-3">
              <FileText className="w-20 h-20 text-primary-400 mx-auto" />
              <p className="font-medium text-slate-700 dark:text-slate-300">{note.file?.fileName || 'Document'}</p>
              <p className="text-sm text-slate-500">PDF Document</p>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Category */}
          <span className={`badge ${categoryColors[note.category] || categoryColors.Other}`}>{note.category}</span>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{note.title}</h1>
            <p className="text-slate-500 text-sm">{note.subject} · Semester {note.semester}</p>
          </div>

          {note.description && <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{note.description}</p>}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {note.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">{t}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-700">
            {[
              { label: 'Downloads', value: note.downloads },
              { label: 'Likes', value: likeCount },
              { label: 'Uploaded', value: formatRelative(note.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Uploader */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${note.uploader?.username}`}>
              <Avatar user={note.uploader} size="sm" />
            </Link>
            <div>
              <Link to={`/profile/${note.uploader?.username}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600">
                {note.uploader?.name}
              </Link>
              <p className="text-xs text-slate-500">Uploaded {formatFullDate(note.createdAt)}</p>
            </div>
            {isOwner && (
              <button onClick={handleDelete} className="ml-auto flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleDownload} disabled={downloading} className="btn-primary flex-1">
              {downloading ? 'Opening...' : <><Download className="w-4 h-4" /> Download</>}
            </button>
            <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all ${liked ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-800' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-red-300 hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <a href={note.file?.url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-4">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
