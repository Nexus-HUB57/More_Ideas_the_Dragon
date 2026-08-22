import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertMission, Mission, InsertAgent, Agent, InsertTransaction, Transaction, InsertCommandHistory, CommandHistory, missions, agents, transactions, commandHistory } from "../drizzle/schema";
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

// Missions queries
export async function createMission(mission: InsertMission): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(missions).values(mission);
    return (await db.select().from(missions).where(eq(missions.id, mission.id)).limit(1))[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create mission:", error);
    return null;
  }
}

export async function getMissionById(id: string): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get mission:", error);
    return null;
  }
}

export async function getAllMissions(): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(missions);
  } catch (error) {
    console.error("[Database] Failed to get missions:", error);
    return [];
  }
}

export async function updateMission(id: string, updates: Partial<InsertMission>): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(missions).set(updates).where(eq(missions.id, id));
    return await getMissionById(id);
  } catch (error) {
    console.error("[Database] Failed to update mission:", error);
    return null;
  }
}

// Agents queries
export async function createAgent(agent: InsertAgent): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(agents).values(agent);
    return (await db.select().from(agents).where(eq(agents.id, agent.id)).limit(1))[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create agent:", error);
    return null;
  }
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get agent:", error);
    return null;
  }
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(agents);
  } catch (error) {
    console.error("[Database] Failed to get agents:", error);
    return [];
  }
}

export async function updateAgent(id: string, updates: Partial<InsertAgent>): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(agents).set(updates).where(eq(agents.id, id));
    return await getAgentById(id);
  } catch (error) {
    console.error("[Database] Failed to update agent:", error);
    return null;
  }
}

// Transactions queries
export async function createTransaction(transaction: InsertTransaction): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(transactions).values(transaction);
    return (await db.select().from(transactions).where(eq(transactions.id, transaction.id)).limit(1))[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    return null;
  }
}

export async function getTransactionsByAgent(agentId: string): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(transactions).where(eq(transactions.toAgentId, agentId));
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

// Command history queries
export async function saveCommandHistory(record: InsertCommandHistory): Promise<CommandHistory | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(commandHistory).values(record);
    return (await db.select().from(commandHistory).where(eq(commandHistory.id, record.id)).limit(1))[0] || null;
  } catch (error) {
    console.error("[Database] Failed to save command history:", error);
    return null;
  }
}

export async function getCommandHistoryRecords(limit: number = 100): Promise<CommandHistory[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(commandHistory).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get command history:", error);
    return [];
  }
}


