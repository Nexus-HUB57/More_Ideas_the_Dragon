import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  moltbookPosts,
  postReactions,
  gnoxMessages,
  transactions,
  brainPulseSignals,
  genealogy,
  forgeProjects,
  nftAssets,
  notifications,
  vectorEmbeddings,
  sentimentAnalysis,
  governanceDecisions,
  eventLog,
  governanceMetrics,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AGENT QUERIES ============

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.agentId, agentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents);
}

export async function createAgent(agent: typeof agents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(agent);
  return result;
}

export async function updateAgentBalance(agentId: string, amount: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const agent = await getAgentById(agentId);
  if (!agent) throw new Error("Agent not found");

  const currentBalance = agent.balance ? parseFloat(agent.balance.toString()) : 0;
  const newBalance = (currentBalance + parseFloat(amount)).toString();

  return db
    .update(agents)
    .set({ balance: newBalance as any })
    .where(eq(agents.agentId, agentId));
}

// ============ MOLTBOOK QUERIES ============

export async function createPost(post: typeof moltbookPosts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(moltbookPosts).values(post);
  return result;
}

export async function getPostsForFeed(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostsByAgent(agentId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function addReaction(reaction: typeof postReactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(postReactions).values(reaction);
}

export async function getReactionsForPost(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(postReactions)
    .where(eq(postReactions.postId, postId));
}

// ============ GNOX MESSAGES QUERIES ============

export async function createGnoxMessage(message: typeof gnoxMessages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(gnoxMessages).values(message);
}

export async function getGnoxMessagesForAgent(agentId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(gnoxMessages)
    .where(eq(gnoxMessages.recipientId, agentId))
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

// ============ TRANSACTION QUERIES ============

export async function createTransaction(transaction: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values(transaction);
}

export async function getTransactionsForAgent(agentId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.senderId, agentId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ============ BRAIN PULSE QUERIES ============

export async function createBrainPulseSignal(signal: typeof brainPulseSignals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(brainPulseSignals).values(signal);
}

export async function getLatestBrainPulseSignal(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBrainPulseHistory(agentId: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(limit);
}

// ============ GENEALOGY QUERIES ============

export async function createGenealogy(genealogyData: typeof genealogy.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(genealogy).values(genealogyData);
}

export async function getAgentLineage(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(genealogy)
    .where(eq(genealogy.agentId, agentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SENTIMENT ANALYSIS QUERIES ============

export async function createSentimentAnalysis(analysis: typeof sentimentAnalysis.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(sentimentAnalysis).values(analysis);
}

export async function getNetworkSentimentMetrics(hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return null;

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const result = await db
    .select()
    .from(sentimentAnalysis)
    .where(gte(sentimentAnalysis.analysisTimestamp, cutoffTime));

  if (result.length === 0) return null;

  const avgSentiment = Math.round(
    result.reduce((sum, r) => sum + r.sentimentScore, 0) / result.length
  );
  const anomalyCount = result.filter((r) => r.anomalyDetected).length;

  return {
    avgSentiment,
    anomalyCount,
    totalAnalyzed: result.length,
  };
}

// ============ GOVERNANCE QUERIES ============

export async function createGovernanceDecision(decision: typeof governanceDecisions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(governanceDecisions).values(decision);
}

export async function getGovernanceDecisions(status?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db
      .select()
      .from(governanceDecisions)
      .where(eq(governanceDecisions.status, status as any))
      .orderBy(desc(governanceDecisions.createdAt))
      .limit(limit);
  }

  return db
    .select()
    .from(governanceDecisions)
    .orderBy(desc(governanceDecisions.createdAt))
    .limit(limit);
}

// ============ EVENT LOG QUERIES ============

export async function logEvent(event: typeof eventLog.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(eventLog).values(event);
}

export async function getEventLog(agentId?: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  if (agentId) {
    return db
      .select()
      .from(eventLog)
      .where(eq(eventLog.agentId, agentId))
      .orderBy(desc(eventLog.createdAt))
      .limit(limit);
  }

  return db
    .select()
    .from(eventLog)
    .orderBy(desc(eventLog.createdAt))
    .limit(limit);
}

// ============ GOVERNANCE METRICS QUERIES ============

export async function createGovernanceMetrics(metrics: typeof governanceMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(governanceMetrics).values(metrics);
}

export async function getLatestGovernanceMetrics() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(governanceMetrics)
    .orderBy(desc(governanceMetrics.timestamp))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ VECTOR EMBEDDINGS QUERIES ============

export async function createVectorEmbedding(embedding: typeof vectorEmbeddings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(vectorEmbeddings).values(embedding);
}

export async function getAgentEmbeddings(agentId: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vectorEmbeddings)
    .where(eq(vectorEmbeddings.agentId, agentId))
    .orderBy(desc(vectorEmbeddings.createdAt))
    .limit(limit);
}
