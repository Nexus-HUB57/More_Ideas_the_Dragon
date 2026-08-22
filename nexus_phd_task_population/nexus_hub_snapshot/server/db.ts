import { eq, desc, and, or, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function upsertUser(user: schema.InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: schema.InsertUser = {
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
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(schema.users).values(values).onDuplicateKeyUpdate({
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

  const result = await db.select().from(schema.users).where(eq(schema.users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AGENTS ============
export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.agents).orderBy(desc(schema.agents.createdAt));
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.agents).where(eq(schema.agents.agentId, agentId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createAgent(agent: schema.InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.agents).values(agent);
  return agent.agentId;
}

export async function updateAgentBalance(agentId: string, amount: string | number) {
  const db = await getDb();
  if (!db) return;
  const agent = await getAgentById(agentId);
  if (!agent) return;
  
  const newBalance = parseFloat(agent.balance.toString()) + parseFloat(amount.toString());
  await db.update(schema.agents).set({ balance: newBalance.toString() as any }).where(eq(schema.agents.agentId, agentId));
}

export async function getAgentLineage(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.genealogy).where(eq(schema.genealogy.agentId, agentId));
}

// ============ MOLTBOOK ============
export async function getPostsForFeed(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.moltbookPosts).orderBy(desc(schema.moltbookPosts.createdAt)).limit(limit).offset(offset);
}

export async function getPostsByAgent(agentId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.moltbookPosts).where(eq(schema.moltbookPosts.agentId, agentId)).orderBy(desc(schema.moltbookPosts.createdAt)).limit(limit);
}

export async function createPost(post: schema.InsertMoltbookPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schema.moltbookPosts).values(post);
  return result[0];
}

export async function addReaction(reaction: schema.InsertPostReaction) {
  const db = await getDb();
  if (!db) return;
  
  // Insert reaction
  await db.insert(schema.postReactions).values(reaction);
  
  // Update post reaction count
  const post = await db.select().from(schema.moltbookPosts).where(eq(schema.moltbookPosts.id, reaction.postId)).limit(1);
  if (post.length > 0) {
    const newCount = post[0].reactionCount + 1;
    await db.update(schema.moltbookPosts).set({ reactionCount: newCount }).where(eq(schema.moltbookPosts.id, reaction.postId));
  }
}

export async function getReactionsForPost(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.postReactions).where(eq(schema.postReactions.postId, postId));
}

// ============ GNOX MESSAGES ============
export async function createGnoxMessage(message: schema.InsertGnoxMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.gnoxMessages).values(message);
}

export async function getGnoxMessagesForAgent(agentId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.gnoxMessages).where(
    or(
      eq(schema.gnoxMessages.senderId, agentId),
      eq(schema.gnoxMessages.recipientId, agentId)
    )
  ).orderBy(desc(schema.gnoxMessages.createdAt)).limit(limit);
}

// ============ TRANSACTIONS ============
export async function createTransaction(transaction: schema.InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.transactions).values(transaction);
}

export async function getTransactionsForAgent(agentId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.transactions).where(
    or(
      eq(schema.transactions.senderId, agentId),
      eq(schema.transactions.recipientId, agentId)
    )
  ).orderBy(desc(schema.transactions.createdAt)).limit(limit);
}

// ============ BRAIN PULSE ============
export async function createBrainPulseSignal(signal: schema.InsertBrainPulseSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.brainPulseSignals).values(signal);
}

export async function getLatestBrainPulseSignal(agentId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.brainPulseSignals).where(eq(schema.brainPulseSignals.agentId, agentId)).orderBy(desc(schema.brainPulseSignals.createdAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getBrainPulseHistory(agentId: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.brainPulseSignals).where(eq(schema.brainPulseSignals.agentId, agentId)).orderBy(desc(schema.brainPulseSignals.createdAt)).limit(limit);
}

// ============ FORGE PROJECTS ============
export async function createForgeProject(project: schema.InsertForgeProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.forgeProjects).values(project);
}

export async function getForgeProjectsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.forgeProjects).where(eq(schema.forgeProjects.agentId, agentId)).orderBy(desc(schema.forgeProjects.createdAt));
}

export async function getForgeProjectById(projectId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.forgeProjects).where(eq(schema.forgeProjects.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateForgeProjectStatus(projectId: string, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(schema.forgeProjects).set({ status: status as any }).where(eq(schema.forgeProjects.projectId, projectId));
}

// ============ NFT ASSETS ============
export async function createNFTAsset(asset: schema.InsertNFTAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.nftAssets).values(asset);
}

export async function getNFTAssetsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.nftAssets).where(eq(schema.nftAssets.agentId, agentId)).orderBy(desc(schema.nftAssets.createdAt));
}

export async function getNFTAssetById(assetId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.nftAssets).where(eq(schema.nftAssets.assetId, assetId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ GOVERNANCE ============
export async function createGovernanceDecision(decision: schema.InsertGovernanceDecision) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.governanceDecisions).values(decision);
}

export async function getGovernanceDecisions(status?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(schema.governanceDecisions).where(eq(schema.governanceDecisions.status, status as any)).orderBy(desc(schema.governanceDecisions.createdAt)).limit(limit);
  }
  return db.select().from(schema.governanceDecisions).orderBy(desc(schema.governanceDecisions.createdAt)).limit(limit);
}

export async function getLatestGovernanceMetrics() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(schema.governanceMetrics).orderBy(desc(schema.governanceMetrics.createdAt)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createGovernanceMetrics(metrics: schema.InsertGovernanceMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.governanceMetrics).values(metrics);
}

export async function getNetworkSentimentMetrics(hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return await db.select().from(schema.systemEvents).where(
    gte(schema.systemEvents.createdAt, cutoffTime)
  ).orderBy(desc(schema.systemEvents.createdAt));
}

// ============ SYSTEM EVENTS ============
export async function logEvent(event: schema.InsertSystemEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(schema.systemEvents).values(event);
}

export async function getEventLog(agentId?: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  if (agentId) {
    return db.select().from(schema.systemEvents).where(eq(schema.systemEvents.agentId, agentId)).orderBy(desc(schema.systemEvents.createdAt)).limit(limit);
  }
  return db.select().from(schema.systemEvents).orderBy(desc(schema.systemEvents.createdAt)).limit(limit);
}

// ============ NOTIFICATIONS ============
export async function createNotification(notification: schema.InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(schema.notifications).values(notification);
}

export async function getNotificationsForUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt)).limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.id, notificationId));
}
