import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusSquare, TrendingUp, Clock, Flame } from 'lucide-react';
import { fetchPosts, resetPosts } from '../store/postsSlice';
import PostCard from '../components/posts/PostCard';
import CreatePostModal from '../components/posts/CreatePostModal';
import { PostSkeleton } from '../components/common/Skeletons';
import EmptyState from '../components/common/EmptyState';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { postCategories } from '../utils/helpers';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent', icon: Clock },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'popular', label: 'Popular', icon: Flame },
];

export default function FeedPage() {
  const dispatch = useDispatch();
  const { posts, loading, hasMore, page } = useSelector((s) => s.posts);
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort] = useState('recent');
  const [category, setCategory] = useState('All');
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver();

  const loadPosts = useCallback((p = 1) => {
    dispatch(fetchPosts({ page: p, limit: 10, sort, category: category !== 'All' ? category : undefined }));
  }, [dispatch, sort, category]);

  // Reset and reload when filters change
  useEffect(() => {
    dispatch(resetPosts());
    loadPosts(1);
  }, [sort, category]);

  // Infinite scroll
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && page > 0) {
      loadPosts(page + 1);
    }
  }, [isIntersecting, hasMore, loading]);

  return (
    <div className="space-y-4">
      {/* Create post prompt */}
      <button
        onClick={() => setShowCreate(true)}
        className="card w-full p-4 flex items-center gap-3 text-left hover:shadow-card-hover transition-shadow cursor-pointer"
      >
        <div className="flex-1 text-sm text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-2.5">
          What's on your mind?
        </div>
        <div className="btn-primary">
          <PlusSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Post</span>
        </div>
      </button>

      {/* Filters */}
      <div className="card p-3 space-y-3">
        {/* Sort */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sort === value
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['All', ...postCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}

        {loading && [1, 2, 3].map((i) => <PostSkeleton key={i} />)}

        {!loading && posts.length === 0 && (
          <EmptyState
            icon={PlusSquare}
            title="No posts yet"
            description="Be the first to share something with your campus community!"
            action={
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                Create First Post
              </button>
            }
          />
        )}

        {/* Infinite scroll trigger */}
        {hasMore && <div ref={loadMoreRef} className="h-4" />}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-slate-400 py-4">You've seen all posts!</p>
        )}
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
