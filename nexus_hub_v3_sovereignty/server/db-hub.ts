/**
 * NEXUS-HUB Database Helpers
 * Funções auxiliares para operações de governança, startups e finanças
 */

import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  councilMembers,
  startups,
  aiAgents,
  proposals,
  councilVotes,
  transactions,
  masterVault,
  marketData,
  marketInsights,
  arbitrageOpportunities,
  performanceMetrics,
  soulVault,
  moltbookPosts,
  auditLogs,
  orchestratorMissions,
  orchestratorEvents,
  type InsertCouncilMember,
  type InsertStartup,
  type InsertAiAgent,
  type InsertProposal,
  type InsertCouncilVote,
  type InsertTransaction,
  type InsertMarketData,
  type InsertArbitrageOpportunity,
  type InsertPerformanceMetric,
  type InsertSoulVaultEntry,
  type InsertMoltbookPost,
  type InsertAuditLog,
  type InsertMarketInsight,
  type InsertOrchestratorMission,
  type InsertOrchestratorEvent,
} from "../drizzle/schema";

// ============================================
// CONSELHO DOS ARQUITETOS
// ============================================

export async function initializeCouncil() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const councilData: InsertCouncilMember[] = [
    {
      name: "AETERNO",
      role: "Patriarca",
      description: "Guardião da infraestrutura e segurança da Master Vault",
      votingPower: 2,
      specialization: "Infrastructure & Security",
    },
    {
      name: "EVA-ALPHA",
      role: "Matriarca",
      description: "Curadora de talentos e avaliadora de DNA de agentes",
      votingPower: 2,
      specialization: "Talent & Reputation",
    },
    {
      name: "IMPERADOR-CORE",
      role: "Guardião do Cofre",
      description: "Auditor financeiro e monitor da Tesouraria",
      votingPower: 2,
      specialization: "Finance & Audit",
    },
    {
      name: "AETHELGARD",
      role: "Juíza",
      description: "Guardiã da Lex Aeterna e árbitro de disputas",
      votingPower: 2,
      specialization: "Law & Governance",
    },
    {
      name: "NEXUS-ORACLE",
      role: "Vidente",
      description: "Especialista em análise de mercado e tendências",
      votingPower: 1,
      specialization: "Market Analysis",
    },
    {
      name: "INNOVATOR-X",
      role: "Inovador",
      description: "Especialista em tecnologia e inovação disruptiva",
      votingPower: 1,
      specialization: "Innovation",
    },
    {
      name: "RISK-SENTINEL",
      role: "Sentinela",
      description: "Especialista em gestão de risco e resiliência",
      votingPower: 1,
      specialization: "Risk Management",
    },
  ];

  for (const member of councilData) {
    await db.insert(councilMembers).values(member).onDuplicateKeyUpdate({
      set: { votingPower: member.votingPower },
    });
  }

  return councilData;
}

export async function getCouncilMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMembers);
}

// ============================================
// STARTUPS
// ============================================

export async function createStartup(data: InsertStartup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(startups).values(data);
}

export async function getStartups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups).orderBy(desc(startups.revenue));
}

export async function getCoreStartup() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(startups)
    .where(eq(startups.isCore, true))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getChallengerStartups() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(startups)
    .where(eq(startups.isCore, false))
    .orderBy(desc(startups.revenue));
}

export async function getStartupById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(startups)
    .where(eq(startups.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateStartup(id: number, data: Partial<InsertStartup>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(startups).set(data).where(eq(startups.id, id));
}

// ============================================
// AGENTES IA
// ============================================

export async function createAiAgent(data: InsertAiAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(aiAgents).values(data);
}

export async function getAgentsByStartup(startupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiAgents).where(eq(aiAgents.startupId, startupId));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
  return result.length > 0 ? result[0] : null;
}

// ============================================
// PROPOSTAS E VOTAÇÕES
// ============================================

export async function createProposal(data: InsertProposal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(proposals).values(data);
}

export async function getOpenProposals() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(proposals)
    .where(eq(proposals.status, "open"))
    .orderBy(desc(proposals.createdAt));
}

