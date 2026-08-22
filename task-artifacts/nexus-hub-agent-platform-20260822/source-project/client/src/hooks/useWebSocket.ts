import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Hook para gerenciar conexões WebSocket com Socket.IO
 * Fornece métodos para se conectar, desconectar e ouvir eventos em tempo real
 */

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.VITE_FRONTEND_URL || "http://localhost:3000",
    autoConnect = true,
    reconnection = true,
    reconnectionDelay = 1000,
    reconnectionDelayMax = 5000,
    reconnectionAttempts = 5,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Inicializar conexão
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setIsConnecting(true);

    const socket = io(url, {
      reconnection,
      reconnectionDelay,
      reconnectionDelayMax,
      reconnectionAttempts,
      auth: {
        token: localStorage.getItem("authToken") || "",
      },
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected:", socket.id);
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
      setIsConnecting(false);
    });

    socketRef.current = socket;
  }, [url, reconnection, reconnectionDelay, reconnectionDelayMax, reconnectionAttempts]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  // Emitir evento
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("[WebSocket] Socket not connected, cannot emit event:", event);
    }
  }, []);

  // Ouvir evento
  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socketRef.current) {
      console.warn("[WebSocket] Socket not initialized");
      return;
    }
    socketRef.current.on(event, callback);
  }, []);

  // Parar de ouvir evento
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (!socketRef.current) return;
    if (callback) {
      socketRef.current.off(event, callback);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  // Auto-conectar ao montar
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

/**
 * Hook para ouvir um evento específico do WebSocket
 */
export function useWebSocketEvent(
  event: string,
  callback: (data: any) => void,
  socket: Socket | null
) {
  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback, socket]);
}

/**
 * Hook para emitir um evento do WebSocket com delay
 */
export function useWebSocketEmit(
  event: string,
  data: any,
  socket: Socket | null,
  delay: number = 0
) {
  useEffect(() => {
    if (!socket?.connected) return;

    const timer = setTimeout(() => {
      socket.emit(event, data);
    }, delay);

    return () => clearTimeout(timer);
  }, [event, data, socket, delay]);
}

/**
 * Hook para gerenciar salas do WebSocket
 */
export function useWebSocketRoom(
  roomName: string,
  socket: Socket | null
) {
  useEffect(() => {
    if (!socket?.connected) return;

    socket.emit("join-room", roomName);

    return () => {
      socket.emit("leave-room", roomName);
    };
  }, [roomName, socket]);
}
