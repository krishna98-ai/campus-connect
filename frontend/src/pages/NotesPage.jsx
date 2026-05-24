import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Upload, Search, Download, Heart, Filter, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { NoteSkeleton } from '../components/common/Skeletons';
import UploadNoteModal from '../components/notes/UploadNoteModal';
import { noteCategories, categoryColors, formatRelative } from '../utils/helpers';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import useDebounce from '../hooks/useDebounce';

const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8', 'N/A'];
const sortOptions = [{ value: 'recent', label: 'Recent' }, { value: 'popular', label: 'Most Downloaded' }, { value: 'liked', label: 'Most Liked' }];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('All');
  const [semester, setSemester] = useState('All');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const { ref, isIntersecting } = useIntersectionObserver();

  const fetchNotes = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12, sort };
      if (category !== 'All') params.category = category;
      if (semester !== 'All') params.semester = semester;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/notes', { params });
      const newNotes = res.data.data || [];
      setNotes((prev) => reset ? newNotes : [...prev, ...newNotes]);
      setHasMore(res.data.pagination?.hasNext || false);
    } catch (_) {}
    setLoading(false);
  }, [category, semester, sort, debouncedSearch]);

  useEffect(() => {
    setPage(1);
    setNotes([]);
    fetchNotes(1, true);
  }, [category, semester, sort, debouncedSearch]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && page > 1) fetchNotes(page + 1);
  }, [isIntersecting, hasMore, loading]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Notes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Share and discover study materials</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Upload className="w-4 h-4" /> Upload Notes
        </button>
      </div>

      {/* Search + Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, subject, tags..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={() => setShowFilters((p) => !p)} className={`btn-secondary gap-2 ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-600' : ''}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="label text-xs">Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field text-sm">
                {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} className="input-field text-sm">
                {semesters.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Semesters' : `Semester ${s}`}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...noteCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === cat ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {loading && page === 1 && [1, 2, 3, 4].map((i) => <NoteSkeleton key={i} />)}
        {notes.map((note) => <NoteCard key={note._id} note={note} />)}
        {!loading && notes.length === 0 && (
          <div className="col-span-2">
            <EmptyState
              icon={BookOpen}
              title="No notes found"
              description="Upload the first note in this category!"
              action={<button onClick={() => setShowUpload(true)} className="btn-primary"><Upload className="w-4 h-4" /> Upload Notes</button>}
            />
          </div>
        )}
      </div>

      {hasMore && <div ref={ref} className="h-4" />}
      {loading && page > 1 && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>}

      {showUpload && <UploadNoteModal onClose={() => setShowUpload(false)} onUploaded={(n) => setNotes((p) => [n, ...p])} />}
    </div>
  );
}

function NoteCard({ note }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(note.likes?.length || note.likeCount || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try { await api.put(`/notes/${note._id}/like`); }
    catch { setLiked(prev); setLikeCount((c) => (liked ? c + 1 : c - 1)); }
  };

  return (
    <Link to={`/notes/${note._id}`} className="card p-5 hover:shadow-card-hover transition-shadow group space-y-3">
      {/* PDF preview icon or image */}
      <div className={`h-28 rounded-xl flex items-center justify-center text-4xl font-bold ${categoryColors[note.category] || 'bg-slate-100 text-slate-600'}`}>
        {note.file?.fileType === 'pdf' ? '📄' : '🖼️'}
      </div>

      <div>
        <span className={`badge text-xs ${categoryColors[note.category] || categoryColors.Other}`}>
          {note.category}
        </span>
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors line-clamp-2">
        {note.title}
      </h3>
      <p className="text-xs text-slate-500">{note.subject} · Sem {note.semester}</p>

      <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-700">
        <Avatar user={note.uploader} size="xs" />
        <span className="text-xs text-slate-500 flex-1 truncate">{note.uploader?.name}</span>
        <button onClick={handleLike} className={`flex items-center gap-1 text-xs ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </button>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Download className="w-3.5 h-3.5" />
          {note.downloads}
        </span>
      </div>
    </Link>
  );
}
