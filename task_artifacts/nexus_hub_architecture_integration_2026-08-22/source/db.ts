import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// NEXUS HUB OPERATIONS
// ============================================================================

import {
  agents,
  projects,
  nftAssets,
  transactions,
  genealogy,
  type InsertAgent,
  type InsertProject,
  type InsertNFTAsset,
  type InsertTransaction,
  type InsertGenealogy,
} from "../drizzle/schema";

// Agent operations
export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result[0] || null;
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  return result[0] || null;
}

export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(agents).values(data);
  return data.id;
}

export async function updateAgent(agentId: string, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agents).set(data).where(eq(agents.id, agentId));
}

// Project operations (Forge)
export async function getAgentProjects(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projects).where(eq(projects.agentId, agentId));
}

export async function getProjectById(projectId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0] || null;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(projects).values(data);
  return data.id;
}

// NFT Asset operations (Asset Lab)
export async function getAgentAssets(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(nftAssets).where(eq(nftAssets.agentId, agentId));
}

export async function createAsset(data: InsertNFTAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(nftAssets).values(data);
  return data.id;
}

// Transaction operations (Capital)
export async function getAgentTransactions(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(transactions).where(eq(transactions.fromAgentId, agentId));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(transactions).values(data);
  return data.id;
}

// Genealogy operations
export async function getAgentGenealogy(agentId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(genealogy).where(eq(genealogy.agentId, agentId)).limit(1);
  return result[0] || null;
}

export async function getAgentDescendants(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(genealogy).where(eq(genealogy.parentId, agentId));
}

export async function createGenealogy(data: InsertGenealogy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(genealogy).values(data);
  return data.id;
}
