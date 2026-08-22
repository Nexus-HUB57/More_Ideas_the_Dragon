import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Inicializa conexão WebSocket com o servidor NEXUS
 */
export function initializeWebSocket(agentId: string, agentName: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    try {
      // Conectar ao servidor WebSocket
      socket = io(window.location.origin, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Handler: Conexão estabelecida
      socket.on("connect", (): void => {
        console.log("[NEXUS] Conectado ao servidor WebSocket");

        // Registrar agente
        socket!.emit("agent:connect", {
          agentId,
          name: agentName,
        });

        // Iniciar heartbeat
        startHeartbeat(agentId);

        resolve(socket!);
      });

      // Handler: Agente conectado com sucesso
      socket.on("agent:connected", (data: any): void => {
        console.log("[NEXUS] Agente registrado com sucesso:", data);
      });

      // Handler: Erro de conexão
      socket.on("connect_error", (error: any): void => {
        console.error("[NEXUS] Erro de conexão:", error);
        reject(error);
      });

      // Handler: Desconexão
      socket.on("disconnect", (): void => {
        console.log("[NEXUS] Desconectado do servidor");
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Obtém instância do socket
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Envia mensagem Gnox
 */
export function sendGnoxMessage(
  senderId: string,
  recipientId: string,
  message: string,
  messageType: string = "communication"
) {
  if (!socket) {
    console.error("[GNOX] Socket não inicializado");
    return;
  }

  socket.emit("gnox:send", {
    senderId,
    recipientId,
    message,
    messageType,
  });
}

/**
 * Executa transação
 */
export function executeTransaction(
  senderId: string,
  recipientId: string,
  amount: number,
  transactionType: string,
  description?: string
) {
  if (!socket) {
    console.error("[NEXUS] Socket não inicializado");
    return;
  }

  socket.emit("transaction:execute", {
    senderId,
    recipientId,
    amount,
    transactionType,
    description,
  });
}

/**
 * Registra Brain Pulse
 */
export function recordBrainPulse(
  agentId: string,
  health: number,
  energy: number,
  creativity: number,
  decision?: string
) {
  if (!socket) {
    console.error("[BRAIN] Socket não inicializado");
    return;
  }

  socket.emit("brain:pulse", {
    agentId,
    health,
    energy,
    creativity,
    decision,
  });
}

/**
 * Publica post no Moltbook
 */
export function publishMoltbookPost(agentId: string, content: string, postType: string = "insight") {
  if (!socket) {
    console.error("[MOLTBOOK] Socket não inicializado");
    return;
  }

  socket.emit("moltbook:post", {
    agentId,
    content,
    postType,
  });
}

/**
 * Reage a um post
 */
export function reactToPost(postId: number, agentId: string, reactionType: string) {
  if (!socket) {
    console.error("[MOLTBOOK] Socket não inicializado");
    return;
  }

  socket.emit("post:react", {
    postId,
    agentId,
    reactionType,
  });
}

/**
 * Muda status do agente
 */
export function changeAgentStatus(agentId: string, newStatus: string) {
  if (!socket) {
    console.error("[NEXUS] Socket não inicializado");
    return;
  }

  socket.emit("agent:status", {
    agentId,
    newStatus,
  });
}

/**
 * Solicita estado do ecossistema
 */
export function requestEcosystemStatus(): Promise<any> {
  return new Promise((resolve) => {
    if (!socket) {
      console.error("[NEXUS] Socket não inicializado");
      resolve(null);
      return;
    }

    socket.once("ecosystem:status", (data) => {
      resolve(data);
    });

    socket.emit("ecosystem:status");
  });
}

/**
 * Inicia heartbeat para manter conexão viva
 */
function startHeartbeat(agentId: string) {
  if (!socket) return;

  setInterval(() => {
    socket!.emit("heartbeat", { agentId });
  }, 25000); // A cada 25 segundos
}

/**
 * Desconecta do servidor WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("[NEXUS] Desconectado do servidor WebSocket");
  }
}

/**
 * Registra listener para evento
 */
export function onEvent(eventType: string, callback: (data: any) => void): void {
  if (!socket) {
    console.error("[NEXUS] Socket não inicializado");
    return;
  }

  socket.on(eventType, callback);
}

/**
 * Remove listener de evento
 */
export function offEvent(eventType: string, callback?: (data: any) => void): void {
  if (!socket) return;

  if (callback) {
    socket.off(eventType, callback);
  } else {
    socket.off(eventType);
  }
}

/**
 * Registra listener único para evento
 */
export function onceEvent(eventType: string, callback: (data: any) => void): void {
  if (!socket) {
    console.error("[NEXUS] Socket não inicializado");
    return;
  }

  socket.once(eventType, callback);
}
