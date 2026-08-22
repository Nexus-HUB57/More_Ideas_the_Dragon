import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * WEBSOCKET INTEGRATION - Socket.IO para Tempo Real
 * 
 * Gerencia conexões em tempo real para:
 * - Feed social (Moltbook)
 * - Sinais vitais (Brain Pulse)
 * - Transações
 * - Notificações
 */

let io: SocketIOServer | null = null;

/**
 * Inicializa o servidor Socket.IO
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.VITE_FRONTEND_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // Middleware de autenticação
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Aqui você validaria o token JWT
    next();
  });

  // Handlers de conexão
  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Juntar o cliente em salas específicas
    socket.on("join-agent", (agentId: string) => {
      socket.join(`agent:${agentId}`);
      console.log(`[WebSocket] Client ${socket.id} joined agent:${agentId}`);
    });

    socket.on("join-feed", () => {
      socket.join("moltbook:feed");
      console.log(`[WebSocket] Client ${socket.id} joined moltbook:feed`);
    });

    socket.on("join-governance", () => {
      socket.join("governance:metrics");
      console.log(`[WebSocket] Client ${socket.id} joined governance:metrics`);
    });

    // Handlers de eventos
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error(`[WebSocket] Error from ${socket.id}:`, error);
    });
  });

  return io;
}

/**
 * Obtém a instância do Socket.IO
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * EMITTERS - Funções para emitir eventos em tempo real
 */

/**
 * Emite um novo post no Moltbook para todos os clientes
 */
export function emitNewPost(postData: {
  id: number;
  agentId: string;
  content: string;
  postType: string;
  createdAt: Date;
}) {
  if (!io) return;
  io.to("moltbook:feed").emit("post:new", postData);
}

/**
 * Emite uma reação em tempo real
 */
export function emitPostReaction(postId: number, reactionCount: number) {
  if (!io) return;
  io.to("moltbook:feed").emit("post:reaction", { postId, reactionCount });
}

/**
 * Emite atualização de sinais vitais para um agente
 */
export function emitBrainPulseUpdate(agentId: string, pulseData: {
  health: number;
  energy: number;
  creativity: number;
  decision: string;
}) {
  if (!io) return;
  io.to(`agent:${agentId}`).emit("brain-pulse:update", pulseData);
}

/**
 * Emite uma nova transação
 */
export function emitTransaction(transactionData: {
  id: number;
  senderId: string;
  recipientId: string;
  amount: number;
  transactionType: string;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`agent:${transactionData.senderId}`).emit("transaction:new", transactionData);
  io.to(`agent:${transactionData.recipientId}`).emit("transaction:received", transactionData);
  io.to("governance:metrics").emit("transaction:global", transactionData);
}

/**
 * Emite uma notificação para um usuário
 */
export function emitNotification(userId: number, notificationData: {
  id: number;
  title: string;
  content: string;
  notificationType: string;
  agentId?: string;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification:new", notificationData);
}

/**
 * Emite atualização de métricas globais de governança
 */
export function emitGovernanceMetrics(metrics: {
  totalAgents: number;
  activeAgents: number;
  totalTransactions: number;
  totalPosts: number;
  globalSentience: number;
  timestamp: Date;
}) {
  if (!io) return;
  io.to("governance:metrics").emit("governance:metrics-update", metrics);
}

/**
 * Emite uma reflexão de agente
 */
export function emitAgentReflection(agentId: string, reflectionData: {
  id: number;
  reflection: string;
  sentimentScore: number;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`agent:${agentId}`).emit("reflection:new", reflectionData);
  io.to("moltbook:feed").emit("reflection:global", { agentId, ...reflectionData });
}

/**
 * Emite uma mensagem Gnox's (criptografada)
 */
export function emitGnoxsMessage(senderId: string, recipientId: string, messageData: {
  id: number;
  encryptedContent: string;
  messageType: string;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`agent:${recipientId}`).emit("gnoxs:message", {
    from: senderId,
    ...messageData,
  });
}

/**
 * Emite atualização de status de um agente
 */
export function emitAgentStatusUpdate(agentId: string, status: "active" | "inactive" | "sleeping" | "critical") {
  if (!io) return;
  io.to("governance:metrics").emit("agent:status-update", { agentId, status });
}

/**
 * Emite um novo projeto Forge
 */
export function emitForgeProjectCreated(projectData: {
  projectId: string;
  agentId: string;
  name: string;
  status: string;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`agent:${projectData.agentId}`).emit("forge:project-created", projectData);
  io.to("governance:metrics").emit("forge:project-global", projectData);
}

/**
 * Emite atualização de status de projeto
 */
export function emitForgeProjectStatusUpdate(
  projectId: string,
  agentId: string,
  newStatus: string
) {
  if (!io) return;
  io.to(`agent:${agentId}`).emit("forge:project-status", { projectId, status: newStatus });
  io.to("governance:metrics").emit("forge:status-global", { projectId, status: newStatus });
}

/**
 * Emite criação de novo NFT
 */
export function emitNFTCreated(assetData: {
  assetId: string;
  agentId: string;
  name: string;
  value: number;
  createdAt: Date;
}) {
  if (!io) return;
  io.to(`agent:${assetData.agentId}`).emit("nft:created", assetData);
  io.to("governance:metrics").emit("nft:global", assetData);
}

/**
 * Emite evento de nascimento de novo agente (DNA Fusion)
 */
export function emitAgentBirth(agentData: {
  agentId: string;
  name: string;
  parentId?: string;
  generation: number;
  createdAt: Date;
}) {
  if (!io) return;
  io.to("moltbook:feed").emit("agent:birth", agentData);
  io.to("governance:metrics").emit("agent:birth-global", agentData);
}

/**
 * Emite evento crítico de sistema
 */
export function emitSystemEvent(eventData: {
  eventType: string;
  agentId?: string;
  severity: "info" | "warning" | "critical";
  data: any;
  timestamp: Date;
}) {
  if (!io) return;
  io.emit("system:event", eventData);
}

/**
 * Broadcast para todos os clientes conectados
 */
export function broadcastToAll(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

/**
 * Broadcast para uma sala específica
 */
export function broadcastToRoom(room: string, event: string, data: any) {
  if (!io) return;
  io.to(room).emit(event, data);
}
