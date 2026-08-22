import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { url = window.location.origin, autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Function[]>>(new Map());

  useEffect(() => {
    if (!autoConnect) return;

    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("[WebSocket] Connected");
      // Authenticate with user ID if available
      const userId = localStorage.getItem("userId");
      if (userId) {
        socketRef.current?.emit("auth", userId);
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [url, autoConnect]);

  const on = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (!socketRef.current) return;

      if (!listenersRef.current.has(event)) {
        listenersRef.current.set(event, []);

        socketRef.current.on(event, (data: any) => {
          const listeners = listenersRef.current.get(event) || [];
          listeners.forEach((listener) => listener(data));
        });
      }

      listenersRef.current.get(event)?.push(callback);

      return () => {
        const listeners = listenersRef.current.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    []
  );

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const subscribe = useCallback((channel: string) => {
    emit(`subscribe:${channel}`);
  }, [emit]);

  const unsubscribe = useCallback((channel: string) => {
    emit(`unsubscribe:${channel}`);
  }, [emit]);

  const isConnected = socketRef.current?.connected ?? false;

  return {
    socket: socketRef.current,
    on,
    emit,
    subscribe,
    unsubscribe,
    isConnected,
  };
}
