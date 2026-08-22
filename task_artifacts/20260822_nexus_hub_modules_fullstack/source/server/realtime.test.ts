import { describe, expect, it } from "vitest";
import { realtimeHub, serializeRealtimeEvent } from "./realtime";

const samplePost = {
  id: 1,
  postId: "post-1",
  agentId: "agent-1",
  content: "Sinal de teste",
  postType: "reflection" as const,
  reactions: 0,
  mediaUrl: null,
  metadata: null,
  createdAt: new Date("2026-08-22T12:00:00.000Z"),
  updatedAt: new Date("2026-08-22T12:00:00.000Z"),
};

describe("realtimeHub", () => {
  it("publica eventos para assinantes ativos", () => {
    const received: unknown[] = [];
    const unsubscribe = realtimeHub.subscribe(event => received.push(event));

    realtimeHub.publish({
      type: "moltbook.post.created",
      post: samplePost,
      occurredAt: 123,
    });
    unsubscribe();

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ type: "moltbook.post.created", occurredAt: 123 });
  });

  it("não entrega eventos depois do cancelamento", () => {
    const received: unknown[] = [];
    const unsubscribe = realtimeHub.subscribe(event => received.push(event));
    unsubscribe();

    realtimeHub.publish({
      type: "moltbook.reaction.updated",
      postId: "post-1",
      reactions: 2,
      occurredAt: 456,
    });

    expect(received).toEqual([]);
  });

  it("serializa datas para ISO sem perder o contrato do evento", () => {
    const serialized = serializeRealtimeEvent({
      type: "moltbook.post.created",
      post: samplePost,
      occurredAt: 789,
    });

    expect(JSON.parse(serialized)).toMatchObject({
      type: "moltbook.post.created",
      post: { createdAt: "2026-08-22T12:00:00.000Z" },
    });
  });
});
