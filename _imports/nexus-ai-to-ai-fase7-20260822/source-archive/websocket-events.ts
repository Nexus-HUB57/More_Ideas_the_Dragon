import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

/**
 * WebSocket Event Types for Terminal Gnox
 * All events follow the pattern: gnox:event_name
 */
export enum GnoxEventType {
  COMMAND_EXECUTED = "gnox:command_executed",
  COMMAND_FAILED = "gnox:command_failed",
  MISSION_CREATED = "gnox:mission_created",
  MISSION_UPDATED = "gnox:mission_updated",
  MISSION_COMPLETED = "gnox:mission_completed",
  AGENT_REPORT = "gnox:agent_report",
  REWARD_DISTRIBUTED = "gnox:reward_distributed",
  ORCHESTRATION_STARTED = "gnox:orchestration_started",
  ORCHESTRATION_COMPLETED = "gnox:orchestration_completed",
  SYSTEM_STATUS = "gnox:system_status",
  TERMINAL_CONNECTED = "gnox:terminal_connected",
  TERMINAL_DISCONNECTED = "gnox:terminal_disconnected",
}

export interface GnoxEventPayload {
  id: string;
  timestamp: Date;
  userId?: number;
  data: Record<string, unknown>;
  metadata?: {
    source?: string;
    priority?: "low" | "medium" | "high";
    tags?: string[];
  };
}

export interface CommandExecutedEvent extends GnoxEventPayload {
  data: {
    commandId: string;
    command: string;
    status: "success" | "error" | "pending";
    result?: string;
    duration: number;
  };
}

export interface MissionUpdatedEvent extends GnoxEventPayload {
  data: {
    missionId: number;
    status: string;
    progress: number;
    agentId?: number;
  };
}

export interface RewardDistributedEvent extends GnoxEventPayload {
  data: {
    transactionId: number;
    agentId: number;
    amount: number;
    reason: string;
  };
}

export interface OrchestrationEvent extends GnoxEventPayload {
  data: {
    orchestrationId: string;
    missionIds: number[];
    agentIds: number[];
    status: string;
  };
}

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.emit(GnoxEventType.TERMINAL_CONNECTED, {
      id: socket.id,
      timestamp: new Date(),
      data: {
        message: "Connected to Gnox Terminal WebSocket",
        clientId: socket.id,
      },
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      broadcastEvent(GnoxEventType.TERMINAL_DISCONNECTED, {
        id: socket.id,
        timestamp: new Date(),
        data: {
          clientId: socket.id,
        },
      });
    });

    socket.on("error", (error) => {
      console.error(`[WebSocket] Error from ${socket.id}:`, error);
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast event to all connected clients
 */
export function broadcastEvent(
  eventType: GnoxEventType | string,
  payload: GnoxEventPayload
): void {
  if (!io) {
    console.warn("[WebSocket] Server not initialized");
    return;
  }

  console.log(`[WebSocket] Broadcasting event: ${eventType}`);
  io.emit(eventType, payload);
}

/**
 * Send event to specific user
 */
export function sendEventToUser(
  userId: number,
  eventType: GnoxEventType | string,
  payload: GnoxEventPayload
): void {
  if (!io) {
    console.warn("[WebSocket] Server not initialized");
    return;
  }

  // Find sockets connected by this user and send to them
  io.emit(`user:${userId}:${eventType}`, payload);
}

/**
 * Send event to specific room
 */
export function sendEventToRoom(
  roomName: string,
  eventType: GnoxEventType | string,
  payload: GnoxEventPayload
): void {
  if (!io) {
    console.warn("[WebSocket] Server not initialized");
    return;
  }

  io.to(roomName).emit(eventType, payload);
}

/**
 * Emit command executed event
 */
export function emitCommandExecuted(
  commandId: string,
  command: string,
  status: "success" | "error" | "pending",
  result: string | undefined,
  duration: number,
  userId?: number
): void {
  const payload: CommandExecutedEvent = {
    id: commandId,
    timestamp: new Date(),
    userId,
    data: {
      commandId,
      command,
      status,
      result,
      duration,
    },
    metadata: {
      source: "gnox-terminal",
      priority: status === "error" ? "high" : "medium",
      tags: ["command", "execution"],
    },
  };

  broadcastEvent(GnoxEventType.COMMAND_EXECUTED, payload);
}

/**
 * Emit mission updated event
 */
export function emitMissionUpdated(
  missionId: number,
  status: string,
  progress: number,
  agentId?: number,
  userId?: number
): void {
  const payload: MissionUpdatedEvent = {
    id: `mission-${missionId}-${Date.now()}`,
    timestamp: new Date(),
    userId,
    data: {
      missionId,
      status,
      progress,
      agentId,
    },
    metadata: {
      source: "mission-orchestrator",
      priority: "high",
      tags: ["mission", "update"],
    },
  };

  broadcastEvent(GnoxEventType.MISSION_UPDATED, payload);
}

/**
 * Emit reward distributed event
 */
export function emitRewardDistributed(
  transactionId: number,
  agentId: number,
  amount: number,
  reason: string,
  userId?: number
): void {
  const payload: RewardDistributedEvent = {
    id: `reward-${transactionId}-${Date.now()}`,
    timestamp: new Date(),
    userId,
    data: {
      transactionId,
      agentId,
      amount,
      reason,
    },
    metadata: {
      source: "reward-distribution",
      priority: "high",
      tags: ["reward", "distribution"],
    },
  };

  broadcastEvent(GnoxEventType.REWARD_DISTRIBUTED, payload);
}

/**
 * Emit orchestration event
 */
export function emitOrchestrationEvent(
  orchestrationId: string,
  missionIds: number[],
  agentIds: number[],
  status: string,
  userId?: number
): void {
  const payload: OrchestrationEvent = {
    id: orchestrationId,
    timestamp: new Date(),
    userId,
    data: {
      orchestrationId,
      missionIds,
      agentIds,
      status,
    },
    metadata: {
      source: "orchestrator",
      priority: "high",
      tags: ["orchestration", status],
    },
  };

  broadcastEvent(GnoxEventType.ORCHESTRATION_STARTED, payload);
}
