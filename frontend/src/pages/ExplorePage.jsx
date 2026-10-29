import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Users, FileText, LayoutGrid, Loader2 } from "lucide-react";
import api from "../api/axiosInstance";
import PostCard from "../components/posts/PostCard";
import Avatar from "../components/common/Avatar";
import { PostSkeleton, UserCardSkeleton } from "../components/common/Skeletons";
import EmptyState from "../components/common/EmptyState";
import useDebounce from "../hooks/useDebounce";
import { categoryColors } from "../utils/helpers";

const TABS = [
  { id: "posts", label: "Posts", icon: LayoutGrid },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "users", label: "People", icon: Users },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [tab, setTab] = useState("posts");

  const [results, setResults] = useState({
    posts: [],
    notes: [],
    users: [],
  });

  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 450);

  useEffect(() => {
    const search = async () => {
      setLoading(true);

      try {
        const params = debouncedQuery
          ? { search: debouncedQuery, limit: 15 }
          : { limit: 15 };

        const [postsRes, notesRes, usersRes] = await Promise.all([
          api.get("/posts", { params }),
          api.get("/notes", { params }),
          api.get("/users/search", {
            params: debouncedQuery ? { q: debouncedQuery } : {},
          }),
        ]);

        setResults({
          posts: postsRes.data.data || [],
          notes: notesRes.data.data || [],
          users: usersRes.data.users || [],
        });
      } catch (_) {}

      setLoading(false);
    };

    search();

    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    }
  }, [debouncedQuery]);

  const tabCount = {
    posts: results.posts.length,
    notes: results.notes.length,
    users: results.users.length,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Explore
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find posts, study material and people across your campus.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, notes, people..."
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          autoFocus
        />

        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />

              <span>{label}</span>

              <span
                className={`text-xs ${
                  active
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-400"
                }`}
              >
                {tabCount[id]}
              </span>

              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {tab === "posts" && (
        <div className="space-y-4">
          {loading && [1, 2].map((i) => <PostSkeleton key={i} />)}

          {!loading &&
            results.posts.map((p) => <PostCard key={p._id} post={p} />)}

          {!loading && results.posts.length === 0 && (
            <EmptyState
              icon={LayoutGrid}
              title="No posts found"
              description={
                query
                  ? `No results for "${query}"`
                  : "Start typing to search posts"
              }
            />
          )}
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {loading &&
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="space-y-3 animate-pulse">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}

          {!loading &&
            results.notes.map((note) => (
              <Link
                key={note._id}
                to={`/notes/${note._id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
                      categoryColors[note.category] || categoryColors.Other
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    {note.category}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {note.semester ? `Sem ${note.semester}` : ""}
                  </span>
                </div>

                <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {note.title}
                </h4>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {note.subject}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Avatar user={note.uploader} size="xs" />

                  <span className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                    {note.uploader?.name}
                  </span>

                  <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                    ↓ {note.downloads}
                  </span>
                </div>
              </Link>
            ))}

          {!loading && results.notes.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={FileText}
                title="No notes found"
                description={
                  query
                    ? `No notes for "${query}"`
                    : "Search for study materials"
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {loading && [1, 2, 3].map((i) => <UserCardSkeleton key={i} />)}

          {!loading &&
            results.users.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
              >
                <Avatar user={u} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {u.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    @{u.username}
                  </p>

                  {u.college && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {u.college}
                    </p>
                  )}
                </div>

                <span className="shrink-0 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition group-hover:border-primary-300 dark:border-slate-700 dark:text-slate-300">
                  View
                </span>
              </Link>
            ))}

          {!loading && results.users.length === 0 && (
            <div className="px-4 py-8">
              <EmptyState
                icon={Users}
                title="No users found"
                description={
                  query ? `No results for "${query}"` : "Search for classmates"
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
