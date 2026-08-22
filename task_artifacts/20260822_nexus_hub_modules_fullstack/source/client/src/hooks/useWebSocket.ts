import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed" | "error";

export type RealtimeMessage = {
  type: string;
  occurredAt?: number;
  [key: string]: unknown;
};

function buildWebSocketUrl(path: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}`;
}

export function useWebSocket<T extends RealtimeMessage = RealtimeMessage>(path = "/api/realtime") {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);
  const attemptsRef = useRef(0);
  const [status, setStatus] = useState<WebSocketStatus>("idle");
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  useEffect(() => {
    stoppedRef.current = false;
    attemptsRef.current = 0;

    const connect = () => {
      if (stoppedRef.current) return;
      const attempt = attemptsRef.current;
      setStatus(attempt === 0 ? "connecting" : "reconnecting");

      const socket = new WebSocket(buildWebSocketUrl(path));
      socketRef.current = socket;

      socket.onopen = () => {
        attemptsRef.current = 0;
        setStatus("open");
      };

      socket.onmessage = event => {
        try {
          setLastMessage(JSON.parse(event.data) as T);
        } catch {
          // Mensagens inválidas não interrompem o stream realtime.
        }
      };

      socket.onerror = () => {
        setStatus("error");
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (stoppedRef.current) {
          setStatus("closed");
          return;
        }

        attemptsRef.current += 1;
        const delay = Math.min(1000 * 2 ** Math.min(attemptsRef.current - 1, 4), 10000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      stoppedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [path]);

  const send = useCallback((payload: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  return {
    status,
    lastMessage,
    send,
    isConnected: status === "open",
  };
}
