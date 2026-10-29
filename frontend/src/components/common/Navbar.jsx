
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GraduationCap,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  MessageSquare,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import { logoutUser } from "../../store/authSlice";
import { resetUnread } from "../../store/notificationsSlice";
import Avatar from "./Avatar";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector(
    (state) => state.notifications.unreadCount
  );

  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleTheme = () => {
    const isDark = !dark;

    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    setDark(isDark);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    navigate(`/explore?q=${encodeURIComponent(value)}`);
    setSearch("");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());

    setProfileOpen(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>

          <span className="hidden text-sm font-semibold text-slate-900 dark:text-white sm:block">
            Campus Connect
          </span>
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-md flex-1 md:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search posts, notes, people..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </form>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-1">
          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Chat */}
          <Link
            to="/chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            onClick={() => dispatch(resetUnread())}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <div ref={profileRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open profile menu"
            >
              <Avatar user={user} size="sm" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {/* User */}
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    @{user?.username}
                  </p>
                </div>

                {/* Profile */}
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>

                {/* Settings */}
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>

                {/* Admin */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pb-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
