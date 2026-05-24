import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, BookOpen, TrendingUp, ArrowUpRight, Eye, Heart } from 'lucide-react';
import api from '../../api/axiosInstance';
import Avatar from '../../components/common/Avatar';
import { formatRelative } from '../../utils/helpers';

function StatCard({ icon: Icon, label, value, color, delta }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
      {delta !== undefined && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> {delta} this month
        </p>
      )}
    </div>
  );
}

function BarChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.slice(0, 12).reverse().map((d, i) => {
        const height = Math.max(4, (d.count / max) * 96);
        const label = `${d._id?.year}-${String(d._id?.month).padStart(2,'0')}`;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full bg-primary-400 dark:bg-primary-500 rounded-sm hover:bg-primary-500 transition-colors cursor-default"
              style={{ height: `${height}px` }}
            />
            <span className="absolute -top-6 text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {label}: {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
      </div>
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform analytics and management overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users}    label="Total Students"  value={data?.stats?.totalUsers}  color="bg-blue-500" />
        <StatCard icon={FileText} label="Total Posts"     value={data?.stats?.totalPosts}  color="bg-violet-500" />
        <StatCard icon={BookOpen} label="Notes Uploaded"  value={data?.stats?.totalNotes}  color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User growth chart */}
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">User Growth</h3>
            <span className="text-xs text-slate-500">Last 12 months</span>
          </div>
          {data?.usersByMonth?.length > 0
            ? <BarChart data={data.usersByMonth} />
            : <div className="h-24 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          }
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>12 months ago</span>
            <span>This month</span>
          </div>
        </div>

        {/* Notes by category */}
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Notes by Category</h3>
          <div className="space-y-2 overflow-y-auto max-h-52">
            {data?.notesByCategory?.map(cat => (
              <div key={cat._id} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-32 truncate">{cat._id}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-400 rounded-full"
                    style={{ width: `${Math.min(100, (cat.count / (data?.stats?.totalNotes || 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{cat.count}</span>
              </div>
            ))}
            {!data?.notesByCategory?.length && <p className="text-sm text-slate-400">No data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {data?.recentUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3 py-3">
                <Avatar user={u} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.college || `@${u.username}`}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatRelative(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top posts */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Top Posts</h3>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-3">
            {data?.topPosts?.map((post, i) => (
              <Link key={post._id} to={`/posts/${post._id}`} className="flex gap-3 group">
                <span className="text-xl font-black text-slate-200 dark:text-slate-700 group-hover:text-primary-300 transition-colors">
                  {String(i + 1).padStart(2,'0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Heart className="w-3 h-3" /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="w-3 h-3" /> {post.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {!data?.topPosts?.length && <p className="text-sm text-slate-400">No posts yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
