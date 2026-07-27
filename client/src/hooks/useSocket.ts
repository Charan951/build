/// <reference types="vite/client" />
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
  token?: string | null;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true, token } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    // Connect to current host or dev API server URL
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: { token: token || localStorage.getItem('adminToken') },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, token]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    subscribe,
  };
};
