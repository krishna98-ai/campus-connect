import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMe } from './store/authSlice';
import { fetchUnreadCount } from './store/notificationsSlice';

import { initSocket, disconnectSocket } from './socket/socket';

import AppRoutes from './routes/AppRoutes';
import FullPageSpinner from './components/common/FullPageSpinner';

export default function App() {
  const dispatch = useDispatch();

  const { isAuthenticated, loading, user } = useSelector(
    (s) => s.auth
  );

  // Persist auth on refresh
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      initSocket(null);

      dispatch(fetchUnreadCount());

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user, dispatch]);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem('theme');

    if (
      saved === 'dark' ||
      (!saved &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (loading) {
    return <FullPageSpinner />;
  }

  return <AppRoutes />;
}