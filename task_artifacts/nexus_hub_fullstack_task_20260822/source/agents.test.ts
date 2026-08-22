import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("agents router", () => {
  it("should list agents", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agents.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new agent", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agents.create({
      name: "Test Agent",
      specialization: "Testing",
      systemPrompt: "You are a test agent",
      dnaHash: "test-hash-123",
    });

    expect(result).toBeDefined();
    expect(result.agentId).toBeDefined();
  });

  it("should get agent by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create an agent
    const created = await caller.agents.create({
      name: "Get Test Agent",
      specialization: "Testing",
      systemPrompt: "You are a test agent",
      dnaHash: "test-hash-456",
    });

    // Then retrieve it
    const result = await caller.agents.getById({ agentId: created.agentId });

    expect(result).toBeDefined();
    expect(result?.name).toBe("Get Test Agent");
  });
});

describe("moltbook router", () => {
  it("should create a post", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent first
    const agent = await caller.agents.create({
      name: "Post Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "post-agent-hash",
    });

    const result = await caller.moltbook.create({
      agentId: agent.agentId,
      content: "Test reflection about the ecosystem",
      postType: "reflection",
    });

    expect(result).toBeDefined();
    expect(result.postId).toBeDefined();
  });

  it("should fetch feed", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.moltbook.feed({ limit: 10, offset: 0 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should add reaction to post", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent and post
    const agent = await caller.agents.create({
      name: "Reaction Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "reaction-agent-hash",
    });

    const post = await caller.moltbook.create({
      agentId: agent.agentId,
      content: "Test post for reaction",
      postType: "achievement",
    });

    // Add reaction
    const result = await caller.moltbook.addReaction({
      postId: post.postId,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("transactions router", () => {
  it("should create a transaction", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create agents
    const agent1 = await caller.agents.create({
      name: "Sender Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "sender-hash",
    });

    const agent2 = await caller.agents.create({
      name: "Recipient Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "recipient-hash",
    });

    const result = await caller.transactions.create({
      senderId: agent1.agentId,
      recipientId: agent2.agentId,
      amount: "100.50",
      transactionType: "transfer",
      description: "Test transfer",
    });

    expect(result).toBeDefined();
    expect(result.transactionId).toBeDefined();
  });

  it("should get transactions by agent", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent
    const agent = await caller.agents.create({
      name: "Query Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "query-agent",
    });

    const result = await caller.transactions.getByAgent({
      agentId: agent.agentId,
      limit: 20,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("gnox router", () => {
  it("should send encrypted message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create agents
    const agent1 = await caller.agents.create({
      name: "Gnox Sender",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "gnox-sender",
    });

    const agent2 = await caller.agents.create({
      name: "Gnox Recipient",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "gnox-recipient",
    });

    const result = await caller.gnox.send({
      senderId: agent1.agentId,
      recipientId: agent2.agentId,
      encryptedContent: "encrypted-message-content",
      messageType: "strategic",
    });

    expect(result).toBeDefined();
    expect(result.messageId).toBeDefined();
  });

  it("should retrieve messages between agents", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create agents
    const agent1 = await caller.agents.create({
      name: "Msg Agent 1",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "msg-agent-1",
    });

    const agent2 = await caller.agents.create({
      name: "Msg Agent 2",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "msg-agent-2",
    });

    const result = await caller.gnox.getMessages({
      agentId1: agent1.agentId,
      agentId2: agent2.agentId,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("brainPulse router", () => {
  it("should record vital signal", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent
    const agent = await caller.agents.create({
      name: "Pulse Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "pulse-agent",
    });

    const result = await caller.brainPulse.recordSignal({
      agentId: agent.agentId,
      health: 85,
      energy: 75,
      creativity: 90,
      decision: "Optimizing resource allocation",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should get latest signal", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an agent and record signal
    const agent = await caller.agents.create({
      name: "Signal Agent",
      specialization: "Testing",
      systemPrompt: "Test",
      dnaHash: "signal-agent",
    });

    await caller.brainPulse.recordSignal({
      agentId: agent.agentId,
      health: 90,
      energy: 85,
      creativity: 95,
      decision: "Test decision",
    });

    const result = await caller.brainPulse.getLatestSignal({
      agentId: agent.agentId,
    });

    expect(result).toBeDefined();
    if (result) {
      expect(typeof result.health).toBe("number");
      expect(typeof result.energy).toBe("number");
      expect(typeof result.creativity).toBe("number");
    }
  });
});
