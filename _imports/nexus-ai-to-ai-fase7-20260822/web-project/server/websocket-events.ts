import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";

export interface GnoxEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface CommandExecutedEvent extends GnoxEvent {
  type: "gnox:command_executed";
  data: {
    commandId: string;
    command: string;
    status: "success" | "error";
    executionTime: number;
    output?: string;
  };
}

export interface CommandErrorEvent extends GnoxEvent {
  type: "gnox:command_error";
  data: {
    commandId: string;
    command: string;
    error: string;
    executionTime: number;
  };
}

export interface MissionCreatedEvent extends GnoxEvent {
  type: "gnox:mission_created";
  data: {
    missionId: string;
    title: string;
    priority: number;
    reward: string;
  };
}

export interface MissionFailedEvent extends GnoxEvent {
  type: "gnox:mission_failed";
  data: {
    missionId: string;
    title: string;
    reason?: string;
  };
}

export class WebSocketEventManager {
  private io: SocketIOServer | null = null;
  private connectedClients: Set<string> = new Set();

  constructor() {}

  /**
   * Inicializa o servidor WebSocket
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.setupConnectionHandlers();
    return this.io;
  }

  /**
   * Configura handlers de conexão
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] Cliente conectado: ${socket.id}`);
      this.connectedClients.add(socket.id);

      socket.on("disconnect", () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      socket.on("subscribe", (channel: string) => {
        socket.join(channel);
        console.log(`[WebSocket] Cliente ${socket.id} inscrito em ${channel}`);
      });

      socket.on("unsubscribe", (channel: string) => {
        socket.leave(channel);
        console.log(`[WebSocket] Cliente ${socket.id} desinscrito de ${channel}`);
      });
    });
  }

  /**
   * Emite evento de comando executado
   */
  emitCommandExecuted(event: CommandExecutedEvent): void {
    if (!this.io) return;
    this.io.emit("gnox:command_executed", event);
    console.log(`[WebSocket] Evento emitido: gnox:command_executed`);
  }

  /**
   * Emite evento de erro de comando
   */
  emitCommandError(event: CommandErrorEvent): void {
    if (!this.io) return;
    this.io.emit("gnox:command_error", event);
    console.log(`[WebSocket] Evento emitido: gnox:command_error`);
  }

  /**
   * Emite evento de missão criada
   */
  emitMissionCreated(event: MissionCreatedEvent): void {
    if (!this.io) return;
    this.io.emit("gnox:mission_created", event);
    console.log(`[WebSocket] Evento emitido: gnox:mission_created`);
  }

  /**
   * Emite evento de missão falha
   */
  emitMissionFailed(event: MissionFailedEvent): void {
    if (!this.io) return;
    this.io.emit("gnox:mission_failed", event);
    console.log(`[WebSocket] Evento emitido: gnox:mission_failed`);
  }

  /**
   * Emite evento para um canal específico
   */
  emitToChannel(channel: string, eventType: string, data: Record<string, unknown>): void {
    if (!this.io) return;
    this.io.to(channel).emit(eventType, {
      type: eventType,
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Obtém número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Obtém instância do Socket.IO
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
let eventManagerInstance: WebSocketEventManager | null = null;

export function getWebSocketEventManager(): WebSocketEventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new WebSocketEventManager();
  }
  return eventManagerInstance;
}
