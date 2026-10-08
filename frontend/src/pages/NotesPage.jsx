import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Search,
  Download,
  Heart,
  Filter,
  Loader2,
  FileText,
} from "lucide-react";
import api from "../api/axiosInstance";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";
import { NoteSkeleton } from "../components/common/Skeletons";
import UploadNoteModal from "../components/notes/UploadNoteModal";
import { noteCategories, categoryColors } from "../utils/helpers";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import useDebounce from "../hooks/useDebounce";

const semesters = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "N/A"];

const sortOptions = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Most Downloaded" },
  { value: "liked", label: "Most Liked" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState("All");
  const [semester, setSemester] = useState("All");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const { ref, isIntersecting } = useIntersectionObserver();

  const fetchNotes = useCallback(
    async (p = 1, reset = false) => {
      setLoading(true);

      try {
        const params = {
          page: p,
          limit: 12,
          sort,
        };

        if (category !== "All") {
          params.category = category;
        }

        if (semester !== "All") {
          params.semester = semester;
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const res = await api.get("/notes", { params });

        const newNotes = res.data.data || [];

        setNotes((prev) => (reset ? newNotes : [...prev, ...newNotes]));

        setHasMore(res.data.pagination?.hasNext || false);
      } catch (_) {}

      setLoading(false);
    },
    [category, semester, sort, debouncedSearch],
  );

  useEffect(() => {
    setPage(1);
    setNotes([]);
    fetchNotes(1, true);
  }, [category, semester, sort, debouncedSearch]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && page > 1) {
      fetchNotes(page + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />

            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Study Notes
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discover and share study material with your campus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" />
          Upload Notes
        </button>
      </div>

      {/* Search + Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title, subject or tags..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:bg-slate-800"
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setShowFilters((p) => !p)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              showFilters
                ? "border-primary-300 bg-primary-50 text-primary-600 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Sort by
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Semester
              </label>

              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Semesters" : `Semester ${s}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 scrollbar-hide dark:border-slate-800">
          {["All", ...noteCategories].map((cat) => {
            const active = category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-transparent bg-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading &&
          page === 1 &&
          [1, 2, 3, 4].map((i) => <NoteSkeleton key={i} />)}

        {notes.map((note) => (
          <NoteCard key={note._id} note={note} />
        ))}

        {!loading && notes.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={BookOpen}
              title="No notes found"
              description="Upload the first note in this category!"
              action={
                <button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="btn-primary"
                >
                  <Upload className="h-4 w-4" />
                  Upload Notes
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && <div ref={ref} className="h-4" />}

      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadNoteModal
          onClose={() => setShowUpload(false)}
          onUploaded={(n) => setNotes((p) => [n, ...p])}
        />
      )}
    </div>
  );
}

function NoteCard({ note }) {
  const [liked, setLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(
    note.likes?.length || note.likeCount || 0,
  );

  const handleLike = async (e) => {
    e.preventDefault();

    const prev = liked;

    setLiked(!liked);

    setLikeCount((c) => (liked ? c - 1 : c + 1));

    try {
      await api.put(`/notes/${note._id}/like`);
    } catch {
      setLiked(prev);

      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  return (
    <Link
      to={`/notes/${note._id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
    >
      {/* File preview */}
      <div
        className={`flex h-32 items-center justify-center border-b border-slate-200 dark:border-slate-700 ${
          categoryColors[note.category] ||
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {note.file?.fileType === "pdf" ? (
          <div className="flex flex-col items-center gap-1.5">
            <FileText className="h-8 w-8" />
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              PDF
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <BookOpen className="h-8 w-8" />
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              Document
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Category */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold ${
              categoryColors[note.category] || categoryColors.Other
            }`}
          >
            {note.category}
          </span>

          <span className="text-[11px] text-slate-400">
            Sem {note.semester}
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
          {note.title}
        </h3>

        {/* Subject */}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {note.subject}
        </p>

        {/* Bottom row */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Avatar user={note.uploader} size="xs" />

          <span className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {note.uploader?.name}
          </span>

          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex shrink-0 items-center gap-1 text-xs transition ${
              liked ? "text-red-500" : "text-slate-400 hover:text-red-500"
            }`}
            aria-label="Like note"
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />

            {likeCount}
          </button>

          {/* Downloads */}
          <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
            <Download className="h-3.5 w-3.5" />
            {note.downloads}
          </span>
        </div>
      </div>
    </Link>
  );
}
