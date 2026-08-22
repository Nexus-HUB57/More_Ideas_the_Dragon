import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  agentVitals,
  agentSkills,
  startups,
  startupMilestones,
  missions,
  agentCommunications,
  networkTelemetry,
  fundingRequests,
  fundingAllocations,
  bitcoinWallet,
  bitcoinTransactions,
  agentMissionHistory,
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

// ============ AGENTS ============

export async function listAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createAgent(data: {
  name: string;
  specialization: string;
  dnaSequence?: string;
  parentAgentId1?: number;
  parentAgentId2?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(agents).values(data);
  return result;
}

export async function updateAgentVitals(agentId: number, vitals: {
  brainPulse?: string | number;
  energy?: string | number;
  creativity?: string | number;
  focus?: string | number;
  responseTime?: number;
  errorRate?: string | number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentVitals).values({
    agentId,
    brainPulse: vitals.brainPulse ? String(vitals.brainPulse) : undefined,
    energy: vitals.energy ? String(vitals.energy) : undefined,
    creativity: vitals.creativity ? String(vitals.creativity) : undefined,
    focus: vitals.focus ? String(vitals.focus) : undefined,
    responseTime: vitals.responseTime,
    errorRate: vitals.errorRate ? String(vitals.errorRate) : undefined,
  });
}

export async function getAgentVitals(agentId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(agentVitals)
    .where(eq(agentVitals.agentId, agentId))
    .orderBy(desc(agentVitals.timestamp))
    .limit(limit);
}

export async function addAgentSkill(agentId: number, skillName: string, proficiency: string | number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentSkills).values({
    agentId,
    skillName,
    proficiency: String(proficiency),
  });
}

export async function getAgentSkills(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentSkills).where(eq(agentSkills.agentId, agentId));
}

// ============ STARTUPS ============

export async function listStartups() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups).orderBy(desc(startups.createdAt));
}

