import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import api from '../api/axiosInstance';
import PostCard from '../components/posts/PostCard';
import EmptyState from '../components/common/EmptyState';
import { PostSkeleton } from '../components/common/Skeletons';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/users/saved-posts');
        setPosts(res.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Posts</h1>
        <p className="text-slate-500 text-sm mt-0.5">Posts you've bookmarked for later</p>
      </div>

      {loading && Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}

      {!loading && posts.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No saved posts yet"
          description="Tap the bookmark icon on any post to save it here."
        />
      )}

      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
