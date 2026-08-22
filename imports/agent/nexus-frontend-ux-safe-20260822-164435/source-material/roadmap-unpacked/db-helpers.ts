import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  agents,
  missions,
  marketData,
  metrics,
  transactions,
  alerts,
  events,
  governance,
  type InsertAgent,
  type InsertMission,
  type InsertMarketData,
  type InsertMetric,
  type InsertTransaction,
  type InsertAlert,
  type InsertEvent,
  type InsertGovernance,
} from "../drizzle/schema";

/**
 * AGENTS - Helpers para gerenciamento de agentes
 */
export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agents).values(data);
  return result;
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result[0];
}

export async function getActiveAgents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(agents).where(eq(agents.status, "active"));
}

export async function updateAgentHealth(agentId: number, health: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(agents).set({ health }).where(eq(agents.id, agentId));
}

export async function updateAgentEnergy(agentId: number, energy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(agents).set({ energy }).where(eq(agents.id, agentId));
}

export async function updateAgentReputation(agentId: number, reputation: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(agents).set({ reputation }).where(eq(agents.id, agentId));
}

/**
 * MISSIONS - Helpers para gerenciamento de missões
 */
export async function createMission(data: InsertMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(missions).values(data);
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result[0];
}

export async function getPendingMissions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(missions).where(eq(missions.status, "pending"));
}

export async function updateMissionStatus(missionId: number, status: "pending" | "in_progress" | "completed" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(missions).set({ status }).where(eq(missions.id, missionId));
}

/**
 * MARKET DATA - Helpers para dados de mercado
 */
export async function saveMarketData(data: InsertMarketData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(marketData).values(data);
}

export async function getLatestMarketData(symbol: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(marketData)
    .where(eq(marketData.symbol, symbol))
    .orderBy(desc(marketData.timestamp))
    .limit(1);
  
  return result[0];
}

/**
 * METRICS - Helpers para métricas do ecossistema
 */
export async function saveMetrics(data: InsertMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(metrics).values(data);
}

export async function getLatestMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(metrics)
    .orderBy(desc(metrics.timestamp))
    .limit(1);
  
  return result[0];
}

export async function getMetricsHistory(hours: number = 24) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return await db
    .select()
    .from(metrics)
    .where(gte(metrics.timestamp, since))
    .orderBy(desc(metrics.timestamp));
}

/**
 * TRANSACTIONS - Helpers para transações
 */
export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(transactions).values(data);
}

export async function getAgentTransactions(agentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.agentId, agentId))
    .orderBy(desc(transactions.createdAt));
}

/**
 * ALERTS - Helpers para alertas
 */
export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(alerts).values(data);
}

export async function getUnreadAlerts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(alerts)
    .where(eq(alerts.isRead, 0))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(alerts).set({ isRead: 1 }).where(eq(alerts.id, alertId));
}

/**
 * EVENTS - Helpers para eventos do ecossistema
 */
export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(events).values(data);
}

export async function getRecentEvents(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(events)
    .orderBy(desc(events.createdAt))
    .limit(limit);
}

/**
 * GOVERNANCE - Helpers para governança (DAO)
 */
export async function createGovernanceProposal(data: InsertGovernance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(governance).values(data);
}

export async function getActiveProposals() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(governance)
    .where(eq(governance.status, "voting"))
    .orderBy(desc(governance.createdAt));
}
