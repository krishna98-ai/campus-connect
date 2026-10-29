
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Heart,
  Trash2,
  ExternalLink,
  FileText,
  Tag,
  BookOpen,
} from 'lucide-react';
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

    try {
      await api.put(`/notes/${id}/like`);
    } catch {
      setLiked(prev);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const res = await api.put(`/notes/${id}/download`);

      window.open(res.data.fileUrl, '_blank');

      setNote((n) => ({
        ...n,
        downloads: n.downloads + 1,
      }));
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-pulse">
        <div className="skeleton h-8 w-28 rounded-lg" />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="skeleton h-72 sm:h-80 rounded-none" />

          <div className="p-5 sm:p-7 space-y-4">
            <div className="skeleton h-5 w-20 rounded" />
            <div className="skeleton h-7 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-16 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const isOwner =
    note.uploader?._id === user?._id ||
    note.uploader === user?._id;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </button>

      <article className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* File preview */}
        <div className="min-h-64 sm:min-h-80 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center p-6 sm:p-8">
          {note.file?.fileType === 'image' ? (
            <img
              src={note.file.url}
              alt={note.title}
              className="max-h-[28rem] max-w-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>

              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-all">
                {note.file?.fileName || 'Document'}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                PDF Document
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7">
          {/* Category + title */}
          <div className="space-y-3">
            <span
              className={`badge ${
                categoryColors[note.category] || categoryColors.Other
              }`}
            >
              {note.category}
            </span>

            <div>
              <h1 className="text-2xl sm:text-[1.7rem] leading-tight font-semibold tracking-tight text-slate-900 dark:text-white">
                {note.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{note.subject}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Semester {note.semester}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {note.description && (
            <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {note.description}
            </p>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-0.5" />

              {note.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 border-y border-slate-200 dark:border-slate-700">
            {[
              {
                label: 'Downloads',
                value: note.downloads,
              },
              {
                label: 'Likes',
                value: likeCount,
              },
              {
                label: 'Uploaded',
                value: formatRelative(note.createdAt),
              },
            ].map(({ label, value }, index) => (
              <div
                key={label}
                className={`py-4 text-center ${
                  index !== 0
                    ? 'border-l border-slate-200 dark:border-slate-700'
                    : ''
                }`}
              >
                <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                  {value}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Uploader */}
          <div className="mt-6 flex items-center gap-3">
            <Link to={`/profile/${note.uploader?.username}`}>
              <Avatar user={note.uploader} size="sm" />
            </Link>

            <div className="min-w-0">
              <Link
                to={`/profile/${note.uploader?.username}`}
                className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {note.uploader?.name}
              </Link>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Uploaded {formatFullDate(note.createdAt)}
              </p>
            </div>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary flex-1 justify-center"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Opening...' : 'Download'}
            </button>

            <button
              onClick={handleLike}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-200 hover:text-red-500 dark:hover:border-red-800'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  liked ? 'fill-current' : ''
                }`}
              />
              {likeCount}
            </button>

            <a
              href={note.file?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Open file"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="sm:hidden">Open</span>
            </a>
          </div>
        </div>
      </article>

      {/* Small contextual footer */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Shared with the Campus Connect community</span>
      </div>
    </div>
  );
}