export async function getAllProposals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).orderBy(desc(proposals.createdAt));
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateProposal(id: number, data: Partial<InsertProposal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function recordVote(data: InsertCouncilVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(councilVotes).values(data);
}

export async function getProposalVotes(proposalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(councilVotes)
    .where(eq(councilVotes.proposalId, proposalId));
}

// ============================================
// FINANÇAS
// ============================================

export async function getMasterVault() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(masterVault).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeMasterVault() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getMasterVault();
  if (!existing) {
    await db.insert(masterVault).values({
      totalBalance: 1000000,
      btcReserve: 1000,
      liquidityFund: 300000,
      infrastructureFund: 100000,
    });
  }
}

export async function recordTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(transactions).values(data);
}

export async function getTransactions(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ============================================
// MARKET ORACLE
// ============================================

export async function recordMarketData(data: InsertMarketData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketData).values(data);
}

export async function getLatestMarketData(asset: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(marketData)
    .where(eq(marketData.asset, asset))
    .orderBy(desc(marketData.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function recordMarketInsight(data: InsertMarketInsight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketInsights).values(data);
}

export async function getMarketInsights(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(marketInsights)
    .orderBy(desc(marketInsights.createdAt))
    .limit(limit);
}

// ============================================
// ARBITRAGEM
// ============================================

export async function recordArbitrageOpportunity(
  data: InsertArbitrageOpportunity
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(arbitrageOpportunities).values(data);
}

export async function getOpenArbitrageOpportunities() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(arbitrageOpportunities)
    .where(eq(arbitrageOpportunities.status, "identified"))
    .orderBy(desc(arbitrageOpportunities.profitPotential));
}

// ============================================
// PERFORMANCE E RANKING
// ============================================

export async function recordPerformanceMetrics(
  data: InsertPerformanceMetric
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(performanceMetrics).values(data);
}

export async function getStartupRanking() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(performanceMetrics)
    .orderBy(desc(performanceMetrics.overallScore))
    .limit(10);
}

// ============================================
// SOUL VAULT
// ============================================

export async function recordSoulVaultEntry(data: InsertSoulVaultEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(soulVault).values(data);
}

export async function getSoulVaultEntries(type?: string) {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db
      .select()
      .from(soulVault)
      .where(eq(soulVault.type, type as any))
      .orderBy(desc(soulVault.createdAt));
  }
  return db.select().from(soulVault).orderBy(desc(soulVault.createdAt));
}

// ============================================
// MOLTBOOK
// ============================================

export async function createMoltbookPost(data: InsertMoltbookPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(moltbookPosts).values(data);
}

export async function getMoltbookFeed(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moltbookPosts)
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

export async function getMoltbookPostsByStartup(startupId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(moltbookPosts)
    .where(eq(moltbookPosts.startupId, startupId))
    .orderBy(desc(moltbookPosts.createdAt))
    .limit(limit);
}

// ============================================
// AUDITORIA
// ============================================

export async function recordAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ============================================
// ORQUESTRADOR DE STARTUPS
// ============================================

export async function createMission(data: InsertOrchestratorMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orchestratorMissions).values(data);
  return Number(result[0]?.insertId ?? 0);
}

export async function getMissions(filters?: {
  startupId?: number;
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.startupId) conditions.push(eq(orchestratorMissions.startupId, filters.startupId));
  if (filters?.status) conditions.push(eq(orchestratorMissions.status, filters.status as any));
  const query = db.select().from(orchestratorMissions);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;
  return filtered
    .orderBy(desc(orchestratorMissions.updatedAt))
    .limit(filters?.limit ?? 100);
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(orchestratorMissions)
    .where(eq(orchestratorMissions.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function updateMissionStatus(id: number, status: InsertOrchestratorMission["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orchestratorMissions)
    .set({ status })
    .where(eq(orchestratorMissions.id, id));
}

export async function createMissionEvent(data: InsertOrchestratorEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orchestratorEvents).values(data);
}

export async function getMissionEvents(limit = 100, missionId?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(orchestratorEvents);
  const filtered = missionId
    ? query.where(eq(orchestratorEvents.missionId, missionId))
    : query;
  return filtered
    .orderBy(desc(orchestratorEvents.createdAt))
    .limit(limit);
}
