import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  startups,
  aiAgents,
  councilMembers,
  proposals,
  councilVotes,
  transactions,
  masterVault,
  marketData,
  marketInsights,
  arbitrageOpportunities,
  soulVault,
  moltbookPosts,
  moltbookComments,
  performanceMetrics,
  auditLogs,
  agentDna,
  Startup,
  AiAgent,
  CouncilMember,
  Proposal,
  Transaction,
  MasterVault,
  MarketData,
  MarketInsight,
  ArbitrageOpportunity,
  SoulVaultEntry,
  MoltbookPost,
  MoltbookComment,
  PerformanceMetric,
  AuditLog,
  AgentDna,
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

// ============================================
// STARTUPS
// ============================================

export async function listStartups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups);
}

export async function getStartupById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startups).where(eq(startups.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getStartupsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups).where(eq(startups.status, status as any));
}

export async function createStartup(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(startups).values(data);
  return result;
}

export async function updateStartup(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(startups).set(data).where(eq(startups.id, id));
}

// ============================================
// AI AGENTS
// ============================================

export async function listAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiAgents);
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiAgents).where(eq(aiAgents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAgentsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiAgents).where(eq(aiAgents.startupId, startupId));
}

export async function createAgent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiAgents).values(data);
  return result;
}

export async function updateAgent(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(aiAgents).set(data).where(eq(aiAgents.id, id));
}

// ============================================
// COUNCIL
// ============================================

export async function listCouncilMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMembers);
}

export async function getCouncilMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(councilMembers)
    .where(eq(councilMembers.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCouncilMember(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(councilMembers).values(data);
}

// ============================================
// PROPOSALS & VOTES
// ============================================

export async function listProposals(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(proposals).where(eq(proposals.status, status as any));
  }
  return db.select().from(proposals);
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProposal(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(proposals).values(data);
}

export async function updateProposal(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function getProposalVotes(proposalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilVotes).where(eq(councilVotes.proposalId, proposalId));
}

export async function createVote(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(councilVotes).values(data);
}

// ============================================
// TRANSACTIONS & VAULT
// ============================================

export async function listTransactions(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.type, type as any));
}

export async function createTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function updateTransaction(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function getMasterVault() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(masterVault).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMasterVault(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMasterVault();
  if (existing) {
    return db.update(masterVault).set(data).where(eq(masterVault.id, existing.id));
  } else {
    return db.insert(masterVault).values(data);
  }
}

// ============================================
// MARKET ORACLE
// ============================================

export async function listMarketData(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(marketData)
    .orderBy(desc(marketData.createdAt))
    .limit(limit);
}

export async function getMarketDataByAsset(asset: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketData).where(eq(marketData.asset, asset));
}

export async function createMarketData(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(marketData).values(data);
}

export async function listMarketInsights(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(marketInsights)
    .orderBy(desc(marketInsights.createdAt))
    .limit(limit);
}

export async function createMarketInsight(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(marketInsights).values(data);
}

// ============================================
// ARBITRAGE
// ============================================

export async function listArbitrageOpportunities(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db
      .select()
      .from(arbitrageOpportunities)
      .where(eq(arbitrageOpportunities.status, status as any));
  }
  return db.select().from(arbitrageOpportunities);
}

export async function createArbitrageOpportunity(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(arbitrageOpportunities).values(data);
}

export async function updateArbitrageOpportunity(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(arbitrageOpportunities)
    .set(data)
    .where(eq(arbitrageOpportunities.id, id));
}

// ============================================
// SOUL VAULT
// ============================================

export async function listSoulVaultEntries(type?: string) {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(soulVault).where(eq(soulVault.type, type as any));
  }
  return db.select().from(soulVault);
}

export async function createSoulVaultEntry(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(soulVault).values(data);
}

// ============================================
// MOLTBOOK
// ============================================

export async function listMoltbookPosts(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function getMoltbookPostsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.startupId, startupId))
    .orderBy(desc(moltbookPosts.createdAt));
}

export async function createMoltbookPost(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(moltbookPosts).values(data);
}

export async function updateMoltbookPost(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(moltbookPosts).set(data).where(eq(moltbookPosts.id, id));
}

export async function getMoltbookComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moltbookComments)
    .where(eq(moltbookComments.postId, postId))
    .orderBy(desc(moltbookComments.createdAt));
}

export async function createMoltbookComment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(moltbookComments).values(data);
}

// ============================================
// PERFORMANCE METRICS
// ============================================

export async function listPerformanceMetrics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceMetrics).orderBy(desc(performanceMetrics.rank));
}

export async function getPerformanceMetricsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(performanceMetrics)
    .where(eq(performanceMetrics.startupId, startupId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPerformanceMetric(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(performanceMetrics).values(data);
}

export async function updatePerformanceMetric(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(performanceMetrics).set(data).where(eq(performanceMetrics.id, id));
}

// ============================================
// AUDIT LOGS
// ============================================

export async function listAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLogs).values(data);
}

// ============================================
// AGENT DNA
// ============================================

export async function getAgentDnaByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(agentDna).where(eq(agentDna.agentId, agentId));
  return result.length > 0 ? result[0] : null;
}

export async function createAgentDna(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentDna).values(data);
}
