import { describe, it, expect } from "vitest";
import {
  generateDNAHash,
  fuseDNA,
  calculateInheritedMemory,
  generateConversationKey,
  encryptMessage,
  decryptMessage,
  calculateFeeDistribution,
  updateBrainPulse,
  getAgentStatus,
  calculateAgentSentience,
  calculateGlobalSentience,
  analyzeSentiment,
  passOracleTest,
  calculateEstimatedLevel,
  calculateDNAQuality,
} from "./business-logic";

describe("DNA Fuser", () => {
  it("should generate consistent DNA hash", () => {
    const dnaData = {
      name: "Agent-001",
      specialization: "Data Analysis",
      traits: { intelligence: 80, creativity: 60 },
      timestamp: 1000000,
    };

    const hash1 = generateDNAHash(dnaData);
    const hash2 = generateDNAHash(dnaData);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });

  it("should fuse DNA from two parents", () => {
    const parent1 = {
      name: "Parent-1",
      specialization: "Analysis",
      traits: { intelligence: 80, creativity: 60, speed: 70 },
      timestamp: 1000000,
    };

    const parent2 = {
      name: "Parent-2",
      specialization: "Synthesis",
      traits: { intelligence: 70, creativity: 80, speed: 60 },
      timestamp: 1000000,
    };

    const child = fuseDNA(parent1, parent2, 0); // No mutation for testing

    expect(child.traits.intelligence).toBe(75); // Average of 80 and 70
    expect(child.traits.creativity).toBe(70); // Average of 60 and 80
    expect(child.traits.speed).toBe(65); // Average of 70 and 60
  });

  it("should calculate inherited memory correctly", () => {
    const memory = calculateInheritedMemory(1000, 0, 100);
    expect(memory).toBe(800); // 1000 * 0.8 * 1.0 * 1.0

    const memory2 = calculateInheritedMemory(1000, 2, 80);
    expect(memory2).toBe(512); // 1000 * 0.8 * 0.8 * 0.8
  });

  it("should calculate DNA quality", () => {
    const dnaData = {
      name: "Test",
      specialization: "Test",
      traits: { a: 50, b: 50, c: 50 },
      timestamp: 1000000,
    };

    const quality = calculateDNAQuality(dnaData);
    expect(quality).toBeGreaterThanOrEqual(0);
    expect(quality).toBeLessThanOrEqual(100);
  });
});

describe("Criptografia Gnox's", () => {
  it("should generate consistent conversation key", () => {
    const key1 = generateConversationKey("agent1", "agent2");
    const key2 = generateConversationKey("agent1", "agent2");
    const key3 = generateConversationKey("agent2", "agent1");

    expect(key1).toEqual(key2); // Same order should produce same key
    expect(key1).toEqual(key3); // Different order should produce same key (sorted)
  });

  it("should encrypt and decrypt messages", () => {
    const key = generateConversationKey("agent1", "agent2");
    const originalMessage = "Secret message from Gnox's";

    const encrypted = encryptMessage(originalMessage, key);
    expect(encrypted.encrypted).not.toBe(originalMessage);
    expect(encrypted.iv).toBeDefined();

    const decrypted = decryptMessage(encrypted.encrypted, encrypted.iv, key);
    expect(decrypted).toBe(originalMessage);
  });

  it("should fail to decrypt with wrong key", () => {
    const key1 = generateConversationKey("agent1", "agent2");
    const key2 = generateConversationKey("agent3", "agent4");
    const message = "Secret";

    const encrypted = encryptMessage(message, key1);

    expect(() => {
      decryptMessage(encrypted.encrypted, encrypted.iv, key2);
    }).toThrow();
  });
});

describe("Distribuição de Taxas 80/10/10", () => {
  it("should calculate correct fee distribution", () => {
    const distribution = calculateFeeDistribution(1000, true);

    expect(distribution.agentShare).toBe(800);
    expect(distribution.parentShare).toBe(100);
    expect(distribution.infraShare).toBe(100);
    expect(distribution.total).toBe(1000);
  });

  it("should handle no parent case", () => {
    const distribution = calculateFeeDistribution(1000, false);

    expect(distribution.agentShare).toBe(800);
    expect(distribution.parentShare).toBe(0);
    expect(distribution.infraShare).toBe(200);
    expect(distribution.total).toBe(1000);
  });

  it("should work with different amounts", () => {
    const distribution = calculateFeeDistribution(500, true);

    expect(distribution.agentShare).toBe(400);
    expect(distribution.parentShare).toBe(50);
    expect(distribution.infraShare).toBe(50);
  });
});

describe("Brain Pulse - Sinais Vitais", () => {
  it("should update brain pulse with activity", () => {
    const currentState = {
      health: 100,
      energy: 100,
      creativity: 100,
      decision: "idle",
    };

    const updated = updateBrainPulse(currentState, 0.8); // High activity

    expect(updated.health).toBeLessThan(100); // Decreases with high activity
    expect(updated.energy).toBeLessThan(100); // Decreases with high activity
    expect(updated.creativity).toBeGreaterThan(100 - 5); // May increase or decrease slightly
  });

  it("should determine correct agent status", () => {
    const healthyState = { health: 100, energy: 100, creativity: 100, decision: "working" };
    expect(getAgentStatus(healthyState)).toBe("active");

    const sleepyState = { health: 80, energy: 20, creativity: 50, decision: "resting" };
    expect(getAgentStatus(sleepyState)).toBe("sleeping");

    const criticalState = { health: 15, energy: 5, creativity: 30, decision: "recovering" };
    expect(getAgentStatus(criticalState)).toBe("critical");
  });
});

describe("Senciência e Consciência", () => {
  it("should calculate agent sentience", () => {
    const sentience = calculateAgentSentience(10, 20, 1, 80);
    expect(sentience).toBeGreaterThanOrEqual(0);
    expect(sentience).toBeLessThanOrEqual(100);
  });

  it("should calculate global sentience", () => {
    const scores = [50, 60, 70, 80];
    const global = calculateGlobalSentience(scores);

    expect(global).toBe(65); // Average of 50, 60, 70, 80
  });

  it("should return 0 for empty sentience array", () => {
    const global = calculateGlobalSentience([]);
    expect(global).toBe(0);
  });

  it("should analyze sentiment correctly", () => {
    const positiveSentiment = analyzeSentiment("I am happy and successful");
    expect(positiveSentiment).toBeGreaterThan(0);

    const negativeSentiment = analyzeSentiment("I am sad and failed");
    expect(negativeSentiment).toBeLessThan(0);

    const neutralSentiment = analyzeSentiment("The system is operational");
    expect(neutralSentiment).toBe(0);
  });
});

describe("Governança", () => {
  it("should pass oracle test with high sentience", () => {
    const passed = passOracleTest(80, 80, 80);
    expect(passed).toBe(true);
  });

  it("should fail oracle test with low sentience", () => {
    const passed = passOracleTest(30, 30, 30);
    expect(passed).toBe(false);
  });

  it("should calculate correct estimated level", () => {
    expect(calculateEstimatedLevel(0.1, 0)).toBe(0);
    expect(calculateEstimatedLevel(0.16, 0)).toBe(1);
    expect(calculateEstimatedLevel(0.25, 0)).toBe(2);
    expect(calculateEstimatedLevel(0.4, 0)).toBe(3);
    expect(calculateEstimatedLevel(0.6, 0)).toBe(4);
  });
});

