
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axiosInstance";
import Avatar from "./Avatar";

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suggestionsResponse, trendingResponse] = await Promise.all([
          api.get("/users/suggestions"),
          api.get("/posts/trending"),
        ]);

        setSuggestions(suggestionsResponse.data.users || []);
        setTrending(
          trendingResponse.data.posts?.slice(0, 5) || []
        );
      } catch (error) {
        console.log("Failed to load right panel data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/${userId}/follow`);

      setFollowing((previous) => ({
        ...previous,
        [userId]: !previous[userId],
      }));
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggestions */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Suggested for you
          </h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="skeleton h-9 w-9 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-2 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.slice(0, 5).map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-2"
              >
                <Link to={`/profile/${user.username}`}>
                  <Avatar user={user} size="sm" />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${user.username}`}
                    className="block truncate text-sm font-semibold text-slate-900 hover:text-primary-600 dark:text-white"
                  >
                    {user.name}
                  </Link>

                  <p className="truncate text-xs text-slate-500">
                    {user.college || `@${user.username}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleFollow(user._id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    following[user._id]
                      ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      : "bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"
                  }`}
                >
                  {following[user._id] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-slate-500">
            No suggestions yet
          </p>
        )}
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Trending Posts
            </h3>
          </div>

          <div className="space-y-3">
            {trending.map((post, index) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="flex gap-3"
              >
                <span className="text-lg font-bold text-slate-300">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
                    {post.content}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    by @{post.author?.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Campus Connect
      </p>
    </div>
  );
}