
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  Compass,
  BookOpen,
  MessageSquare,
  Bell,
  Bookmark,
  Settings,
  PlusSquare,
} from "lucide-react";

import Avatar from "./Avatar";
import CreatePostModal from "../posts/CreatePostModal";

const links = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/notes", icon: BookOpen, label: "Study Notes" },
  { to: "/chat", icon: MessageSquare, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/saved", icon: Bookmark, label: "Saved" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector(
    (state) => state.notifications.unreadCount
  );

  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="card space-y-1 p-4">
      {/* Profile */}
      <NavLink
        to={`/profile/${user?.username}`}
        className="mb-2 flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <Avatar user={user} size="sm" />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {user?.name}
          </p>

          <p className="truncate text-xs text-slate-500">
            @{user?.username}
          </p>
        </div>
      </NavLink>

      <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

      {/* Navigation */}
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`
          }
        >
          <Icon className="h-5 w-5" />

          <span>{label}</span>

          {label === "Notifications" && unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </NavLink>
      ))}

      {/* Create Post */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="btn-primary mt-3 w-full justify-center"
      >
        <PlusSquare className="h-4 w-4" />
        Create Post
      </button>

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
