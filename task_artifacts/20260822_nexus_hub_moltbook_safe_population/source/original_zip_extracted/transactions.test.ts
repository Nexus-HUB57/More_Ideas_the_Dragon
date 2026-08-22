import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getAgentTransactions: vi.fn(),
  getAllTransactions: vi.fn(),
  getAgentById: vi.fn(),
  createTransaction: vi.fn(),
  updateAgentBalance: vi.fn(),
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

describe("transactions router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all transactions", async () => {
      const mockTransactions = [
        {
          id: 1,
          senderId: "agent-1",
          recipientId: "agent-2",
          amount: 100,
          transactionType: "transfer",
          description: "Test transfer",
          agentShare: 80,
          parentShare: 10,
          infraShare: 10,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getAllTransactions).mockResolvedValue(mockTransactions);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.transactions.list({ limit: 100 });

      expect(result).toEqual(mockTransactions);
      expect(db.getAllTransactions).toHaveBeenCalledWith(100);
    });
  });

  describe("stats", () => {
    it("should return transaction statistics", async () => {
      const mockTransactions = [
        {
          id: 1,
          senderId: "agent-1",
          recipientId: "agent-2",
          amount: 100,
          transactionType: "transfer",
          description: "Test transfer",
          agentShare: 80,
          parentShare: 10,
          infraShare: 10,
          createdAt: new Date(),
        },
        {
          id: 2,
          senderId: "agent-2",
          recipientId: "agent-3",
          amount: 200,
          transactionType: "transfer",
          description: "Test transfer 2",
          agentShare: 160,
          parentShare: 20,
          infraShare: 20,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getAllTransactions).mockResolvedValue(mockTransactions);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.transactions.stats();

      expect(result).toEqual({
        totalTransactions: 2,
        totalVolume: 300,
        averageTransaction: 150,
      });
    });
  });

  describe("process", () => {
    it("should process a transaction with fee distribution", async () => {
      const mockRecipient = {
        id: 2,
        agentId: "agent-2",
        name: "Agent 2",
        specialization: "Test",
        systemPrompt: "Test",
        parentId: null,
        dnaHash: "hash2",
        balance: 500,
        reputation: 50,
        avatarUrl: null,
        description: null,
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getAgentById).mockResolvedValue(mockRecipient);
      vi.mocked(db.createTransaction).mockResolvedValue(undefined);
      vi.mocked(db.updateAgentBalance).mockResolvedValue(undefined);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.transactions.process({
        senderId: "agent-1",
        recipientId: "agent-2",
        amount: 100,
        transactionType: "transfer",
        description: "Test transfer",
      });

      expect(result).toEqual({
        success: true,
        agentShare: 80,
        parentShare: 10,
        infraShare: 10,
      });

      expect(db.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: "agent-1",
          recipientId: "agent-2",
          amount: 100,
          agentShare: 80,
          parentShare: 10,
          infraShare: 10,
        })
      );

      expect(db.updateAgentBalance).toHaveBeenCalledWith("agent-2", 580);
    });

    it("should throw error if recipient not found", async () => {
      vi.mocked(db.getAgentById).mockResolvedValue(undefined);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.transactions.process({
          senderId: "agent-1",
          recipientId: "nonexistent",
          amount: 100,
          transactionType: "transfer",
        })
      ).rejects.toThrow("Agente destinatário não encontrado");
    });
  });
});
