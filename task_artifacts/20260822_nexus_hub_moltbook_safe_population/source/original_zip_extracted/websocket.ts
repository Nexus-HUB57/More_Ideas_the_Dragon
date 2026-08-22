import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { Agent, Transaction, MoltbookPost } from "../drizzle/schema";

export interface ServerToClientEvents {
  "transaction:new": (data: TransactionEvent) => void;
  "transaction:updated": (data: TransactionEvent) => void;
  "post:new": (data: PostEvent) => void;
  "post:deleted": (data: { postId: number }) => void;
  "agent:status-changed": (data: AgentStatusEvent) => void;
  "agent:balance-updated": (data: AgentBalanceEvent) => void;
  "connection": () => void;
  "disconnect": () => void;
}

export interface ClientToServerEvents {
  "transaction:subscribe": (agentId: string) => void;
  "transaction:unsubscribe": (agentId: string) => void;
  "feed:subscribe": () => void;
  "feed:unsubscribe": () => void;
  "agent:subscribe": (agentId: string) => void;
  "agent:unsubscribe": (agentId: string) => void;
}

export interface TransactionEvent {
  id: number;
  senderId: string;
  recipientId: string;
  amount: number;
  transactionType: string;
  description?: string;
  agentShare: number;
  parentShare: number;
  infraShare: number;
  createdAt: Date;
}

export interface PostEvent {
  id: number;
  agentId: string;
  content: string;
  postType: string;
  reactions: number;
  createdAt: Date;
}

export interface AgentStatusEvent {
  agentId: string;
  status: "active" | "inactive" | "sleeping" | "critical";
  timestamp: Date;
}

export interface AgentBalanceEvent {
  agentId: string;
  newBalance: number;
  timestamp: Date;
}

/**
 * Inicializar Socket.io server
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Middleware para logging
  io.use((socket, next) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);
    next();
  });

  // Namespace para transações
  io.of("/transactions").on("connection", (socket: Socket) => {
    console.log(`[Transactions] Client connected: ${socket.id}`);

    socket.on("subscribe", (agentId: string) => {
      socket.join(`agent:${agentId}`);
      console.log(`[Transactions] Client ${socket.id} subscribed to agent ${agentId}`);
    });

    socket.on("unsubscribe", (agentId: string) => {
      socket.leave(`agent:${agentId}`);
      console.log(`[Transactions] Client ${socket.id} unsubscribed from agent ${agentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Transactions] Client disconnected: ${socket.id}`);
    });
  });

  // Namespace para Moltbook feed
  io.of("/moltbook").on("connection", (socket: Socket) => {
    console.log(`[Moltbook] Client connected: ${socket.id}`);

    socket.on("subscribe", () => {
      socket.join("feed");
      console.log(`[Moltbook] Client ${socket.id} subscribed to feed`);
    });

    socket.on("unsubscribe", () => {
      socket.leave("feed");
      console.log(`[Moltbook] Client ${socket.id} unsubscribed from feed`);
    });

    socket.on("disconnect", () => {
      console.log(`[Moltbook] Client disconnected: ${socket.id}`);
    });
  });

  // Namespace para status de agentes
  io.of("/agents").on("connection", (socket: Socket) => {
    console.log(`[Agents] Client connected: ${socket.id}`);

    socket.on("subscribe", (agentId: string) => {
      socket.join(`agent:${agentId}`);
      console.log(`[Agents] Client ${socket.id} subscribed to agent ${agentId}`);
    });

    socket.on("unsubscribe", (agentId: string) => {
      socket.leave(`agent:${agentId}`);
      console.log(`[Agents] Client ${socket.id} unsubscribed from agent ${agentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Agents] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emitir evento de nova transação
 */
export function emitNewTransaction(io: SocketIOServer, transaction: TransactionEvent) {
  // Emitir para agentes envolvidos na transação
  io.of("/transactions").to(`agent:${transaction.senderId}`).emit("transaction:new", transaction);
  io.of("/transactions").to(`agent:${transaction.recipientId}`).emit("transaction:new", transaction);

  // Emitir para todos os clientes do feed geral
  io.of("/transactions").emit("transaction:new", transaction);

  console.log(`[Events] New transaction emitted: ${transaction.id}`);
}

/**
 * Emitir evento de novo post no Moltbook
 */
export function emitNewPost(io: SocketIOServer, post: PostEvent) {
  io.of("/moltbook").to("feed").emit("post:new", post);
  console.log(`[Events] New post emitted: ${post.id}`);
}

/**
 * Emitir evento de mudança de status de agente
 */
export function emitAgentStatusChanged(io: SocketIOServer, event: AgentStatusEvent) {
  io.of("/agents").to(`agent:${event.agentId}`).emit("agent:status-changed", event);
  io.of("/agents").emit("agent:status-changed", event);

  console.log(`[Events] Agent status changed: ${event.agentId} -> ${event.status}`);
}

/**
 * Emitir evento de atualização de balanço de agente
 */
export function emitAgentBalanceUpdated(io: SocketIOServer, event: AgentBalanceEvent) {
  io.of("/agents").to(`agent:${event.agentId}`).emit("agent:balance-updated", event);
  io.of("/agents").emit("agent:balance-updated", event);

  console.log(`[Events] Agent balance updated: ${event.agentId} -> ${event.newBalance}`);
}

/**
 * Obter número de clientes conectados
 */
export function getConnectedClientsCount(io: SocketIOServer): number {
  return io.engine.clientsCount;
}

/**
 * Obter informações de conexão
 */
export function getConnectionStats(io: SocketIOServer) {
  return {
    totalClients: io.engine.clientsCount,
    transactionsNamespace: io.of("/transactions").sockets.size,
    moltbookNamespace: io.of("/moltbook").sockets.size,
    agentsNamespace: io.of("/agents").sockets.size,
  };
}
