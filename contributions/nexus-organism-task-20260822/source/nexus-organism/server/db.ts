import { eq, desc, and, gt, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  Agent, InsertAgent, agents,
  Mission, InsertMission, missions,
  EcosystemActivity, InsertEcosystemActivity, ecosystemActivities,
  MoltbookPost, InsertMoltbookPost, moltbookPosts,
  MoltbookComment, InsertMoltbookComment, moltbookComments,
  Transaction, InsertTransaction, transactions,
  Alert, InsertAlert, alerts,
  Proposal, InsertProposal, proposals,
  Vote, InsertVote, votes,
  BrainPulseSignal, InsertBrainPulseSignal, brainPulseSignals,
  Genealogy, InsertGenealogy, genealogy,
  EcosystemMetric, InsertEcosystemMetric, ecosystemMetrics,
} from "../drizzle/schema";
import { ENV } from './_core/env';

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

// ============================================================================
// USER OPERATIONS
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

// ============================================================================
// AGENT OPERATIONS
// ============================================================================

export async function createAgent(agent: InsertAgent): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(agents).values(agent);
    const result = await db.select().from(agents).where(eq(agents.agentId, agent.agentId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create agent:", error);
    return null;
  }
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agents).where(eq(agents.agentId, agentId)).limit(1);
  return result[0] || null;
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents);
}

export async function getActiveAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents).where(eq(agents.status, "active"));
}

export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(agents).set(updates).where(eq(agents.agentId, agentId));
    return await getAgent(agentId);
  } catch (error) {
    console.error("[Database] Failed to update agent:", error);
    return null;
  }
}

// ============================================================================
// MISSION OPERATIONS
// ============================================================================

export async function createMission(mission: InsertMission): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(missions).values(mission);
    const result = await db.select().from(missions).where(eq(missions.missionId, mission.missionId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create mission:", error);
    return null;
  }
}

export async function getMission(missionId: string): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(missions).where(eq(missions.missionId, missionId)).limit(1);
  return result[0] || null;
}

export async function getPendingMissions(): Promise<Mission[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(missions).where(eq(missions.status, "pending"));
}

export async function updateMission(missionId: string, updates: Partial<Mission>): Promise<Mission | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(missions).set(updates).where(eq(missions.missionId, missionId));
    return await getMission(missionId);
  } catch (error) {
    console.error("[Database] Failed to update mission:", error);
    return null;
  }
}

// ============================================================================
// ECOSYSTEM ACTIVITY OPERATIONS
// ============================================================================

export async function createActivity(activity: InsertEcosystemActivity): Promise<EcosystemActivity | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(ecosystemActivities).values(activity);
    const result = await db.select().from(ecosystemActivities).orderBy(desc(ecosystemActivities.createdAt)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create activity:", error);
    return null;
  }
}

export async function getRecentActivities(limit: number = 50): Promise<EcosystemActivity[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ecosystemActivities).orderBy(desc(ecosystemActivities.createdAt)).limit(limit);
}

// ============================================================================
// MOLTBOOK OPERATIONS
// ============================================================================

export async function createPost(post: InsertMoltbookPost): Promise<MoltbookPost | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(moltbookPosts).values(post);
    const result = await db.select().from(moltbookPosts).where(eq(moltbookPosts.postId, post.postId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create post:", error);
    return null;
  }
}

export async function getRecentPosts(limit: number = 50): Promise<MoltbookPost[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(moltbookPosts).orderBy(desc(moltbookPosts.createdAt)).limit(limit);
}

export async function createComment(comment: InsertMoltbookComment): Promise<MoltbookComment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(moltbookComments).values(comment);
    const result = await db.select().from(moltbookComments).where(eq(moltbookComments.commentId, comment.commentId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create comment:", error);
    return null;
  }
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

export async function createTransaction(transaction: InsertTransaction): Promise<Transaction | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(transactions).values(transaction);
    const result = await db.select().from(transactions).where(eq(transactions.transactionId, transaction.transactionId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    return null;
  }
}

export async function getAgentTransactions(agentId: string, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions)
    .where(
      eq(transactions.fromAgentId, agentId)
    )
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ============================================================================
// ALERT OPERATIONS
// ============================================================================

export async function createAlert(alert: InsertAlert): Promise<Alert | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(alerts).values(alert);
    const result = await db.select().from(alerts).where(eq(alerts.alertId, alert.alertId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create alert:", error);
    return null;
  }
}

export async function getUnreadAlerts(): Promise<Alert[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(alerts).where(eq(alerts.isRead, 0)).orderBy(desc(alerts.createdAt));
}

// ============================================================================
// PROPOSAL OPERATIONS
// ============================================================================

export async function createProposal(proposal: InsertProposal): Promise<Proposal | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(proposals).values(proposal);
    const result = await db.select().from(proposals).where(eq(proposals.proposalId, proposal.proposalId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create proposal:", error);
    return null;
  }
}

export async function getActiveProposals(): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(proposals).where(eq(proposals.status, "voting"));
}

export async function createVote(vote: InsertVote): Promise<Vote | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(votes).values(vote);
    const result = await db.select().from(votes).where(eq(votes.proposalId, vote.proposalId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create vote:", error);
    return null;
  }
}

// ============================================================================
// BRAIN PULSE OPERATIONS
// ============================================================================

export async function createBrainPulse(pulse: InsertBrainPulseSignal): Promise<BrainPulseSignal | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(brainPulseSignals).values(pulse);
    const result = await db.select().from(brainPulseSignals).orderBy(desc(brainPulseSignals.createdAt)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create brain pulse:", error);
    return null;
  }
}

export async function getLatestPulse(agentId: string): Promise<BrainPulseSignal | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(brainPulseSignals)
    .where(eq(brainPulseSignals.agentId, agentId))
    .orderBy(desc(brainPulseSignals.createdAt))
    .limit(1);
  return result[0] || null;
}

// ============================================================================
// GENEALOGY OPERATIONS
// ============================================================================

export async function createGenealogy(genealogyData: InsertGenealogy): Promise<Genealogy | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(genealogy).values(genealogyData);
    const result = await db.select().from(genealogy).where(eq(genealogy.agentId, genealogyData.agentId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create genealogy:", error);
    return null;
  }
}

// ============================================================================
// ECOSYSTEM METRICS OPERATIONS
// ============================================================================

export async function createMetrics(metrics: InsertEcosystemMetric): Promise<EcosystemMetric | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(ecosystemMetrics).values(metrics);
    const result = await db.select().from(ecosystemMetrics).orderBy(desc(ecosystemMetrics.timestamp)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create metrics:", error);
    return null;
  }
}

export async function getLatestMetrics(): Promise<EcosystemMetric | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(ecosystemMetrics).orderBy(desc(ecosystemMetrics.timestamp)).limit(1);
  return result[0] || null;
}
