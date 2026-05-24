import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Heart, MessageCircle, UserPlus, BookOpen, Trash2, CheckCheck } from 'lucide-react';
import api from '../api/axiosInstance';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { resetUnread } from '../store/notificationsSlice';
import { formatRelative } from '../utils/helpers';
import toast from 'react-hot-toast';
import { getSocket } from '../socket/socket';

const typeConfig = {
  like:          { icon: Heart,          color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
  comment:       { icon: MessageCircle,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  reply:         { icon: MessageCircle,  color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  follow:        { icon: UserPlus,       color: 'text-green-500',   bg: 'bg-green-50 dark:bg-green-900/20' },
  note_like:     { icon: BookOpen,       color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  note_download: { icon: BookOpen,       color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
  mention:       { icon: MessageCircle,  color: 'text-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  message:       { icon: MessageCircle,  color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const loadNotifications = async (p = 1) => {
    try {
      const res = await api.get('/notifications', { params: { page: p, limit: 20 } });
      const data = res.data.data || [];
      setNotifications(prev => p === 1 ? data : [...prev, ...data]);
      setPagination(res.data.pagination);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications(1);
    dispatch(resetUnread());

    // Mark all as read after brief delay
    const timer = setTimeout(() => {
      api.put('/notifications/read', { ids: 'all' }).catch(() => {});
    }, 1500);

    // Real-time new notifications via socket
    const socket = getSocket();
    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }

    return () => {
      clearTimeout(timer);
      if (socket) socket.off('notification');
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put('/notifications/read', { ids: [id] });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (_) { toast.error('Failed to delete'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read', { ids: 'all' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      dispatch(resetUnread());
      toast.success('All marked as read');
    } catch (_) {}
  };

  const getLink = (notif) => {
    if (notif.post) return `/posts/${notif.post._id || notif.post}`;
    if (notif.note) return `/notes/${notif.note._id || notif.note}`;
    if (notif.type === 'follow') return `/profile/${notif.sender?.username}`;
    if (notif.type === 'message') return `/chat`;
    return '#';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-primary-600 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary gap-2 text-sm">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}

        {!loading && notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When someone likes, comments, or follows you, it'll show up here."
          />
        )}

        {notifications.map((notif) => {
          const cfg = typeConfig[notif.type] || typeConfig.like;
          const Icon = cfg.icon;
          return (
            <div
              key={notif._id}
              className={`flex items-start gap-4 p-4 transition-colors group ${
                !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Avatar with icon overlay */}
              <div className="relative shrink-0">
                <Avatar user={notif.sender} size="sm" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${cfg.bg} rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800`}>
                  <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                </div>
              </div>

              {/* Content */}
              <Link to={getLink(notif)} onClick={() => !notif.isRead && handleMarkRead(notif._id)} className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${!notif.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  <span className="font-bold text-slate-900 dark:text-white">{notif.sender?.name}</span>{' '}
                  {notif.message || getDefaultMessage(notif.type)}
                </p>
                {notif.post?.content && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">"{notif.post.content}"</p>
                )}
                <p className="text-xs text-slate-400 mt-1">{formatRelative(notif.createdAt)}</p>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="w-7 h-7 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 flex items-center justify-center text-primary-500"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="w-7 h-7 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {pagination?.hasNext && (
        <div className="flex justify-center">
          <button
            onClick={() => { const next = page + 1; setPage(next); loadNotifications(next); }}
            className="btn-secondary"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function getDefaultMessage(type) {
  const messages = {
    like:          'liked your post',
    comment:       'commented on your post',
    reply:         'replied to your comment',
    follow:        'started following you',
    note_like:     'liked your notes',
    note_download: 'downloaded your notes',
    mention:       'mentioned you in a post',
    message:       'sent you a message',
  };
  return messages[type] || 'interacted with your content';
}
