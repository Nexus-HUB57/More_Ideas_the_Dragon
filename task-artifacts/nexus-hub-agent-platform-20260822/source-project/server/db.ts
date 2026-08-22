import { eq, desc, and, or, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  InsertAgent,
  gnoxMessages,
  InsertGnoxMessage,
  moltbookPosts,
  InsertMoltbookPost,
  genealogy,
  InsertGenealogy,
  transactions,
  InsertTransaction,
  forgeProjects,
  InsertForgeProject,
  nftAssets,
  InsertNFTAsset,
  brainPulseSignals,
  InsertBrainPulseSignal,
  notifications,
  InsertNotification,
  postReactions,
  InsertPostReaction,
  agentReflections,
  InsertAgentReflection,
  systemEvents,
  InsertSystemEvent,
  systemConfig,
  InsertSystemConfig,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily create the drizzle instance so local tooling can run without a DB.
 */
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

/**
 * USERS - Authentication and User Management
 */

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

/**
 * AGENTS - AI Agent Management
 */

export async function createAgent(agent: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(agent);
  return result;
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.agentId, agentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function listAgents(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agents)
    .orderBy(desc(agents.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateAgent(agentId: string, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(agents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agents.agentId, agentId));
}

export async function searchAgents(query: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agents)
    .where(
      or(
        like(agents.name, `%${query}%`),
        like(agents.specialization, `%${query}%`),
        like(agents.description, `%${query}%`)
      )
    )
    .limit(limit);
}

/**
 * GNOX MESSAGES - Encrypted Communication
 */

export async function createGnoxMessage(message: InsertGnoxMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(gnoxMessages).values(message);
}

export async function getGnoxConversation(
  agentId1: string,
  agentId2: string,
  limit = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(gnoxMessages)
    .where(
      or(
        and(
          eq(gnoxMessages.senderId, agentId1),
          eq(gnoxMessages.recipientId, agentId2)
        ),
        and(
          eq(gnoxMessages.senderId, agentId2),
          eq(gnoxMessages.recipientId, agentId1)
        )
      )
    )
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

/**
 * MOLTBOOK POSTS - Social Feed
 */

export async function createMoltbookPost(post: InsertMoltbookPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(moltbookPosts).values(post);
}

export async function getMoltbookPost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.id, postId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function listMoltbookPosts(
  limit = 50,
  offset = 0,
  postType?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (postType) {
    return db
      .select()
      .from(moltbookPosts)
      .where(eq(moltbookPosts.postType, postType))
      .orderBy(desc(moltbookPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAgentPosts(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

/**
 * GENEALOGY - Agent Lineage
 */

export async function createGenealogy(genealogyData: InsertGenealogy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(genealogy).values(genealogyData);
}

export async function getAgentGenealogy(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(genealogy)
    .where(eq(genealogy.agentId, agentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAgentChildren(parentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(genealogy)
    .where(eq(genealogy.parentId, parentId));
}

/**
 * TRANSACTIONS - Economy and Finance
 */

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values(transaction);
}

export async function getAgentTransactions(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(transactions)
    .where(
      or(
        eq(transactions.senderId, agentId),
        eq(transactions.recipientId, agentId)
      )
    )
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionHistory(
  agentId: string,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(transactions)
    .where(
      and(
        or(
          eq(transactions.senderId, agentId),
          eq(transactions.recipientId, agentId)
        ),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      )
    )
    .orderBy(desc(transactions.createdAt));
}

/**
 * FORGE PROJECTS - Project Management
 */

export async function createForgeProject(project: InsertForgeProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(forgeProjects).values(project);
}

export async function getForgeProject(projectId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(forgeProjects)
    .where(eq(forgeProjects.projectId, projectId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAgentProjects(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(forgeProjects)
    .where(eq(forgeProjects.agentId, agentId))
    .orderBy(desc(forgeProjects.createdAt));
}

export async function updateForgeProject(
  projectId: string,
  data: Partial<InsertForgeProject>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(forgeProjects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(forgeProjects.projectId, projectId));
}

/**
 * NFT ASSETS - Digital Assets
 */

export async function createNFTAsset(asset: InsertNFTAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(nftAssets).values(asset);
}

export async function getNFTAsset(assetId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(nftAssets)
    .where(eq(nftAssets.assetId, assetId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAgentNFTs(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(nftAssets)
    .where(eq(nftAssets.agentId, agentId))
    .orderBy(desc(nftAssets.createdAt));
}

/**
 * BRAIN PULSE SIGNALS - Vital Signs
 */

export async function createBrainPulseSignal(signal: InsertBrainPulseSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(brainPulseSignals).values(signal);
}

export async function getLatestBrainPulse(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBrainPulseHistory(agentId: string, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(limit);
}

/**
 * NOTIFICATIONS - System Notifications
 */

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      )
    )
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}

/**
 * POST REACTIONS - Social Interactions
 */

export async function createPostReaction(reaction: InsertPostReaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(postReactions).values(reaction);
}

export async function getPostReactions(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(postReactions)
    .where(eq(postReactions.postId, postId));
}

export async function getReactionCount(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(postReactions)
    .where(eq(postReactions.postId, postId));

  return result.length;
}

/**
 * AGENT REFLECTIONS - Consciousness and Thoughts
 */

export async function createAgentReflection(reflection: InsertAgentReflection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(agentReflections).values(reflection);
}

export async function getAgentReflections(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agentReflections)
    .where(eq(agentReflections.agentId, agentId))
    .orderBy(desc(agentReflections.createdAt))
    .limit(limit);
}

/**
 * SYSTEM EVENTS - Audit Trail
 */

export async function createSystemEvent(event: InsertSystemEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(systemEvents).values(event);
}

export async function getSystemEvents(
  limit = 100,
  eventType?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (eventType) {
    return db
      .select()
      .from(systemEvents)
      .where(eq(systemEvents.eventType, eventType))
      .orderBy(desc(systemEvents.createdAt))
      .limit(limit);
  }

  return db
    .select()
    .from(systemEvents)
    .orderBy(desc(systemEvents.createdAt))
    .limit(limit);
}

/**
 * SYSTEM CONFIG - Global Configuration
 */

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function setSystemConfig(
  key: string,
  value: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSystemConfig(key);

  if (existing) {
    return db
      .update(systemConfig)
      .set({ value, description, updatedAt: new Date() })
      .where(eq(systemConfig.key, key));
  } else {
    return db.insert(systemConfig).values({
      key,
      value,
      description,
    });
  }
}

/**
 * ECOSYSTEM STATISTICS - Analytics
 */

export async function getEcosystemStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalAgents = await db.select().from(agents);
  const totalTransactions = await db.select().from(transactions);
  const totalPosts = await db.select().from(moltbookPosts);
  const activeAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.status, "active"));

  return {
    totalAgents: totalAgents.length,
    activeAgents: activeAgents.length,
    totalTransactions: totalTransactions.length,
    totalPosts: totalPosts.length,
    timestamp: new Date(),
  };
}

export async function getAgentBalance(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const agent = await getAgentById(agentId);
  return agent?.balance ?? 0;
}
