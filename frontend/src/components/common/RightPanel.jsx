import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Avatar from './Avatar';
import { TrendingUp, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="skeleton w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-2.5 w-16 rounded" />
      </div>
    </div>
  );
}

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sugRes, trendRes] = await Promise.all([
          api.get('/users/suggestions'),
          api.get('/posts/trending'),
        ]);
        setSuggestions(sugRes.data.users || []);
        setTrending(trendRes.data.posts?.slice(0, 5) || []);
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/${userId}/follow`);
      setFollowing((prev) => ({ ...prev, [userId]: !prev[userId] }));
    } catch {
      toast.error('Failed to follow user');
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggested Users */}
      <div className="card p-4">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary-500" />
          Suggested for you
        </h3>
        <div className="space-y-1">
          {loading
            ? [1, 2, 3].map((i) => <UserSkeleton key={i} />)
            : suggestions.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-2">
                  <Link to={`/profile/${u.username}`}>
                    <Avatar user={u} size="sm" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${u.username}`}
                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 truncate block"
                    >
                      {u.name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">{u.college || `@${u.username}`}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(u._id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      following[u._id]
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100'
                    }`}
                  >
                    {following[u._id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
          {!loading && suggestions.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-2">No suggestions yet</p>
          )}
        </div>
      </div>

      {/* Trending Posts */}
      {trending.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            Trending Posts
          </h3>
          <div className="space-y-3">
            {trending.map((post, i) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="flex gap-3 group"
              >
                <span className="text-lg font-bold text-slate-200 dark:text-slate-700 group-hover:text-primary-300 transition-colors leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.content}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">by @{post.author?.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">© {new Date().getFullYear()} Campus Connect</p>
    </div>
  );
}
