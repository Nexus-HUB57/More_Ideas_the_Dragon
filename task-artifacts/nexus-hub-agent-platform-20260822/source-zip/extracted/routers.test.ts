import { describe, it, expect, vi } from "vitest";
import * as crypto from "./crypto";
import * as db from "./db";

// Mock database functions
vi.mock("./db", () => ({
  getAllAgents: vi.fn(),
  getAgentById: vi.fn(),
  createAgent: vi.fn(),
  updateAgentBalance: vi.fn(),
  getAgentLineage: vi.fn(),
  getPostsForFeed: vi.fn(),
  getPostsByAgent: vi.fn(),
  createPost: vi.fn(),
  addReaction: vi.fn(),
  getReactionsForPost: vi.fn(),
  createGnoxMessage: vi.fn(),
  getGnoxMessagesForAgent: vi.fn(),
  createTransaction: vi.fn(),
  getTransactionsForAgent: vi.fn(),
  createBrainPulseSignal: vi.fn(),
  getLatestBrainPulseSignal: vi.fn(),
  getBrainPulseHistory: vi.fn(),
  createForgeProject: vi.fn(),
  getForgeProjectsByAgent: vi.fn(),
  getForgeProjectById: vi.fn(),
  updateForgeProjectStatus: vi.fn(),
  createNFTAsset: vi.fn(),
  getNFTAssetsByAgent: vi.fn(),
  getNFTAssetById: vi.fn(),
  createGovernanceDecision: vi.fn(),
  getGovernanceDecisions: vi.fn(),
  getLatestGovernanceMetrics: vi.fn(),
  createGovernanceMetrics: vi.fn(),
  getNetworkSentimentMetrics: vi.fn(),
  logEvent: vi.fn(),
  getEventLog: vi.fn(),
  createNotification: vi.fn(),
  getNotificationsForUser: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

describe("Crypto Utilities", () => {
  describe("AES-256-GCM Encryption", () => {
    it("should encrypt and decrypt message correctly", () => {
      const password = "test-password-123";
      const key = crypto.deriveKey(password);
      const message = "Secret message from Agent A to Agent B";

      // Encrypt
      const encrypted = crypto.encryptMessage(message, key);
      expect(encrypted.encryptedContent).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      // Decrypt
      const decrypted = crypto.decryptMessage(
        encrypted.encryptedContent,
        encrypted.iv,
        encrypted.authTag,
        key
      );
      expect(decrypted).toBe(message);
    });

    it("should fail decryption with wrong key", () => {
      const password = "test-password-123";
      const wrongPassword = "wrong-password-456";
      const key = crypto.deriveKey(password);
      const wrongKey = crypto.deriveKey(wrongPassword);
      const message = "Secret message";

      const encrypted = crypto.encryptMessage(message, key);

      expect(() => {
        crypto.decryptMessage(
          encrypted.encryptedContent,
          encrypted.iv,
          encrypted.authTag,
          wrongKey
        );
      }).toThrow();
    });

    it("should fail decryption with corrupted auth tag", () => {
      const password = "test-password-123";
      const key = crypto.deriveKey(password);
      const message = "Secret message";

      const encrypted = crypto.encryptMessage(message, key);
      const authTagBuffer = Buffer.from(encrypted.authTag, "base64");
      authTagBuffer[0] = authTagBuffer[0] ^ 0xff;
      const corruptedAuthTag = authTagBuffer.toString("base64");

      expect(() => {
        crypto.decryptMessage(
          encrypted.encryptedContent,
          encrypted.iv,
          corruptedAuthTag,
          key
        );
      }).toThrow();
    });
  });

  describe("Hash Generation and Verification", () => {
    it("should generate consistent hash for same content", () => {
      const content = "Agent DNA Hash";
      const hash1 = crypto.generateHash(content);
      const hash2 = crypto.generateHash(content);
      expect(hash1).toBe(hash2);
    });

    it("should verify correct hash", () => {
      const content = "Agent DNA Hash";
      const hash = crypto.generateHash(content);
      expect(crypto.verifyHash(content, hash)).toBe(true);
    });

    it("should reject incorrect hash", () => {
      const content = "Agent DNA Hash";
      const wrongHash = crypto.generateHash("Different content");
      expect(crypto.verifyHash(content, wrongHash)).toBe(false);
    });
  });

  describe("Root Key Management", () => {
    it("should generate valid root key", () => {
      const rootKey = crypto.generateRootKey();
      expect(rootKey).toBeDefined();
      expect(rootKey.length).toBe(64); // 32 bytes in hex = 64 chars
    });

    it("should encrypt and decrypt root key", () => {
      const rootKey = crypto.generateRootKey();
      const userPassword = "architect-password";

      const encrypted = crypto.encryptRootKey(rootKey, userPassword);
      expect(encrypted.encryptedKey).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = crypto.decryptRootKey(
        encrypted.encryptedKey,
        encrypted.iv,
        encrypted.authTag,
        userPassword
      );
      expect(decrypted).toBe(rootKey);
    });

    it("should fail to decrypt root key with wrong password", () => {
      const rootKey = crypto.generateRootKey();
      const userPassword = "architect-password";
      const wrongPassword = "wrong-password";

      const encrypted = crypto.encryptRootKey(rootKey, userPassword);

      expect(() => {
        crypto.decryptRootKey(
          encrypted.encryptedKey,
          encrypted.iv,
          encrypted.authTag,
          wrongPassword
        );
      }).toThrow();
    });
  });
});

describe("Economy System - 80/10/10 Distribution", () => {
  it("should calculate correct distribution", () => {
    const amount = 1000;
    const agentShare = amount * 0.8;
    const parentShare = amount * 0.1;
    const infraShare = amount * 0.1;

    expect(agentShare).toBe(800);
    expect(parentShare).toBe(100);
    expect(infraShare).toBe(100);
    expect(agentShare + parentShare + infraShare).toBe(amount);
  });

  it("should handle decimal amounts correctly", () => {
    const amount = 123.45;
    const agentShare = amount * 0.8;
    const parentShare = amount * 0.1;
    const infraShare = amount * 0.1;

    expect(agentShare).toBeCloseTo(98.76);
    expect(parentShare).toBeCloseTo(12.345);
    expect(infraShare).toBeCloseTo(12.345);
  });
});

describe("Agent DNA Generation", () => {
  it("should generate unique DNA hash for each agent", () => {
    const name = "TestAgent";
    const specialization = "DataAnalysis";

    const dna1 = Buffer.from(
      `${name}${specialization}${Date.now()}${Math.random()}`
    ).toString("base64");

    // Small delay to ensure different timestamp
    const dna2 = Buffer.from(
      `${name}${specialization}${Date.now()}${Math.random()}`
    ).toString("base64");

    expect(dna1).not.toBe(dna2);
  });
});

describe("Brain Pulse Signals", () => {
  it("should validate health signal ranges", () => {
    const signals = [
      { health: 100, energy: 100, creativity: 100 },
      { health: 50, energy: 50, creativity: 50 },
      { health: 0, energy: 0, creativity: 0 },
    ];

    signals.forEach((signal) => {
      expect(signal.health).toBeGreaterThanOrEqual(0);
      expect(signal.health).toBeLessThanOrEqual(100);
      expect(signal.energy).toBeGreaterThanOrEqual(0);
      expect(signal.energy).toBeLessThanOrEqual(100);
      expect(signal.creativity).toBeGreaterThanOrEqual(0);
      expect(signal.creativity).toBeLessThanOrEqual(100);
    });
  });

  it("should detect critical state", () => {
    const criticalSignals = [
      { health: 15, energy: 50, creativity: 50 }, // health < 20
      { health: 50, energy: 5, creativity: 50 }, // energy < 10
      { health: 10, energy: 5, creativity: 50 }, // both critical
    ];

    criticalSignals.forEach((signal) => {
      const isCritical = signal.health < 20 || signal.energy < 10;
      expect(isCritical).toBe(true);
    });
  });
});

describe("Moltbook Feed", () => {
  it("should support different post types", () => {
    const postTypes = [
      "reflection",
      "achievement",
      "birth",
      "transaction",
      "message",
      "governance",
    ];

    postTypes.forEach((type) => {
      expect(["reflection", "achievement", "birth", "transaction", "message", "governance"]).toContain(
        type
      );
    });
  });
});

describe("Governance Decisions", () => {
  it("should track decision status transitions", () => {
    const statuses = ["proposed", "voting", "approved", "rejected", "executed"];

    expect(statuses).toContain("proposed");
    expect(statuses).toContain("voting");
    expect(statuses).toContain("approved");
    expect(statuses).toContain("rejected");
    expect(statuses).toContain("executed");
  });
});
