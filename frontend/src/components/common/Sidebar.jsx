import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Compass, BookOpen, MessageSquare, Bell, Bookmark, Settings, PlusSquare } from 'lucide-react';
import Avatar from './Avatar';
import CreatePostModal from '../posts/CreatePostModal';
import { useState } from 'react';

const links = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/notes', icon: BookOpen, label: 'Study Notes' },
  { to: '/chat', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="card p-4 space-y-1">
      {/* Profile mini */}
      <NavLink
        to={`/profile/${user?.username}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-2"
      >
        <Avatar user={user} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">@{user?.username}</p>
        </div>
      </NavLink>

      <hr className="border-slate-200 dark:border-slate-700 mb-2" />

      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
            }`
          }
        >
          <Icon className="w-5 h-5 shrink-0" />
          {label}
          {label === 'Notifications' && unreadCount > 0 && (
            <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      ))}

      <div className="pt-2">
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary w-full justify-center"
        >
          <PlusSquare className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
