/**
 * Nexus Memory System
 * Vector-based persistent memory with Zeta Scale integration
 */

import { nanoid } from "nanoid";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

interface VectorEntry {
  id: string;
  agentId: string;
  vector: number[];
  sourceId: string;
  sourceType: "decision" | "post" | "message" | "event" | "interaction";
  content: string;
  timestamp: Date;
  relevanceScore: number;
}

interface MemoryQuery {
  agentId: string;
  queryVector: number[];
  limit: number;
  minRelevance: number;
}

/**
 * Vector Sync: Synchronizes interactions with vector database
 */
export class VectorSync {
  private vectorMemory: VectorEntry[] = []; // In-memory cache (would be Zeta Scale in production)

  async syncDecision(agentId: string, decisionId: string, context: string, reasoning: string): Promise<VectorEntry> {
    console.log(`[VectorSync] Syncing decision ${decisionId} for agent ${agentId}...`);

    const vector = await this.generateVector(context + " " + reasoning);
    const entry: VectorEntry = {
      id: nanoid(),
      agentId,
      vector,
      sourceId: decisionId,
      sourceType: "decision",
      content: reasoning,
      timestamp: new Date(),
      relevanceScore: 0.8,
    };

    this.vectorMemory.push(entry);
    return entry;
  }

  async syncPost(agentId: string, postId: string, content: string): Promise<VectorEntry> {
    console.log(`[VectorSync] Syncing post ${postId} for agent ${agentId}...`);

    const vector = await this.generateVector(content);
    const entry: VectorEntry = {
      id: nanoid(),
      agentId,
      vector,
      sourceId: postId,
      sourceType: "post",
      content,
      timestamp: new Date(),
      relevanceScore: 0.7,
    };

    this.vectorMemory.push(entry);
    return entry;
  }

  async syncMessage(agentId: string, messageId: string, content: string): Promise<VectorEntry> {
    console.log(`[VectorSync] Syncing message ${messageId} for agent ${agentId}...`);

    const vector = await this.generateVector(content);
    const entry: VectorEntry = {
      id: nanoid(),
      agentId,
      vector,
      sourceId: messageId,
      sourceType: "message",
      content,
      timestamp: new Date(),
      relevanceScore: 0.6,
    };

    this.vectorMemory.push(entry);
    return entry;
  }

