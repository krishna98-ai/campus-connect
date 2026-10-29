
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";

const adminLinks = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    to: "/admin/reported",
    label: "Reported Content",
    icon: AlertTriangle,
  },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            <span className="font-bold text-slate-900 dark:text-white">
              Campus Connect
            </span>
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back to app */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
