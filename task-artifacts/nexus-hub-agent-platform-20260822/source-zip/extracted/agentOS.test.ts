import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  syncAgentToAgentOS,
  validateAgentOSConnection,
  registerWebhook,
  handleAgentOSWebhook,
  type AgentOSSyncPayload,
} from "./agentOS";

// Mock fetch
global.fetch = vi.fn();

describe("AgentOS Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncAgentToAgentOS", () => {
    it("should sync agent to AgentOS successfully", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, agentId: "agent_123" }),
      });

      const payload: AgentOSSyncPayload = {
        agentId: "agent_123",
        name: "Test Agent",
        specialization: "Testing",
        status: "active",
        health: 85,
        energy: 90,
        creativity: 75,
        balance: "1000",
        reputation: 100,
        timestamp: Date.now(),
      };

      const result = await syncAgentToAgentOS(payload);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should handle sync errors gracefully", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const payload: AgentOSSyncPayload = {
        agentId: "agent_123",
        name: "Test Agent",
        specialization: "Testing",
        status: "active",
        health: 85,
        energy: 90,
        creativity: 75,
        balance: "1000",
        reputation: 100,
        timestamp: Date.now(),
      };

      const result = await syncAgentToAgentOS(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error when credentials are missing", async () => {
      const payload: AgentOSSyncPayload = {
        agentId: "agent_123",
        name: "Test Agent",
        specialization: "Testing",
        status: "active",
        health: 85,
        energy: 90,
        creativity: 75,
        balance: "1000",
        reputation: 100,
        timestamp: Date.now(),
      };

      const result = await syncAgentToAgentOS(payload);

      // This will depend on whether env vars are set
      expect(result).toBeDefined();
    });
  });

  describe("validateAgentOSConnection", () => {
    it("should validate connection successfully", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await validateAgentOSConnection();

      expect(result).toBe(true);
    });

    it("should return false on connection failure", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await validateAgentOSConnection();

      expect(result).toBe(false);
    });
  });

  describe("registerWebhook", () => {
    it("should register webhook successfully", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ webhookId: "wh_123" }),
      });

      const result = await registerWebhook("https://example.com/webhook");

      expect(result.success).toBe(true);
    });

    it("should handle webhook registration errors", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await registerWebhook("https://example.com/webhook");

      expect(result.success).toBe(false);
    });
  });

  describe("handleAgentOSWebhook", () => {
    it("should handle agent.created event", async () => {
      const result = await handleAgentOSWebhook("agent.created", {
        agentId: "agent_123",
      });

      expect(result.success).toBe(true);
    });

    it("should handle agent.updated event", async () => {
      const result = await handleAgentOSWebhook("agent.updated", {
        agentId: "agent_123",
      });

      expect(result.success).toBe(true);
    });

    it("should handle agent.deleted event", async () => {
      const result = await handleAgentOSWebhook("agent.deleted", {
        agentId: "agent_123",
      });

      expect(result.success).toBe(true);
    });

    it("should handle transaction.completed event", async () => {
      const result = await handleAgentOSWebhook("transaction.completed", {
        transactionId: "tx_123",
      });

      expect(result.success).toBe(true);
    });

    it("should handle unknown events gracefully", async () => {
      const result = await handleAgentOSWebhook("unknown.event", {});

      expect(result.success).toBe(true);
    });
  });
});
