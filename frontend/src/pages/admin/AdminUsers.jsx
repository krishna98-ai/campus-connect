import { useEffect, useState } from 'react';
import { Search, Shield, ShieldOff, Trash2, UserCog, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axiosInstance';
import Avatar from '../../components/common/Avatar';
import { formatFullDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const toggleActive = async (userId, currentStatus) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionLoading(p => ({ ...p, [userId]: false }));
  };

  const changeRole = async (userId, newRole) => {
    setActionLoading(p => ({ ...p, [`role_${userId}`]: true }));
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, role: newRole } : u
      ));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
    setActionLoading(p => ({ ...p, [`role_${userId}`]: false }));
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete ${userName} and all their content?`)) return;
    setActionLoading(p => ({ ...p, [`del_${userId}`]: true }));
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setActionLoading(p => ({ ...p, [`del_${userId}`]: false }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {pagination ? `${pagination.total} total users` : 'Loading...'}
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, username..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); fetchUsers(1); }}
          className="input-field w-40"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className="btn-primary px-5">Search</button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">College</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="flex gap-3 items-center"><div className="skeleton w-9 h-9 rounded-full" /><div className="space-y-1.5"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton h-2.5 w-20 rounded" /></div></div></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="skeleton h-3 w-24 rounded" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><div className="skeleton h-3 w-20 rounded" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-6 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-6 w-14 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="skeleton h-8 w-20 rounded-lg ml-auto" /></td>
                </tr>
              ))}

              {!loading && users.map(user => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-600 dark:text-slate-400 text-xs">{user.college || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-500 text-xs">{formatFullDate(user.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => changeRole(user._id, e.target.value)}
                      disabled={actionLoading[`role_${user._id}`]}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(user._id, user.isActive)}
                        disabled={actionLoading[user._id] || user.role === 'admin'}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
                          user.isActive
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {actionLoading[user._id]
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />
                        }
                      </button>
                      <button
                        onClick={() => deleteUser(user._id, user.name)}
                        disabled={actionLoading[`del_${user._id}`] || user.role === 'admin'}
                        title="Delete user"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                      >
                        {actionLoading[`del_${user._id}`]
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} users
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="btn-secondary px-2 py-1.5 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
