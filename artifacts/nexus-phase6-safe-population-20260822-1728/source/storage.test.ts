import { describe, it, expect, beforeAll } from "vitest";
import { storagePut, storageDelete, setCache, getCache } from "./storage";
import { getDb } from "./db";
import { agents, nftAssets, forgeProjects } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Nexus Storage System", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should simulate file upload and return storage metadata", async () => {
    const content = Buffer.from("test content");
    const result = await storagePut(content, "tests/file.txt", "text/plain");

    expect(result.url).toContain("https://storage.nexus-hub.im/tests/");
    expect(result.mimeType).toBe("text/plain");
    expect(result.size).toBe(content.length);
  });

  it("should handle local cache with TTL", async () => {
    const key = "test-cache-key";
    const data = { nexus: "sovereign" };
    
    setCache(key, data, 1); // 1 second TTL
    
    expect(getCache(key)).toEqual(data);
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(getCache(key)).toBeNull();
  });

  it("should update database records with storage URLs (simulated)", async () => {
    if (!db) return; // Skip if no DB

    const testAgentId = "AGENT-STORAGE-TEST";
    const avatarUrl = "https://storage.nexus-hub.im/avatars/test.png";

    // Update agent avatar
    await db.update(agents).set({ avatarUrl }).where(eq(agents.agentId, testAgentId));
    
    const agent = await db.select().from(agents).where(eq(agents.agentId, testAgentId)).limit(1);
    if (agent.length > 0) {
      expect(agent[0].avatarUrl).toBe(avatarUrl);
    }
  });
});
