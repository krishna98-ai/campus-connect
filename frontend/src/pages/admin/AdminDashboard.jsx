
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Heart,
} from "lucide-react";

import api from "../../api/axiosInstance";
import Avatar from "../../components/common/Avatar";
import { formatRelative } from "../../utils/helpers";

function StatCard({ icon: Icon, label, value, color, delta }) {
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <p className="text-3xl font-black text-slate-900 dark:text-white">
        {value?.toLocaleString() ?? "—"}
      </p>

      {delta !== undefined && (
        <p className="flex items-center gap-1 text-xs text-green-600">
          <ArrowUpRight className="h-3 w-3" />
          {delta} this month
        </p>
      )}
    </div>
  );
}

function BarChart({ data }) {
  if (!data?.length) {
    return null;
  }

  const maxCount = Math.max(
    ...data.map((item) => item.count),
    1
  );

  const months = data.slice(0, 12).reverse();

  return (
    <div className="flex h-24 items-end gap-1.5">
      {months.map((item, index) => {
        const height = Math.max(
          4,
          (item.count / maxCount) * 96
        );

        const label = `${item._id?.year}-${String(
          item._id?.month
        ).padStart(2, "0")}`;

        return (
          <div
            key={index}
            className="group relative flex flex-1 flex-col items-center gap-1"
          >
            <div
              className="w-full cursor-default rounded-sm bg-primary-400 hover:bg-primary-500 dark:bg-primary-500"
              style={{ height: `${height}px` }}
            />

            <span className="absolute -top-6 z-10 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
              {label}: {item.count}
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
    const getDashboardData = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setData(response.data);
      } catch (error) {
        // Dashboard data failed to load
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="skeleton h-32 rounded-xl"
            />
          ))}
        </div>

        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>

        <p className="mt-0.5 text-sm text-slate-500">
          Platform analytics and management overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Students"
          value={data?.stats?.totalUsers}
          color="bg-blue-500"
        />

        <StatCard
          icon={FileText}
          label="Total Posts"
          value={data?.stats?.totalPosts}
          color="bg-violet-500"
        />

        <StatCard
          icon={BookOpen}
          label="Notes Uploaded"
          value={data?.stats?.totalNotes}
          color="bg-emerald-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Growth */}
        <div className="card space-y-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              User Growth
            </h3>

            <span className="text-xs text-slate-500">
              Last 12 months
            </span>
          </div>

          {data?.usersByMonth?.length > 0 ? (
            <BarChart data={data.usersByMonth} />
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-slate-400">
              No data yet
            </div>
          )}

          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>12 months ago</span>
            <span>This month</span>
          </div>
        </div>

        {/* Notes by Category */}
        <div className="card space-y-3 p-5">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Notes by Category
          </h3>

          <div className="max-h-52 space-y-2 overflow-y-auto">
            {data?.notesByCategory?.map((category) => {
              const percentage =
                (category.count /
                  (data?.stats?.totalNotes || 1)) *
                100;

              return (
                <div
                  key={category._id}
                  className="flex items-center gap-2"
                >
                  <span className="w-32 truncate text-xs text-slate-600 dark:text-slate-400">
                    {category._id}
                  </span>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-primary-400"
                      style={{
                        width: `${Math.min(100, percentage)}%`,
                      }}
                    />
                  </div>

                  <span className="w-6 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {category.count}
                  </span>
                </div>
              );
            })}

            {!data?.notesByCategory?.length && (
              <p className="text-sm text-slate-400">
                No data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users + Top Posts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Recent Users
            </h3>

            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {data?.recentUsers?.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 py-3"
              >
                <Avatar user={user} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.college || `@${user.username}`}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-slate-400">
                  {formatRelative(user.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Top Posts
            </h3>

            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>

          <div className="space-y-3">
            {data?.topPosts?.map((post, index) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="group flex gap-3"
              >
                <span className="text-xl font-black text-slate-200 dark:text-slate-700">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-slate-800 group-hover:text-primary-600 dark:text-slate-200">
                    {post.content}
                  </p>

                  <div className="mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Heart className="h-3 w-3" />
                      {post.likeCount}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="h-3 w-3" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {!data?.topPosts?.length && (
              <p className="text-sm text-slate-400">
                No posts yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