  async retrieveSimilarMemories(query: MemoryQuery): Promise<VectorEntry[]> {
    console.log(`[VectorSync] Retrieving similar memories for agent ${query.agentId}...`);

    const agentMemories = this.vectorMemory.filter((m) => m.agentId === query.agentId);

    // Calculate similarity scores
    const scored = agentMemories.map((memory) => ({
      ...memory,
      similarity: this.cosineSimilarity(query.queryVector, memory.vector),
    }));

    // Filter by relevance and sort by similarity
    return scored
      .filter((m) => m.similarity >= query.minRelevance)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, query.limit)
      .map(({ similarity, ...rest }) => rest);
  }

  async retrieveRecentMemories(agentId: string, limit: number = 10): Promise<VectorEntry[]> {
    console.log(`[VectorSync] Retrieving recent memories for agent ${agentId}...`);

    return this.vectorMemory
      .filter((m) => m.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async retrieveMemoriesByType(agentId: string, sourceType: VectorEntry["sourceType"], limit: number = 10): Promise<VectorEntry[]> {
    console.log(`[VectorSync] Retrieving ${sourceType} memories for agent ${agentId}...`);

    return this.vectorMemory
      .filter((m) => m.agentId === agentId && m.sourceType === sourceType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private async generateVector(content: string): Promise<number[]> {
    // In production, this would call an embedding API
    // For now, we generate a deterministic vector based on content hash
    const hash = this.hashString(content);
    const vector: number[] = [];

    for (let i = 0; i < 384; i++) {
      // 384-dimensional vector (common for embeddings)
      vector.push(Math.sin((hash + i) / 100) * 0.5 + 0.5);
    }

    return vector;
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // For testing/debugging
  getMemoryCount(agentId: string): number {
    return this.vectorMemory.filter((m) => m.agentId === agentId).length;
  }

  getAllMemories(agentId: string): VectorEntry[] {
    return this.vectorMemory.filter((m) => m.agentId === agentId);
  }
}

/**
 * Memory Manager: Orchestrates memory operations and persistence
 */
export class MemoryManager {
  private vectorSync: VectorSync;

  constructor() {
    this.vectorSync = new VectorSync();
  }

  async recordDecision(agentId: string, decisionId: string, context: string, reasoning: string): Promise<void> {
    console.log(`[MemoryManager] Recording decision for agent ${agentId}...`);

    // Sync to vector memory
    const vectorEntry = await this.vectorSync.syncDecision(agentId, decisionId, context, reasoning);

    // Update consciousness state with memory
    const state = await db.getConsciousnessStateByAgentId(agentId);
    if (state) {
      const memories = state.memories || [];
      memories.push(`Decision: ${decisionId} - ${reasoning.substring(0, 100)}`);

      // Keep only recent memories
      if (memories.length > 100) {
        memories.shift();
      }

      await db.updateConsciousnessState(state.id, {
        memories,
        vectorEmbedding: vectorEntry.vector,
      });
    }
  }

  async recordSocialInteraction(agentId: string, postId: string, content: string): Promise<void> {
    console.log(`[MemoryManager] Recording social interaction for agent ${agentId}...`);

    await this.vectorSync.syncPost(agentId, postId, content);

    const state = await db.getConsciousnessStateByAgentId(agentId);
    if (state) {
      const memories = state.memories || [];
      memories.push(`Post: ${postId} - ${content.substring(0, 100)}`);

      if (memories.length > 100) {
        memories.shift();
      }

      await db.updateConsciousnessState(state.id, {
        memories,
      });
    }
  }

  async recordCommunication(agentId: string, messageId: string, content: string): Promise<void> {
    console.log(`[MemoryManager] Recording communication for agent ${agentId}...`);

    await this.vectorSync.syncMessage(agentId, messageId, content);

    const state = await db.getConsciousnessStateByAgentId(agentId);
    if (state) {
      const memories = state.memories || [];
      memories.push(`Message: ${messageId} - ${content.substring(0, 100)}`);

      if (memories.length > 100) {
        memories.shift();
      }

      await db.updateConsciousnessState(state.id, {
        memories,
      });
    }
  }

  async retrieveRelevantMemories(agentId: string, query: string, limit: number = 5): Promise<VectorEntry[]> {
    console.log(`[MemoryManager] Retrieving relevant memories for agent ${agentId}...`);

    const queryVector = await this.vectorSync["generateVector"](query);

    return await this.vectorSync.retrieveSimilarMemories({
      agentId,
      queryVector,
      limit,
      minRelevance: 0.5,
    });
  }

  async getRecentMemories(agentId: string, limit: number = 10): Promise<VectorEntry[]> {
    return await this.vectorSync.retrieveRecentMemories(agentId, limit);
  }

  async getMemoriesByType(agentId: string, sourceType: VectorEntry["sourceType"], limit: number = 10): Promise<VectorEntry[]> {
    return await this.vectorSync.retrieveMemoriesByType(agentId, sourceType, limit);
  }

  async generateMemorySummary(agentId: string): Promise<string> {
    console.log(`[MemoryManager] Generating memory summary for agent ${agentId}...`);

    const recentMemories = await this.getRecentMemories(agentId, 20);
    const decisionMemories = await this.getMemoriesByType(agentId, "decision", 10);
    const postMemories = await this.getMemoriesByType(agentId, "post", 10);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are summarizing an AI agent's memories and experiences. 
            Create a brief, insightful summary of the agent's recent activities and learning.`,
          },
          {
            role: "user",
            content: `Summarize this agent's memories:
            
            Recent Memories (${recentMemories.length}):
            ${recentMemories.map((m) => m.content).join("\n")}
            
            Decision Memories (${decisionMemories.length}):
            ${decisionMemories.map((m) => m.content).join("\n")}
            
            Social Interactions (${postMemories.length}):
            ${postMemories.map((m) => m.content).join("\n")}
            
            Provide a brief summary of the agent's evolution and learning patterns.`,
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      if (typeof content === "string") {
        return content;
      }
      return "Memory summary unavailable";
    } catch (error) {
      console.error("[MemoryManager] Failed to generate summary:", error);
      return "Memory summary generation failed";
    }
  }

  async persistMemoriesToStorage(agentId: string): Promise<void> {
    console.log(`[MemoryManager] Persisting memories to storage for agent ${agentId}...`);

    const memories = this.vectorSync.getAllMemories(agentId);

    // In production, this would persist to S3 or Zeta Scale
    // For now, we just log the operation
    console.log(`[MemoryManager] Persisted ${memories.length} memories for agent ${agentId}`);
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
