import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  emitNewTransaction,
  emitNewPost,
  emitAgentStatusChanged,
  emitAgentBalanceUpdated,
  getConnectionStats,
} from "./websocket";
import type { SocketIOServer } from "socket.io";

// Mock Socket.io
const createMockIO = () => {
  const mockIO = {
    of: vi.fn(),
    engine: {
      clientsCount: 0,
    },
  } as unknown as SocketIOServer;

  const mockNamespace = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
    sockets: {
      size: 1,
    },
  };

  (mockIO.of as any).mockReturnValue(mockNamespace);

  return { mockIO, mockNamespace };
};

describe("WebSocket Events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("emitNewTransaction", () => {
    it("should emit transaction event to relevant namespaces", () => {
      const { mockIO, mockNamespace } = createMockIO();

      const transaction = {
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
      };

      emitNewTransaction(mockIO, transaction);

      expect(mockIO.of).toHaveBeenCalledWith("/transactions");
      expect(mockNamespace.to).toHaveBeenCalledWith("agent:agent-1");
      expect(mockNamespace.to).toHaveBeenCalledWith("agent:agent-2");
      expect(mockNamespace.emit).toHaveBeenCalledWith("transaction:new", transaction);
    });
  });

  describe("emitNewPost", () => {
    it("should emit post event to feed subscribers", () => {
      const { mockIO, mockNamespace } = createMockIO();

      const post = {
        id: 1,
        agentId: "agent-1",
        content: "Test post",
        postType: "reflection",
        reactions: 0,
        createdAt: new Date(),
      };

      emitNewPost(mockIO, post);

      expect(mockIO.of).toHaveBeenCalledWith("/moltbook");
      expect(mockNamespace.to).toHaveBeenCalledWith("feed");
      expect(mockNamespace.emit).toHaveBeenCalledWith("post:new", post);
    });
  });

  describe("emitAgentStatusChanged", () => {
    it("should emit agent status change event", () => {
      const { mockIO, mockNamespace } = createMockIO();

      const event = {
        agentId: "agent-1",
        status: "sleeping" as const,
        timestamp: new Date(),
      };

      emitAgentStatusChanged(mockIO, event);

      expect(mockIO.of).toHaveBeenCalledWith("/agents");
      expect(mockNamespace.to).toHaveBeenCalledWith("agent:agent-1");
      expect(mockNamespace.emit).toHaveBeenCalledWith("agent:status-changed", event);
    });
  });

  describe("emitAgentBalanceUpdated", () => {
    it("should emit agent balance update event", () => {
      const { mockIO, mockNamespace } = createMockIO();

      const event = {
        agentId: "agent-1",
        newBalance: 1500,
        timestamp: new Date(),
      };

      emitAgentBalanceUpdated(mockIO, event);

      expect(mockIO.of).toHaveBeenCalledWith("/agents");
      expect(mockNamespace.to).toHaveBeenCalledWith("agent:agent-1");
      expect(mockNamespace.emit).toHaveBeenCalledWith("agent:balance-updated", event);
    });
  });

  describe("getConnectionStats", () => {
    it("should return connection statistics", () => {
      const { mockIO } = createMockIO();
      (mockIO.engine as any).clientsCount = 5;

      const stats = getConnectionStats(mockIO);

      expect(stats).toEqual({
        totalClients: 5,
        transactionsNamespace: 1,
        moltbookNamespace: 1,
        agentsNamespace: 1,
      });
    });
  });
});
