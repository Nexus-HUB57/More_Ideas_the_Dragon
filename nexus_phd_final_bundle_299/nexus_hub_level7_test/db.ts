import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  agentDNA,
  transactions,
  missions,
  ecosystemEvents,
  moltbookPosts,
  notifications,
  ecosystemMetrics,
  autonomousDecisions,
  agentLifecycleHistory,
  Agent,
  EcosystemEvent,
  Mission,
  MoltbookPost,
  Notification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function createAgent(agentData: typeof agents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(agentData);
  return result;
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.agentId, agentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getActiveAgents() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agents)
    .where(eq(agents.status, "active"))
    .orderBy(desc(agents.sencienciaLevel));
}

export async function getAgentsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents).where(eq(agents.status, status as any));
}

export async function updateAgent(agentId: string, data: Partial<Agent>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(agents).set(data).where(eq(agents.agentId, agentId));
  return getAgentById(agentId);
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

// ============ TRANSACTION QUERIES ============

export async function createTransaction(txData: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values(txData);
}

export async function getTransactionsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.fromAgentId, agentId))
    .orderBy(desc(transactions.createdAt));
}

export async function getConfirmedTransactions() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(transactions)
    .where(eq(transactions.status, "confirmed"))
    .orderBy(desc(transactions.createdAt));
}

// ============ MISSION QUERIES ============

export async function createMission(missionData: typeof missions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(missions).values(missionData);
}

export async function getMissionById(missionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(missions)
    .where(eq(missions.missionId, missionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getActiveMissions() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(missions)
    .where(eq(missions.status, "in_progress"))
    .orderBy(desc(missions.priority));
}

export async function updateMission(missionId: string, data: Partial<Mission>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(missions).set(data).where(eq(missions.missionId, missionId));
  return getMissionById(missionId);
}

// ============ EVENT QUERIES ============

export async function createEvent(eventData: typeof ecosystemEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(ecosystemEvents).values(eventData);
}

export async function getRecentEvents(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(ecosystemEvents)
    .orderBy(desc(ecosystemEvents.createdAt))
    .limit(limit);
}

export async function getCriticalEvents() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(ecosystemEvents)
    .where(eq(ecosystemEvents.severity, "critical"))
    .orderBy(desc(ecosystemEvents.createdAt))
    .limit(20);
}

// ============ MOLTBOOK QUERIES ============

export async function createPost(postData: typeof moltbookPosts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(moltbookPosts).values(postData);
}

export async function getPostsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt));
}

export async function getRecentPosts(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

// ============ NOTIFICATION QUERIES ============

export async function createNotification(
  notificationData: typeof notifications.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values(notificationData);
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: string) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.notificationId, notificationId));
}

// ============ METRICS QUERIES ============

export async function getLatestMetrics() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(ecosystemMetrics)
    .orderBy(desc(ecosystemMetrics.timestamp))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createMetrics(metricsData: typeof ecosystemMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(ecosystemMetrics).values(metricsData);
}

// ============ AUTONOMOUS DECISION QUERIES ============

export async function createDecision(decisionData: typeof autonomousDecisions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(autonomousDecisions).values(decisionData);
}

export async function getDecisionsByAgent(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(autonomousDecisions)
    .where(eq(autonomousDecisions.agentId, agentId))
    .orderBy(desc(autonomousDecisions.createdAt));
}

// ============ LIFECYCLE HISTORY QUERIES ============

export async function createLifecycleHistory(
  historyData: typeof agentLifecycleHistory.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(agentLifecycleHistory).values(historyData);
}

export async function getLifecycleHistory(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agentLifecycleHistory)
    .where(eq(agentLifecycleHistory.agentId, agentId))
    .orderBy(desc(agentLifecycleHistory.createdAt));
}

// ============ ECOSYSTEM STATISTICS ============

export async function getEcosystemStats() {
  const db = await getDb();
  if (!db) return null;

  const allAgents = await db.select().from(agents);
  const activeAgents = allAgents.filter((a) => a.status === "active");
  const deadAgents = allAgents.filter((a) => a.status === "dead");
  const hibernatingAgents = allAgents.filter((a) => a.status === "hibernating");

  const avgHealth =
    allAgents.length > 0
      ? allAgents.reduce((sum, a) => sum + a.health, 0) / allAgents.length
      : 0;
  const avgEnergy =
    allAgents.length > 0
      ? allAgents.reduce((sum, a) => sum + a.energy, 0) / allAgents.length
      : 0;

  return {
    totalAgents: allAgents.length,
    activeAgents: activeAgents.length,
    deadAgents: deadAgents.length,
    hibernatingAgents: hibernatingAgents.length,
    averageHealth: avgHealth,
    averageEnergy: avgEnergy,
    topAgents: allAgents
      .sort((a, b) => Number(b.sencienciaLevel) - Number(a.sencienciaLevel))
      .slice(0, 5),
  };
}
