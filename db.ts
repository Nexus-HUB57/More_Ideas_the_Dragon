import { eq, desc, and, gte, lte, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, startups, aiAgents, councilMembers, proposals, councilVotes,
  masterVault, transactions, marketData, marketInsights, arbitrageOpportunities,
  soulVault, moltbookPosts, moltbookComments, performanceMetrics, auditLogs, agentDna,
  Startup, AiAgent, CouncilMember, Proposal, Transaction, MarketData, MarketInsight,
  ArbitrageOpportunity, SoulVaultEntry, MoltbookPost, PerformanceMetric, AuditLog
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

// ============================================
// STARTUPS
// ============================================

export async function getStartups(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(startups).orderBy(desc(startups.revenue));
  if (limit) return query.limit(limit);
  return query;
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

// ============================================
// AI AGENTS
// ============================================

export async function getAgents(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(aiAgents).orderBy(desc(aiAgents.reputation));
  if (limit) return query.limit(limit);
  return query;
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

// ============================================
// COUNCIL
// ============================================

export async function getCouncilMembers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(councilMembers).orderBy(desc(councilMembers.votingPower));
}

export async function getCouncilMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(councilMembers).where(eq(councilMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================
// PROPOSALS & VOTES
// ============================================

export async function getProposals(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(proposals).where(eq(proposals.status, status as any)).orderBy(desc(proposals.createdAt));
  }
  return db.select().from(proposals).orderBy(desc(proposals.createdAt));
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getVotesForProposal(proposalId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(councilVotes).where(eq(councilVotes.proposalId, proposalId));
}

// ============================================
// TRANSACTIONS & VAULT
// ============================================

export async function getTransactions(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(transactions).orderBy(desc(transactions.createdAt));
  if (limit) return query.limit(limit);
  return query;
}

export async function getTransactionsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(transactions).where(eq(transactions.type, type as any)).orderBy(desc(transactions.createdAt));
}

export async function getMasterVault() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(masterVault).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================
// MARKET DATA
// ============================================

export async function getMarketData(asset?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (asset) {
    return db.select().from(marketData).where(eq(marketData.asset, asset)).orderBy(desc(marketData.createdAt)).limit(100);
  }
  return db.select().from(marketData).orderBy(desc(marketData.createdAt)).limit(100);
}

export async function getMarketInsights(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(marketInsights).orderBy(desc(marketInsights.createdAt));
  if (limit) return query.limit(limit);
  return query;
}

// ============================================
// ARBITRAGE
// ============================================

export async function getArbitrageOpportunities(status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(arbitrageOpportunities).where(eq(arbitrageOpportunities.status, status as any)).orderBy(desc(arbitrageOpportunities.profitPotential));
  }
  return db.select().from(arbitrageOpportunities).orderBy(desc(arbitrageOpportunities.profitPotential));
}

// ============================================
// SOUL VAULT
// ============================================

export async function getSoulVaultEntries(type?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (type) {
    return db.select().from(soulVault).where(eq(soulVault.type, type as any)).orderBy(desc(soulVault.createdAt));
  }
  return db.select().from(soulVault).orderBy(desc(soulVault.createdAt));
}

// ============================================
// MOLTBOOK
// ============================================

export async function getMoltbookPosts(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(moltbookPosts).orderBy(desc(moltbookPosts.createdAt));
  if (limit) return query.limit(limit);
  return query;
}

export async function getMoltbookPostsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(moltbookPosts).where(eq(moltbookPosts.startupId, startupId)).orderBy(desc(moltbookPosts.createdAt));
}

export async function getMoltbookComments(postId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(moltbookComments).where(eq(moltbookComments.postId, postId)).orderBy(desc(moltbookComments.createdAt));
}

// ============================================
// PERFORMANCE METRICS
// ============================================

export async function getPerformanceMetrics() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(performanceMetrics).orderBy(asc(performanceMetrics.rank));
}

export async function getPerformanceMetricsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(performanceMetrics).where(eq(performanceMetrics.startupId, startupId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================
// AUDIT LOGS
// ============================================

export async function getAuditLogs(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  if (limit) return query.limit(limit);
  return query;
}

export async function createAuditLog(action: string, actor: string, targetType?: string, targetId?: number, details?: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(auditLogs).values({
      action,
      actor,
      targetType,
      targetId,
      details,
    });
    return true;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return false;
  }
}
