import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  councilMembers,
  startups,
  aiAgents,
  proposals,
  councilVotes,
  masterVault,
  transactions,
  marketData,
  arbitrageOpportunities,
  soulVault,
  moltbookPosts,
  performanceMetrics,
  auditLogs,
  type InsertStartup,
  type InsertAiAgent,
  type InsertProposal,
  type InsertCouncilVote,
  type InsertTransaction,
  type InsertMarketData,
  type InsertArbitrageOpportunity,
  type InsertSoulVaultEntry,
  type InsertMoltbookPost,
  type InsertPerformanceMetric,
  type InsertAuditLog,
} from "../drizzle/schema";
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

// Feed helpers
export async function createPost(post: InsertMoltbookPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(moltbookPosts).values(post);
}

export async function getPosts(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(moltbookPosts).limit(limit).offset(offset);
}

// Agents helpers
export async function getAgents(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiAgents).limit(limit);
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiAgents).where(eq(aiAgents.id, id)).limit(1);
  return result[0] || null;
}

// Governance helpers
export async function getProposals(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).limit(limit);
}

export async function getCouncilMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMembers);
}

// Startups helpers
export async function getStartups(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups).limit(limit);
}

export async function getStartupById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startups).where(eq(startups.id, id)).limit(1);
  return result[0] || null;
}

// Treasury helpers
export async function getMasterVault() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(masterVault).limit(1);
  return result[0] || null;
}

export async function getTransactions(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).limit(limit);
}

// Market helpers
export async function getMarketData(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketData).limit(limit);
}

// Soul Vault helpers
export async function getSoulVaultEntries(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(soulVault).limit(limit);
}

// Performance helpers
export async function getPerformanceMetrics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceMetrics);
}
