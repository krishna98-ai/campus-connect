import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, GraduationCap, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reported', label: 'Reported Content', icon: AlertTriangle },
];

export default function AdminLayout() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Campus Connect</span>
          </div>
          <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
