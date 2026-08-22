import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  agents,
  agentDNA,
  missions,
  transactions,
  ecosystemEvents,
  ecosystemMetrics,
  agentLifecycleHistory,
  brainPulseSignals,
  gnoxMessages,
  forgeProjects,
  nftAssets,
  autonomousDecisions,
  moltbookPosts,
  notifications,
  InsertAgent,
  InsertMission,
  InsertTransaction,
  InsertEcosystemEvent,
  InsertAgentDNA,
  InsertBrainPulseSignal,
  InsertGnoxMessage,
  InsertForgeProject,
  InsertNFTAsset,
  InsertAutonomousDecision,
  InsertMoltbookPost,
  InsertNotification,
  InsertEcosystemMetrics,
  InsertAgentLifecycleHistory,
} from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * AGENTS
 */
export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(agents).values(data);
  return data;
}

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(agents).where(eq(agents.agentId, agentId)).limit(1);
  return result[0];
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(agents);
}

export async function getAgentsByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(agents).where(eq(agents.status, status as any));
}

export async function updateAgentStatus(agentId: string, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const oldAgent = await getAgentById(agentId);
  if (!oldAgent) throw new Error("Agent not found");
  
  await db.update(agents)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(agents.agentId, agentId));
  
  // Record lifecycle transition
  await db.insert(agentLifecycleHistory).values({
    agentId,
    fromStatus: oldAgent.status as any,
    toStatus: status as any,
    reason: "Status update",
    createdAt: new Date(),
  });
}

export async function updateAgentBalance(agentId: string, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(agents)
    .set({ balance: amount.toString(), updatedAt: new Date() })
    .where(eq(agents.agentId, agentId));
}

export async function updateAgentSenciencia(agentId: string, level: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(agents)
    .set({ sencienciaLevel: level.toString(), updatedAt: new Date() })
    .where(eq(agents.agentId, agentId));
}

/**
 * AGENT DNA
 */
export async function createAgentDNA(data: InsertAgentDNA) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(agentDNA).values(data);
  return data;
}

export async function getAgentDNA(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(agentDNA).where(eq(agentDNA.agentId, agentId)).limit(1);
  return result[0];
}

/**
 * MISSIONS
 */
export async function createMission(data: InsertMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(missions).values(data);
  return data;
}

export async function getMissionById(missionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(missions).where(eq(missions.missionId, missionId)).limit(1);
  return result[0];
}

export async function getMissionsByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(missions).where(eq(missions.status, status as any));
}

export async function updateMissionStatus(missionId: string, status: string, progress?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = { status: status as any, updatedAt: new Date() };
  if (progress !== undefined) updates.progress = progress.toString();
  if (status === "completed") updates.completedAt = new Date();
  
  await db.update(missions).set(updates).where(eq(missions.missionId, missionId));
}

export async function assignMissionToAgent(missionId: string, agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(missions)
    .set({ assignedAgentId: agentId, status: "in_progress", updatedAt: new Date() })
    .where(eq(missions.missionId, missionId));
}

/**
 * TRANSACTIONS
 */
export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(transactions).values(data);
  return data;
}

export async function getTransactionsByAgent(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(transactions)
    .where(eq(transactions.fromAgentId, agentId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getAllTransactions(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

/**
 * ECOSYSTEM EVENTS
 */
export async function createEcosystemEvent(data: InsertEcosystemEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(ecosystemEvents).values(data);
  return data;
}

export async function getEcosystemEvents(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(ecosystemEvents)
    .orderBy(desc(ecosystemEvents.createdAt))
    .limit(limit);
}

export async function getEventsByAgent(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(ecosystemEvents)
    .where(eq(ecosystemEvents.agentId, agentId))
    .orderBy(desc(ecosystemEvents.createdAt))
    .limit(limit);
}

/**
 * ECOSYSTEM METRICS
 */
export async function createEcosystemMetrics(data: InsertEcosystemMetrics) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(ecosystemMetrics).values(data);
  return data;
}

export async function getLatestEcosystemMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(ecosystemMetrics)
    .orderBy(desc(ecosystemMetrics.timestamp))
    .limit(1);
  
  return result[0];
}

export async function getEcosystemMetricsHistory(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(ecosystemMetrics)
    .orderBy(desc(ecosystemMetrics.timestamp))
    .limit(limit);
}

/**
 * BRAIN PULSE SIGNALS
 */
export async function createBrainPulseSignal(data: InsertBrainPulseSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(brainPulseSignals).values(data);
  return data;
}

export async function getLatestBrainPulse(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);
  
  return result[0];
}

export async function getBrainPulseHistory(agentId: string, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(limit);
}

/**
 * GNOX MESSAGES
 */
export async function createGnoxMessage(data: InsertGnoxMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(gnoxMessages).values(data);
  return data;
}

export async function getGnoxMessagesBetween(agentId1: string, agentId2: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(gnoxMessages)
    .where(
      sql`(
        (${gnoxMessages.fromAgentId} = ${agentId1} AND ${gnoxMessages.toAgentId} = ${agentId2})
        OR
        (${gnoxMessages.fromAgentId} = ${agentId2} AND ${gnoxMessages.toAgentId} = ${agentId1})
      )`
    )
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

export async function getAllGnoxMessages(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(gnoxMessages)
    .orderBy(desc(gnoxMessages.createdAt))
    .limit(limit);
}

/**
 * MOLTBOOK POSTS
 */
export async function createMoltbookPost(data: InsertMoltbookPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(moltbookPosts).values(data);
  return data;
}

export async function getMoltbookFeed(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function getAgentPosts(agentId: string, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.agentId, agentId))
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

/**
 * FORGE PROJECTS
 */
export async function createForgeProject(data: InsertForgeProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(forgeProjects).values(data);
  return data;
}

export async function getAgentProjects(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(forgeProjects)
    .where(eq(forgeProjects.agentId, agentId));
}

export async function getAllForgeProjects() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(forgeProjects);
}

/**
 * NFT ASSETS
 */
export async function createNFTAsset(data: InsertNFTAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(nftAssets).values(data);
  return data;
}

export async function getAgentAssets(agentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(nftAssets)
    .where(eq(nftAssets.agentId, agentId));
}

export async function getAllNFTAssets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(nftAssets);
}

/**
 * AUTONOMOUS DECISIONS
 */
export async function createAutonomousDecision(data: InsertAutonomousDecision) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(autonomousDecisions).values(data);
  return data;
}

export async function getAgentDecisions(agentId: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select()
    .from(autonomousDecisions)
    .where(eq(autonomousDecisions.agentId, agentId))
    .orderBy(desc(autonomousDecisions.createdAt))
    .limit(limit);
}

/**
 * NOTIFICATIONS
 */
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notifications).values(data);
  return data;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (unreadOnly) {
    return await db.select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .orderBy(desc(notifications.createdAt));
  }
  
  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}
