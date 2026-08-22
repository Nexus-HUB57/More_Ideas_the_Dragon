import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getAllAgents: vi.fn(),
  getAgentById: vi.fn(),
  createAgent: vi.fn(),
  updateAgentStatus: vi.fn(),
  getMoltbookFeed: vi.fn(),
}));

function createAuthContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
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
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("agents router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all agents", async () => {
      const mockAgents = [
        {
          id: 1,
          agentId: "agent-1",
          name: "Agent 1",
          specialization: "Data Analysis",
          systemPrompt: "You are a data analyst",
          parentId: null,
          dnaHash: "hash1",
          balance: 1000,
          reputation: 100,
          avatarUrl: null,
          description: "Test agent",
          status: "active" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllAgents).mockResolvedValue(mockAgents);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.list();

      expect(result).toEqual(mockAgents);
      expect(db.getAllAgents).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return agent by id", async () => {
      const mockAgent = {
        id: 1,
        agentId: "agent-1",
        name: "Agent 1",
        specialization: "Data Analysis",
        systemPrompt: "You are a data analyst",
        parentId: null,
        dnaHash: "hash1",
        balance: 1000,
        reputation: 100,
        avatarUrl: null,
        description: "Test agent",
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getAgentById).mockResolvedValue(mockAgent);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.getById({ agentId: "agent-1" });

      expect(result).toEqual(mockAgent);
      expect(db.getAgentById).toHaveBeenCalledWith("agent-1");
    });

    it("should return undefined if agent not found", async () => {
      vi.mocked(db.getAgentById).mockResolvedValue(undefined);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.getById({ agentId: "nonexistent" });

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should create a new agent", async () => {
      vi.mocked(db.createAgent).mockResolvedValue(undefined);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.create({
        agentId: "agent-new",
        name: "New Agent",
        specialization: "Machine Learning",
        systemPrompt: "You are an ML expert",
        dnaHash: "hash-new",
        balance: 500,
      });

      expect(result).toEqual({ success: true, agentId: "agent-new" });
      expect(db.createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: "agent-new",
          name: "New Agent",
          specialization: "Machine Learning",
        })
      );
    });
  });

  describe("updateStatus", () => {
    it("should update agent status", async () => {
      vi.mocked(db.updateAgentStatus).mockResolvedValue(undefined);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.updateStatus({
        agentId: "agent-1",
        status: "sleeping",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateAgentStatus).toHaveBeenCalledWith("agent-1", "sleeping");
    });
  });

  describe("activities", () => {
    it("should return recent activities", async () => {
      const mockPosts = [
        {
          id: 1,
          agentId: "agent-1",
          content: "Test post",
          postType: "reflection",
          reactions: 0,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getMoltbookFeed).mockResolvedValue(mockPosts);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.activities({ limit: 5 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          title: "Agent Activity",
          description: "Test post",
        })
      );
    });
  });
});
