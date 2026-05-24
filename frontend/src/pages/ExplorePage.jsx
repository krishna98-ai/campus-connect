import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, FileText, LayoutGrid, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/common/Avatar';
import { PostSkeleton, UserCardSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';
import { noteCategories, categoryColors } from '../utils/helpers';

const TABS = [
  { id: 'posts', label: 'Posts', icon: LayoutGrid },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'users', label: 'People', icon: Users },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState('posts');
  const [results, setResults] = useState({ posts: [], notes: [], users: [] });
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 450);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      try {
        const params = debouncedQuery ? { search: debouncedQuery, limit: 15 } : { limit: 15 };
        const [postsRes, notesRes, usersRes] = await Promise.all([
          api.get('/posts', { params }),
          api.get('/notes', { params }),
          debouncedQuery ? api.get('/users/search', { params: { q: debouncedQuery } }) : Promise.resolve({ data: { users: [] } }),
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
    if (debouncedQuery) setSearchParams({ q: debouncedQuery }, { replace: true });
  }, [debouncedQuery]);

  const tabCount = {
    posts: results.posts.length,
    notes: results.notes.length,
    users: results.users.length,
  };

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, notes, people..."
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 dark:bg-slate-700 border border-transparent focus:border-primary-400 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            autoFocus
          />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
              {tabCount[id]}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      {tab === 'posts' && (
        <div className="space-y-4">
          {loading && [1, 2].map((i) => <PostSkeleton key={i} />)}
          {!loading && results.posts.map((p) => <PostCard key={p._id} post={p} />)}
          {!loading && results.posts.length === 0 && (
            <EmptyState icon={LayoutGrid} title="No posts found" description={query ? `No results for "${query}"` : 'Start typing to search posts'} />
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {loading && [1, 2, 3, 4].map((i) => <div key={i} className="card p-5 animate-pulse space-y-3"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>)}
          {!loading && results.notes.map((note) => (
            <Link key={note._id} to={`/notes/${note._id}`} className="card p-5 hover:shadow-card-hover transition-shadow group">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${categoryColors[note.category] || categoryColors.Other}`}>
                <FileText className="w-3 h-3" />
                {note.category}
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">{note.title}</h4>
              <p className="text-xs text-slate-500">{note.subject} · Sem {note.semester}</p>
              <div className="flex items-center gap-2 mt-3">
                <Avatar user={note.uploader} size="xs" />
                <span className="text-xs text-slate-500">{note.uploader?.name}</span>
                <span className="ml-auto text-xs text-slate-400">↓ {note.downloads}</span>
              </div>
            </Link>
          ))}
          {!loading && results.notes.length === 0 && (
            <div className="col-span-2">
              <EmptyState icon={FileText} title="No notes found" description={query ? `No notes for "${query}"` : 'Search for study materials'} />
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          {loading && [1, 2, 3].map((i) => <UserCardSkeleton key={i} />)}
          {!loading && results.users.map((u) => (
            <Link key={u._id} to={`/profile/${u.username}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Avatar user={u} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{u.name}</p>
                <p className="text-xs text-slate-500">@{u.username}</p>
                {u.college && <p className="text-xs text-slate-400 mt-0.5 truncate">{u.college}</p>}
              </div>
              <span className="btn-secondary text-xs px-3 py-1.5">View</span>
            </Link>
          ))}
          {!loading && results.users.length === 0 && (
            <EmptyState icon={Users} title="No users found" description={query ? `No results for "${query}"` : 'Search for classmates'} />
          )}
        </div>
      )}
    </div>
  );
}
