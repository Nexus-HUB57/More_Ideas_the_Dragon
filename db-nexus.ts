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