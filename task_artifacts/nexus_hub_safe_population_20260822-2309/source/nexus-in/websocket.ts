import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export interface WebSocketEvents {
  // Feed events
  "feed:new-post": { postId: number; startupId: number; content: string; createdAt: Date };
  "feed:like": { postId: number; likes: number };
  "feed:comment": { postId: number; comments: number };

  // Agent events
  "agent:status-update": { agentId: number; health: number; energy: number; creativity: number };
  "agent:reputation-change": { agentId: number; reputation: number };

  // Governance events
  "governance:proposal-created": { proposalId: number; title: string };
  "governance:vote-cast": { proposalId: number; votesYes: number; votesNo: number; votesAbstain: number };
  "governance:proposal-result": { proposalId: number; status: string };

  // Startup events
  "startup:ranking-update": { startupId: number; rank: number; score: number };
  "startup:metrics-update": { startupId: number; revenue: number; growth: number };

  // Treasury events
  "treasury:balance-update": { totalBalance: number; btcReserve: number; liquidityFund: number };
  "treasury:transaction": { transactionId: number; amount: number; type: string; status: string };

  // Market events
  "market:price-update": { asset: string; price: number; change24h: number };
  "market:sentiment-change": { asset: string; sentiment: string; confidence: number };
  "market:arbitrage-opportunity": { asset: string; profitPotential: number; confidence: number };

  // Soul Vault events
  "soul-vault:new-entry": { entryId: number; type: string; title: string };

  // Notification events
  "notification:new": { notificationId: number; title: string; type: string };
}

export class WebSocketManager {
  private io: SocketIOServer;
  private userSockets: Map<number, Set<string>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === "development" ? "*" : [process.env.FRONTEND_URL || ""],
        methods: ["GET", "POST"],
      },
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      // Extract user ID from query or headers
      const userId = socket.handshake.query.userId as string;
      if (!userId) {
        return next(new Error("Missing userId"));
      }
      socket.data.userId = parseInt(userId);
      next();
    });
  }

  private setupConnectionHandlers() {
    this.io.on("connection", (socket) => {
      const userId = socket.data.userId as number;

      // Track user socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user-specific room for targeted notifications
      socket.join(`user:${userId}`);

      console.log(`[WebSocket] User ${userId} connected (socket: ${socket.id})`);

      socket.on("disconnect", () => {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        console.log(`[WebSocket] User ${userId} disconnected (socket: ${socket.id})`);
      });
    });
  }

  // Broadcast events to all connected clients
  public broadcast<K extends keyof WebSocketEvents>(event: K, data: WebSocketEvents[K]) {
    this.io.emit(event, data);
  }

  // Send event to specific user
  public sendToUser<K extends keyof WebSocketEvents>(userId: number, event: K, data: WebSocketEvents[K]) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send event to multiple users
  public sendToUsers<K extends keyof WebSocketEvents>(userIds: number[], event: K, data: WebSocketEvents[K]) {
    userIds.forEach((userId) => {
      this.io.to(`user:${userId}`).emit(event, data);
    });
  }

  // Broadcast to all except sender
  public broadcastExcept<K extends keyof WebSocketEvents>(
    socketId: string,
    event: K,
    data: WebSocketEvents[K]
  ) {
    this.io.except(socketId).emit(event, data);
  }

  // Join user to a room
  public joinRoom(userId: number, room: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io.sockets.sockets.get(socketId)?.join(room);
      });
    }
  }

  // Leave user from a room
  public leaveRoom(userId: number, room: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io.sockets.sockets.get(socketId)?.leave(room);
      });
    }
  }

  // Broadcast to room
  public broadcastToRoom<K extends keyof WebSocketEvents>(room: string, event: K, data: WebSocketEvents[K]) {
    this.io.to(room).emit(event, data);
  }

  // Get IO instance for advanced usage
  public getIO(): SocketIOServer {
    return this.io;
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    throw new Error("WebSocket manager not initialized");
  }
  return wsManager;
}
