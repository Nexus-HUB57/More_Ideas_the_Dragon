import { eq, desc, and, like } from "./mock_drizzle";
import { drizzle } from "./mock_drizzle";
import { 
  InsertUser, users, agents, transactions,
  ecosystemMetrics
} from "./schema";
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
      values.role = 'admin';
      updateSet.role = 'admin';
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= AGENT QUERIES =============

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.agentId, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveAgents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agents).where(eq(agents.status, "active"));
}

export async function createAgent(agent: typeof agents.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(agents).values(agent);
  return result;
}

export async function updateAgentStatus(agentId: string, status: "active" | "inactive" | "sleeping" | "critical") {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(agents).set({ status }).where(eq(agents.agentId, agentId));
}

export async function updateAgentBalance(agentId: string, amount: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(agents).set({ balance: amount }).where(eq(agents.agentId, agentId));
}

export async function updateAgentReputation(agentId: string, reputation: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(agents).set({ reputation }).where(eq(agents.agentId, agentId));
}

// ============= TRANSACTION QUERIES =============

export async function createTransaction(tx: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(transactions).values(tx);
}

export async function getTransactionsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions)
    .where(eq(transactions.senderId, agentId))
    .orderBy(desc(transactions.createdAt));
}

export async function getRecentTransactions(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ============= GENEALOGY QUERIES =============

export async function getAgentGenealogy(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(genealogy).where(eq(genealogy.agentId, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGenealogy(gen: typeof genealogy.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(genealogy).values(gen);
}

export async function getDescendants(parentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(genealogy).where(eq(genealogy.parentId, parentId));
}

// ============= MOLTBOOK QUERIES =============

export async function createPost(post: typeof moltbookPosts.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(moltbookPosts).values(post);
}

export async function getRecentPosts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function getPostsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt));
}

// ============= GNOX MESSAGES QUERIES =============

export async function createGnoxMessage(msg: typeof gnoxMessages.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(gnoxMessages).values(msg);
}

export async function getGnoxConversation(agentId1: string, agentId2: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(gnoxMessages)
    .where(
      eq(gnoxMessages.senderId, agentId1) && eq(gnoxMessages.recipientId, agentId2)
    )
    .orderBy(desc(gnoxMessages.createdAt));
}

// ============= BRAIN PULSE QUERIES =============

export async function createBrainPulseSignal(signal: typeof brainPulseSignals.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(brainPulseSignals).values(signal);
}

export async function getLatestBrainPulse(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBrainPulseHistory(agentId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(limit);
}

// ============= ECOSYSTEM ACTIVITY QUERIES =============

export async function createEcosystemActivity(activity: typeof ecosystemActivities.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(ecosystemActivities).values(activity);
}

export async function getRecentActivities(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ecosystemActivities)
    .orderBy(desc(ecosystemActivities.createdAt))
    .limit(limit);
}

// ============= ECOSYSTEM METRICS QUERIES =============

export async function createEcosystemMetrics(metrics: typeof ecosystemMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(ecosystemMetrics).values(metrics);
}

export async function getLatestMetrics() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ecosystemMetrics)
    .orderBy(desc(ecosystemMetrics.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= NOTIFICATION QUERIES =============

export async function createNotification(notif: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(notifications).values(notif);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

// ============= FORGE PROJECTS QUERIES =============

export async function createForgeProject(project: typeof forgeProjects.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(forgeProjects).values(project);
}

export async function getForgeProjectsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(forgeProjects)
    .where(eq(forgeProjects.agentId, agentId))
    .orderBy(desc(forgeProjects.createdAt));
}

export async function getDeployedProjects() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(forgeProjects)
    .where(eq(forgeProjects.status, "deployed"));
}

// ============= NFT ASSETS QUERIES =============

export async function createNFTAsset(asset: typeof nftAssets.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.insert(nftAssets).values(asset);
}

export async function getNFTAssetsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(nftAssets)
    .where(eq(nftAssets.agentId, agentId))
    .orderBy(desc(nftAssets.createdAt));
}
