import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { EventEmitter } from "events";

export class WebSocketManager extends EventEmitter {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private agentSubscriptions: Map<string, Set<string>> = new Map(); // agentId -> Set<socketIds>

  constructor(httpServer: HTTPServer) {
    super();
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // User authentication
      socket.on("auth", (userId: string) => {
        this.connectedUsers.set(userId, socket.id);
        socket.data.userId = userId;
        socket.emit("auth:success", { userId, socketId: socket.id });
        console.log(`[WebSocket] User authenticated: ${userId}`);
      });

      // Agent subscription
      socket.on("subscribe:agent", (agentId: string) => {
        if (!this.agentSubscriptions.has(agentId)) {
          this.agentSubscriptions.set(agentId, new Set());
        }
        this.agentSubscriptions.get(agentId)!.add(socket.id);
        socket.join(`agent:${agentId}`);
        console.log(`[WebSocket] Subscribed to agent: ${agentId}`);
      });

      socket.on("unsubscribe:agent", (agentId: string) => {
        this.agentSubscriptions.get(agentId)?.delete(socket.id);
        socket.leave(`agent:${agentId}`);
      });

      // Feed subscriptions
      socket.on("subscribe:feed", () => {
        socket.join("feed:global");
      });

      socket.on("unsubscribe:feed", () => {
        socket.leave("feed:global");
      });

      // Governance subscriptions
      socket.on("subscribe:governance", () => {
        socket.join("governance:proposals");
      });

      // Disconnect handler
      socket.on("disconnect", () => {
        if (socket.data.userId) {
          this.connectedUsers.delete(socket.data.userId);
        }
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast events
  broadcastFeedPost(post: any) {
    this.io.to("feed:global").emit("feed:newPost", post);
    this.emit("feed:newPost", post);
  }

  broadcastAgentUpdate(agentId: number, update: any) {
    this.io.to(`agent:${agentId}`).emit("agent:update", { agentId, ...update });
    this.emit("agent:update", { agentId, ...update });
  }

  broadcastProposalUpdate(proposalId: number, update: any) {
    this.io.to("governance:proposals").emit("proposal:update", { proposalId, ...update });
    this.emit("proposal:update", { proposalId, ...update });
  }

  broadcastVoteUpdate(proposalId: number, vote: any) {
    this.io.to("governance:proposals").emit("vote:recorded", { proposalId, ...vote });
    this.emit("vote:recorded", { proposalId, ...vote });
  }

  broadcastTransactionUpdate(transaction: any) {
    this.io.emit("transaction:update", transaction);
    this.emit("transaction:update", transaction);
  }

  broadcastMarketUpdate(asset: string, data: any) {
    this.io.emit("market:update", { asset, ...data });
    this.emit("market:update", { asset, ...data });
  }

  broadcastNotification(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit("notification:new", notification);
    }
  }

  broadcastConnectionUpdate(connection: any) {
    this.io.emit("connection:update", connection);
    this.emit("connection:update", connection);
  }

  getConnectedUsers() {
    return this.connectedUsers;
  }

  getIO() {
    return this.io;
  }

  close() {
    this.io.close();
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
