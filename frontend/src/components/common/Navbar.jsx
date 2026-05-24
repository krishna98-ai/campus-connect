import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap, Search, Bell, Moon, Sun, Menu, X, MessageSquare, LogOut, Settings, User } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import { resetUnread } from '../../store/notificationsSlice';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden sm:block">Campus Connect</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, notes, people..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary-400 dark:focus:border-primary-500 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          {/* Dark mode */}
          <button onClick={toggleDark} className="btn-ghost p-2 rounded-xl">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Messages */}
          <Link to="/chat" className="btn-ghost p-2 rounded-xl relative">
            <MessageSquare className="w-5 h-5" />
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            onClick={() => dispatch(resetUnread())}
            className="btn-ghost p-2 rounded-xl relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Avatar user={user} size="sm" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
                </div>
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <hr className="my-1 border-slate-100 dark:border-slate-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="btn-ghost p-2 rounded-xl lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
