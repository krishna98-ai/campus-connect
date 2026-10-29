import { useEffect, useState } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axiosInstance";
import Avatar from "../../components/common/Avatar";
import { formatFullDate } from "../../utils/helpers";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);

    try {
      const params = {
        page: pageNumber,
        limit: 15,
      };

      if (search) {
        params.search = search;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await api.get("/admin/users", {
        params,
      });

      setUsers(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      // Failed to load users
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    fetchUsers(1);
  };

  const handleRoleFilter = (event) => {
    const role = event.target.value;

    setRoleFilter(role);
    setPage(1);

    // Fetch using the newly selected role.
    fetchUsersWithRole(role);
  };

  const fetchUsersWithRole = async (role) => {
    setLoading(true);

    try {
      const params = {
        page: 1,
        limit: 15,
      };

      if (search) {
        params.search = search;
      }

      if (role) {
        params.role = role;
      }

      const response = await api.get("/admin/users", {
        params,
      });

      setUsers(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      // Failed to load users
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId, currentStatus) => {
    setActionLoading((previous) => ({
      ...previous,
      [userId]: true,
    }));

    try {
      await api.put(`/admin/users/${userId}/toggle-active`);

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: !currentStatus,
              }
            : user,
        ),
      );

      toast.success(`User ${currentStatus ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [userId]: false,
      }));
    }
  };

  const changeRole = async (userId, newRole) => {
    const loadingKey = `role_${userId}`;

    setActionLoading((previous) => ({
      ...previous,
      [loadingKey]: true,
    }));

    try {
      await api.put(`/admin/users/${userId}/role`, {
        role: newRole,
      });

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user,
        ),
      );

      toast.success("Role updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [loadingKey]: false,
      }));
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Permanently delete ${userName} and all their content?`,
    );

    if (!confirmed) {
      return;
    }

    const loadingKey = `del_${userId}`;

    setActionLoading((previous) => ({
      ...previous,
      [loadingKey]: true,
    }));

    try {
      await api.delete(`/admin/users/${userId}`);

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== userId),
      );

      toast.success("User deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [loadingKey]: false,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          User Management
        </h1>

        <p className="mt-0.5 text-sm text-slate-500">
          {pagination ? `${pagination.total} total users` : "Loading..."}
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, username..."
            className="input-field pl-10"
          />
        </div>

        <select
          value={roleFilter}
          onChange={handleRoleFilter}
          className="input-field w-40"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>

        <button type="submit" className="btn-primary px-5">
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                  User
                </th>

                <th className="hidden px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 md:table-cell">
                  College
                </th>

                <th className="hidden px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 lg:table-cell">
                  Joined
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Role
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {/* Loading rows */}
              {loading &&
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-9 w-9 rounded-full" />

                        <div className="space-y-1.5">
                          <div className="skeleton h-3 w-28 rounded" />
                          <div className="skeleton h-2.5 w-20 rounded" />
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="skeleton h-3 w-24 rounded" />
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="skeleton h-3 w-20 rounded" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="skeleton h-6 w-16 rounded-full" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="skeleton h-6 w-14 rounded-full" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="ml-auto h-8 w-20 skeleton rounded-lg" />
                    </td>
                  </tr>
                ))}

              {/* Users */}
              {!loading &&
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="sm" />

                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.name}
                          </p>

                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {user.college || "—"}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-xs text-slate-500">
                        {formatFullDate(user.createdAt)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          changeRole(user._id, event.target.value)
                        }
                        disabled={actionLoading[`role_${user._id}`]}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value="student">Student</option>

                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`badge text-xs ${
                          user.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Activate / Deactivate */}
                        <button
                          type="button"
                          onClick={() => toggleActive(user._id, user.isActive)}
                          disabled={
                            actionLoading[user._id] || user.role === "admin"
                          }
                          title={user.isActive ? "Deactivate" : "Activate"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40 ${
                            user.isActive
                              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                        >
                          {actionLoading[user._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isActive ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteUser(user._id, user.name)}
                          disabled={
                            actionLoading[`del_${user._id}`] ||
                            user.role === "admin"
                          }
                          title="Delete user"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-900/20"
                        >
                          {actionLoading[`del_${user._id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* No users */}
              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
              users
            </p>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={!pagination.hasPrev}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setPage((previous) => previous + 1)}
                disabled={!pagination.hasNext}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
