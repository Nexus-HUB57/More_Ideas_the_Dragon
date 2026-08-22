import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  metrics: any | null;
  alerts: any[] | null;
  events: any[] | null;
  marketData: any[] | null;
  harmonyLevel: number;
  agentsStatus: any | null;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  clearError: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export function WebSocketProvider({ children, url }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);
  const [marketData, setMarketData] = useState<any[] | null>(null);
  const [harmonyLevel, setHarmonyLevel] = useState(50);
  const [agentsStatus, setAgentsStatus] = useState<any | null>(null);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const socketUrl = url || import.meta.env.VITE_API_URL || window.location.origin;
    
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      transports: ["websocket", "polling"],
      path: "/socket.io/",
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected:", newSocket.id);
      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
      toast.success("Conectado ao servidor em tempo real", {
        duration: 2000,
      });
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
      setError("Desconectado do servidor");
    });

    newSocket.on("connect_error", (err: any) => {
      console.error("[WebSocket] Connection error:", err);
      setError(`Erro de conexão: ${err.message}`);
      setIsReconnecting(true);
      reconnectAttempts.current += 1;
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("[WebSocket] Attempting to reconnect...");
      setIsReconnecting(true);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("[WebSocket] Reconnection failed after max attempts");
      setError("Falha ao reconectar. Máximo de tentativas atingido.");
      setIsReconnecting(false);
      toast.error("Falha ao reconectar ao servidor", {
        duration: 4000,
      });
    });

    // Data events
    newSocket.on("metrics:update", (data: any) => {
      console.log("[WebSocket] Metrics update:", data);
      setMetrics(data);
      if (data.harmonyLevel !== undefined) {
        setHarmonyLevel(data.harmonyLevel);
      }
    });

    newSocket.on("alerts:new", (data: any) => {
      console.log("[WebSocket] Alerts update:", data);
      setAlerts(Array.isArray(data) ? data : [data]);
      if (Array.isArray(data) && data.length > 0) {
        toast.warning(`${data.length} novo(s) alerta(s) recebido(s)`, {
          duration: 3000,
        });
      }
    });

    newSocket.on("events:new", (data: any) => {
      console.log("[WebSocket] Events update:", data);
      setEvents(Array.isArray(data) ? data : [data]);
    });

    newSocket.on("market:update", (data: any) => {
      console.log("[WebSocket] Market data update:", data);
      setMarketData(Array.isArray(data) ? data : [data]);
    });

    newSocket.on("harmony:change", (data: any) => {
      console.log("[WebSocket] Harmony change:", data);
      if (data.harmonyLevel !== undefined) {
        setHarmonyLevel(data.harmonyLevel);
        toast.info(`Nível de harmonia: ${data.harmonyLevel}%`, {
          duration: 2000,
        });
      }
    });

    newSocket.on("agents:status", (data: any) => {
      console.log("[WebSocket] Agent status update:", data);
      setAgentsStatus(data);
    });

    newSocket.on("error", (error: any) => {
      console.error("[WebSocket] Error:", error);
      setError(`Erro no WebSocket: ${error}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  const subscribe = useCallback(
    (channel: string) => {
      if (socket && socket.connected) {
        socket.emit(`subscribe:${channel}`);
        console.log(`[WebSocket] Subscribed to ${channel}`);
      }
    },
    [socket]
  );

  const unsubscribe = useCallback(
    (channel: string) => {
      if (socket) {
        socket.emit(`unsubscribe:${channel}`);
        console.log(`[WebSocket] Unsubscribed from ${channel}`);
      }
    },
    [socket]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    isReconnecting,
    error,
    metrics,
    alerts,
    events,
    marketData,
    harmonyLevel,
    agentsStatus,
    subscribe,
    unsubscribe,
    clearError,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}

// Specialized hooks for each data type
export function useWebSocketMetrics() {
  const { metrics, subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe("metrics");
      return () => unsubscribe("metrics");
    }
  }, [subscribe, unsubscribe, isConnected]);

  return metrics;
}

export function useWebSocketAlerts() {
  const { alerts, subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe("alerts");
      return () => unsubscribe("alerts");
    }
  }, [subscribe, unsubscribe, isConnected]);

  return alerts;
}

export function useWebSocketEvents() {
  const { events, subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe("events");
      return () => unsubscribe("events");
    }
  }, [subscribe, unsubscribe, isConnected]);

  return events;
}

export function useWebSocketMarket() {
  const { marketData, subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe("market");
      return () => unsubscribe("market");
    }
  }, [subscribe, unsubscribe, isConnected]);

  return marketData;
}

export function useWebSocketConnection() {
  const { isConnected, isReconnecting, error } = useWebSocket();
  
  return {
    isConnected,
    isReconnecting,
    error,
  };
}

export function useWebSocketAgents() {
  const { agentsStatus, subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      subscribe("metrics");
      return () => unsubscribe("metrics");
    }
  }, [subscribe, unsubscribe, isConnected]);

  return agentsStatus;
}
