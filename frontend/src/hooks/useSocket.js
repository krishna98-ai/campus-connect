import { useEffect } from 'react';
import { getSocket } from '../socket/socket';

export default function useSocket(event, handler) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}