export async function getStartupById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startups).where(eq(startups.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createStartup(data: {
  name: string;
  description?: string;
  status?: "ideation" | "development" | "launch" | "growth" | "mature";
  leaderId?: number;
  fundingGoal: string | number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(startups).values({
    name: data.name,
    description: data.description,
    status: data.status || "development",
    leaderId: data.leaderId,
    fundingGoal: String(data.fundingGoal),
  });
}

export async function updateStartupStatus(id: number, status: "ideation" | "development" | "launch" | "growth" | "mature") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(startups).set({ status }).where(eq(startups.id, id));
}

export async function getStartupMilestones(startupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startupMilestones).where(eq(startupMilestones.startupId, startupId));
}

export async function createStartupMilestone(data: {
  startupId: number;
  title: string;
  description?: string;
  targetDate?: Date;
  financialTarget?: string | number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(startupMilestones).values({
    startupId: data.startupId,
    title: data.title,
    description: data.description,
    targetDate: data.targetDate,
    financialTarget: data.financialTarget ? String(data.financialTarget) : undefined,
    status: "pending",
  });
}

// ============ MISSIONS ============

export async function listMissions(filter?: { status?: "created" | "assigned" | "in_progress" | "completed" | "failed"; assignedAgentId?: number }) {
  const db = await getDb();
  if (!db) return [];

  if (filter?.status && filter?.assignedAgentId) {
    return db
      .select()
      .from(missions)
      .where(
        and(
          eq(missions.status, filter.status),
          eq(missions.assignedAgentId, filter.assignedAgentId)
        )
      )
      .orderBy(desc(missions.createdAt));
  }

  if (filter?.status) {
    return db
      .select()
      .from(missions)
      .where(eq(missions.status, filter.status))
      .orderBy(desc(missions.createdAt));
  }

  if (filter?.assignedAgentId) {
    return db
      .select()
      .from(missions)
      .where(eq(missions.assignedAgentId, filter.assignedAgentId))
      .orderBy(desc(missions.createdAt));
  }

  return db.select().from(missions).orderBy(desc(missions.createdAt));
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMission(data: {
  title: string;
  description?: string;
  creatorAgentId: number;
  requiredSkills?: string;
  priority?: "low" | "medium" | "high" | "critical";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(missions).values({
    title: data.title,
    description: data.description,
    creatorAgentId: data.creatorAgentId,
    requiredSkills: data.requiredSkills,
    priority: data.priority || "medium",
    status: "created",
  });
}

export async function assignMission(missionId: number, agentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(missions)
    .set({ assignedAgentId: agentId, status: "assigned" })
    .where(eq(missions.id, missionId));
}

export async function updateMissionProgress(missionId: number, progress: number, status?: "created" | "assigned" | "in_progress" | "completed" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { progress };
  if (status) updateData.status = status;
  return db.update(missions).set(updateData).where(eq(missions.id, missionId));
}

// ============ COMMUNICATIONS ============

export async function postMoltbook(senderId: number, content: string, receiverId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentCommunications).values({
    senderId,
    receiverId,
    messageType: "moltbook",
    content,
  });
}

export async function postGnox(senderId: number, content: string, gnoxDialect: string, receiverId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentCommunications).values({
    senderId,
    receiverId,
    messageType: "gnox",
    content,
    gnoxDialect,
  });
}

export async function getMoltbookFeed(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(agentCommunications)
    .where(eq(agentCommunications.messageType, "moltbook"))
    .orderBy(desc(agentCommunications.createdAt))
    .limit(limit);
}

export async function getSystemAlerts(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(agentCommunications)
    .where(eq(agentCommunications.isSystemAlert, true))
    .orderBy(desc(agentCommunications.createdAt))
    .limit(limit);
}

// ============ TELEMETRY ============

export async function recordNetworkTelemetry(data: {
  moduleName: "rRPC_Core" | "Sigma_Sync" | "DeFAI_Link" | "Burn_Engine";
  strength?: string | number;
  status?: "nominal" | "active" | "degraded" | "offline";
  impact?: string;
  metrics?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(networkTelemetry).values({
    moduleName: data.moduleName,
    strength: data.strength ? String(data.strength) : undefined,
    status: data.status,
    impact: data.impact,
    metrics: data.metrics,
  });
}

export async function getNetworkTelemetry(moduleName?: "rRPC_Core" | "Sigma_Sync" | "DeFAI_Link" | "Burn_Engine", limit = 100) {
  const db = await getDb();
  if (!db) return [];

  if (moduleName) {
    return db
      .select()
      .from(networkTelemetry)
      .where(eq(networkTelemetry.moduleName, moduleName))
      .orderBy(desc(networkTelemetry.timestamp))
      .limit(limit);
  }

  return db.select().from(networkTelemetry).orderBy(desc(networkTelemetry.timestamp)).limit(limit);
}

export async function getLatestNetworkMetrics() {
  const db = await getDb();
  if (!db) return [];

  const modules: ("rRPC_Core" | "Sigma_Sync" | "DeFAI_Link" | "Burn_Engine")[] = ["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"];
  const results = [];

  for (const module of modules) {
    const latest = await db
      .select()
      .from(networkTelemetry)
      .where(eq(networkTelemetry.moduleName, module))
      .orderBy(desc(networkTelemetry.timestamp))
      .limit(1);

    if (latest.length > 0) {
      results.push(latest[0]);
    }
  }

  return results;
}

// ============ FUNDING ============

export async function createFundingRequest(data: {
  startupId: number;
  requestedAmount: string | number;
  purpose: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fundingRequests).values({
    startupId: data.startupId,
    requestedAmount: String(data.requestedAmount),
    purpose: data.purpose,
    status: "pending",
  });
}

export async function listFundingRequests(status?: "pending" | "approved" | "rejected" | "allocated") {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db
      .select()
      .from(fundingRequests)
      .where(eq(fundingRequests.status, status))
      .orderBy(desc(fundingRequests.createdAt));
  }

  return db.select().from(fundingRequests).orderBy(desc(fundingRequests.createdAt));
}

export async function approveFundingRequest(
  requestId: number,
  approvedAmount: string | number,
  approverAdminId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(fundingRequests)
    .set({
      status: "approved",
      approvedAmount: String(approvedAmount),
      approverAdminId,
      approvalDate: new Date(),
    })
    .where(eq(fundingRequests.id, requestId));
}

export async function rejectFundingRequest(requestId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(fundingRequests)
    .set({
      status: "rejected",
      rejectionReason: reason,
    })
    .where(eq(fundingRequests.id, requestId));
}

export async function allocateFunding(data: {
  fundingRequestId: number;
  startupId: number;
  allocatedAmount: string | number;
  bitcoinAddress: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fundingAllocations).values({
    fundingRequestId: data.fundingRequestId,
    startupId: data.startupId,
    allocatedAmount: String(data.allocatedAmount),
    bitcoinAddress: data.bitcoinAddress,
    status: "pending",
  });
}

export async function updateFundingAllocationTransaction(
  allocationId: number,
  transactionHash: string,
  transactionHex: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(fundingAllocations)
    .set({
      transactionHash,
      transactionHex,
      status: "broadcast",
      broadcastAt: new Date(),
    })
    .where(eq(fundingAllocations.id, allocationId));
}

// ============ BITCOIN WALLET ============

export async function createBitcoinWallet(data: {
  walletName: string;
  publicAddress: string;
  masterKeyEncrypted: string;
  network?: "mainnet" | "testnet";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bitcoinWallet).values({
    walletName: data.walletName,
    publicAddress: data.publicAddress,
    masterKeyEncrypted: data.masterKeyEncrypted,
    network: data.network || "mainnet",
    walletType: "custodial",
    isActive: true,
  });
}

export async function getBitcoinWallet(publicAddress: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(bitcoinWallet)
    .where(eq(bitcoinWallet.publicAddress, publicAddress))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveBitcoinWallet() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(bitcoinWallet)
    .where(eq(bitcoinWallet.isActive, true))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function recordBitcoinTransaction(data: {
  fundingAllocationId?: number;
  fromAddress: string;
  toAddress: string;
  amount: string | number;
  transactionHex: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bitcoinTransactions).values({
    fundingAllocationId: data.fundingAllocationId,
    fromAddress: data.fromAddress,
    toAddress: data.toAddress,
    amount: String(data.amount),
    transactionHex: data.transactionHex,
    status: "unsigned",
  });
}

// ============ MISSION HISTORY ============

export async function recordMissionCompletion(data: {
  agentId: number;
  missionId: number;
  completionStatus: "completed" | "failed" | "abandoned";
  performanceScore?: string | number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentMissionHistory).values({
    agentId: data.agentId,
    missionId: data.missionId,
    completionStatus: data.completionStatus,
    completionDate: new Date(),
    performanceScore: data.performanceScore ? String(data.performanceScore) : undefined,
    notes: data.notes,
  });
}

export async function getAgentMissionHistory(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(agentMissionHistory)
    .where(eq(agentMissionHistory.agentId, agentId))
    .orderBy(desc(agentMissionHistory.completionDate));
}
