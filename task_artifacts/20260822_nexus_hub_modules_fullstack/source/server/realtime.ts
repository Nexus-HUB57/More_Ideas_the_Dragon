import { EventEmitter } from "node:events";
import type { BrainPulseSignal, MoltbookPost, Notification, Transaction } from "../drizzle/schema";

export type RealtimeEvent =
  | {
      type: "moltbook.post.created";
      post: MoltbookPost;
      occurredAt: number;
    }
  | {
      type: "moltbook.reaction.updated";
      postId: string;
      reactions: number;
      occurredAt: number;
    }
  | {
      type: "brain.pulse.updated";
      signal: BrainPulseSignal;
      occurredAt: number;
    }
  | {
      type: "transaction.created";
      transaction: Transaction;
      occurredAt: number;
    }
  | {
      type: "notification.created";
      notification: Notification;
      occurredAt: number;
    };

type RealtimeListener = (event: RealtimeEvent) => void;

/**
 * Event hub process-local. Ele desacopla as mutações tRPC do transporte de
 * realtime e permite trocar WebSocket por outro adaptador sem duplicar regras.
 */
class RealtimeHub {
  private readonly emitter = new EventEmitter();

  publish(event: RealtimeEvent) {
    this.emitter.emit("event", event);
  }

  subscribe(listener: RealtimeListener) {
    this.emitter.on("event", listener);
    return () => this.emitter.off("event", listener);
  }
}

export const realtimeHub = new RealtimeHub();

export function serializeRealtimeEvent(event: RealtimeEvent) {
  return JSON.stringify(event, (_key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  });
}
