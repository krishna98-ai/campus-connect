import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusSquare, TrendingUp, Clock, Flame } from "lucide-react";
import { fetchPosts, resetPosts } from "../store/postsSlice";
import PostCard from "../components/posts/PostCard";
import CreatePostModal from "../components/posts/CreatePostModal";
import { PostSkeleton } from "../components/common/Skeletons";
import EmptyState from "../components/common/EmptyState";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import { postCategories } from "../utils/helpers";

const SORT_OPTIONS = [
  { value: "recent", label: "Recent", icon: Clock },
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "popular", label: "Popular", icon: Flame },
];

export default function FeedPage() {
  const dispatch = useDispatch();
  const { posts, loading, hasMore, page } = useSelector((s) => s.posts);
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort] = useState("recent");
  const [category, setCategory] = useState("All");
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver();

  const loadPosts = useCallback(
    (p = 1) => {
      dispatch(
        fetchPosts({
          page: p,
          limit: 10,
          sort,
          category: category !== "All" ? category : undefined,
        }),
      );
    },
    [dispatch, sort, category],
  );

  useEffect(() => {
    dispatch(resetPosts());
    loadPosts(1);
  }, [sort, category]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && page > 0) {
      loadPosts(page + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Page heading */}
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Campus Feed
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          See what’s happening around your campus.
        </p>
      </div>

      {/* Create post */}
      <button
        onClick={() => setShowCreate(true)}
        className="group w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 sm:p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-600"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="w-full rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">
              Share something with your campus...
            </div>
          </div>

          <div className="shrink-0 inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </div>
        </div>
      </button>

      {/* Feed controls */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Sort */}
        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = sort === value;

            return (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  active
                    ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-3 scrollbar-hide">
          {["All", ...postCategories].map((cat) => {
            const active = category === cat;

            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  active
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

        {loading && [1, 2, 3].map((i) => <PostSkeleton key={i} />)}

        {!loading && posts.length === 0 && (
          <EmptyState
            icon={PlusSquare}
            title="No posts yet"
            description="Be the first to share something with your campus community!"
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
              >
                <PlusSquare className="w-4 h-4" />
                Create First Post
              </button>
            }
          />
        )}

        {hasMore && <div ref={loadMoreRef} className="h-4" />}

        {!hasMore && posts.length > 0 && (
          <div className="flex items-center justify-center gap-3 py-6">
            <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              You've seen all posts
            </p>
            <div className="h-px w-12 bg-slate-200 dark:bg-slate-700" />
          </div>
        )}
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
