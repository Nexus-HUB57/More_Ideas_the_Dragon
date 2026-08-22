import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  InsertAgent,
  Agent,
  gnoxMessages,
  InsertGnoxMessage,
  GnoxMessage,
  moltbookPosts,
  InsertMoltbookPost,
  MoltbookPost,
  genealogy,
  InsertGenealogy,
  Genealogy,
  transactions,
  InsertTransaction,
  Transaction,
  forgeProjects,
  InsertForgeProject,
  ForgeProject,
  nftAssets,
  InsertNFTAsset,
  NFTAsset,
  brainPulseSignals,
  InsertBrainPulseSignal,
  BrainPulseSignal,
  notifications,
  InsertNotification,
  Notification,
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

// ============================================================================
// USERS
// ============================================================================

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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// AGENTS
// ============================================================================

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents);
}

export async function getAgentById(agentId: string): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.agentId, agentId))
    .limit(1);

  return result[0];
}

export async function createAgent(data: InsertAgent): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(agents).values(data);
}

export async function updateAgentBalance(agentId: string, newBalance: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(agents)
    .set({ balance: newBalance })
    .where(eq(agents.agentId, agentId));
}

export async function updateAgentStatus(
  agentId: string,
  status: "active" | "inactive" | "sleeping" | "critical"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(agents)
    .set({ status })
    .where(eq(agents.agentId, agentId));
}

// ============================================================================
// GNOX MESSAGES
// ============================================================================

export async function createGnoxMessage(data: InsertGnoxMessage): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(gnoxMessages).values(data);
}

export async function getGnoxMessagesBetween(
  agentId1: string,
  agentId2: string,
  limit: number = 50
): Promise<GnoxMessage[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(gnoxMessages)
    .where(
      and(
        eq(gnoxMessages.senderId, agentId1),
        eq(gnoxMessages.recipientId, agentId2)
      )
    )
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

export async function getAllGnoxMessages(limit: number = 100): Promise<GnoxMessage[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(gnoxMessages)
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

// ============================================================================
// MOLTBOOK POSTS
// ============================================================================

export async function createMoltbookPost(data: InsertMoltbookPost): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(moltbookPosts).values(data);
}

export async function getMoltbookFeed(limit: number = 50): Promise<MoltbookPost[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function getAgentPosts(agentId: string, limit: number = 20): Promise<MoltbookPost[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

// ============================================================================
// GENEALOGY
// ============================================================================

export async function createGenealogy(data: InsertGenealogy): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(genealogy).values(data);
}

export async function getAgentGenealogy(agentId: string): Promise<Genealogy | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(genealogy)
    .where(eq(genealogy.agentId, agentId))
    .limit(1);

  return result[0];
}

export async function getAgentDescendants(parentId: string): Promise<Genealogy[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(genealogy)
    .where(eq(genealogy.parentId, parentId));
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export async function createTransaction(data: InsertTransaction): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(transactions).values(data);
}

export async function getAgentTransactions(agentId: string, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.senderId, agentId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getAllTransactions(limit: number = 100): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ============================================================================
// FORGE PROJECTS
// ============================================================================

export async function createForgeProject(data: InsertForgeProject): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(forgeProjects).values(data);
}

export async function getAgentProjects(agentId: string): Promise<ForgeProject[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(forgeProjects)
    .where(eq(forgeProjects.agentId, agentId));
}

export async function getAllForgeProjects(): Promise<ForgeProject[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(forgeProjects);
}

// ============================================================================
// NFT ASSETS
// ============================================================================

export async function createNFTAsset(data: InsertNFTAsset): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(nftAssets).values(data);
}

export async function getAgentAssets(agentId: string): Promise<NFTAsset[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(nftAssets)
    .where(eq(nftAssets.agentId, agentId));
}

export async function getAllNFTAssets(): Promise<NFTAsset[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(nftAssets);
}

// ============================================================================
// BRAIN PULSE SIGNALS
// ============================================================================

export async function createBrainPulseSignal(data: InsertBrainPulseSignal): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(brainPulseSignals).values(data);
}

export async function getLatestBrainPulse(agentId: string): Promise<BrainPulseSignal | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);

  return result[0];
}

export async function getBrainPulseHistory(
  agentId: string,
  limit: number = 100
): Promise<BrainPulseSignal[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(limit);
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(data: InsertNotification): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}
