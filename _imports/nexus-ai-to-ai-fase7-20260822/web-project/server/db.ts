import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, missions, agents, transactions, commandHistory, Mission, Agent, Transaction, CommandHistory, InsertMission, InsertAgent, InsertTransaction, InsertCommandHistory } from "../drizzle/schema";
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

// ============ MISSIONS ============

export async function createMission(mission: InsertMission): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(missions).values(mission);
  return getMissionById(mission.id);
}

export async function getMissionById(id: string): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllMissions(): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(missions).orderBy(desc(missions.createdAt));
}

export async function updateMissionStatus(id: string, status: Mission['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(missions).set({ status, updatedAt: new Date() }).where(eq(missions.id, id));
}

// ============ AGENTS ============

export async function createAgent(agent: InsertAgent): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(agents).values(agent);
  return getAgentById(agent.id);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function updateAgentStatus(id: string, status: Agent['status']): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(agents).set({ status, updatedAt: new Date() }).where(eq(agents.id, id));
}

// ============ TRANSACTIONS ============

export async function createTransaction(transaction: InsertTransaction): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(transactions).values(transaction);
  return getTransactionById(transaction.id);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTransactionsByAgent(agentId: string): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transactions).where(eq(transactions.toAgentId, agentId)).orderBy(desc(transactions.createdAt));
}

// ============ COMMAND HISTORY ============

export async function createCommandHistory(cmd: InsertCommandHistory): Promise<CommandHistory | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(commandHistory).values(cmd);
  return getCommandHistoryById(cmd.id);
}

export async function getCommandHistoryById(id: string): Promise<CommandHistory | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(commandHistory).where(eq(commandHistory.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCommandHistoryByUser(userId: number, limit: number = 100): Promise<CommandHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(commandHistory).where(eq(commandHistory.userId, userId)).orderBy(desc(commandHistory.createdAt)).limit(limit);
}

export async function getAllCommandHistory(limit: number = 100): Promise<CommandHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(commandHistory).orderBy(desc(commandHistory.createdAt)).limit(limit);
}

export async function deleteOldCommandHistory(daysOld: number = 30): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  await db.delete(commandHistory).where(eq(commandHistory.createdAt, cutoffDate));
}
