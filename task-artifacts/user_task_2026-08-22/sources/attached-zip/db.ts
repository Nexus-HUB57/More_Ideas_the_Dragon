import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  agents,
  Agent,
  InsertAgent,
  startups,
  InsertStartup,
  missions,
  InsertMission,
  fundingRequests,
  InsertFundingRequest,
  agentCommunications,
  InsertAgentCommunication,
  networkTelemetry,
  InsertNetworkTelemetry,
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

// ============= AGENT QUERIES =============

export async function getAgentById(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.agentId, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listAgents(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).limit(limit).offset(offset);
}

export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(agents).values(data);
  return result;
}

export async function updateAgentVitals(agentId: string, vitals: Partial<Agent>) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.update(agents).set(vitals).where(eq(agents.agentId, agentId));
  return result;
}

// ============= STARTUP QUERIES =============

export async function getStartupById(startupId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(startups).where(eq(startups.startupId, startupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listStartups(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(startups).limit(limit).offset(offset);
}

export async function createStartup(data: InsertStartup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(startups).values(data);
}

// ============= MISSION QUERIES =============

export async function getMissionById(missionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missions).where(eq(missions.missionId, missionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listMissions(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missions).limit(limit).offset(offset);
}

export async function createMission(data: InsertMission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(missions).values(data);
}

// ============= FUNDING QUERIES =============

export async function getFundingRequestById(requestId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fundingRequests).where(eq(fundingRequests.requestId, requestId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listFundingRequests(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fundingRequests).limit(limit).offset(offset);
}

export async function createFundingRequest(data: InsertFundingRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fundingRequests).values(data);
}

export async function approveFundingRequest(requestId: string, approvedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(fundingRequests)
    .set({ status: "approved", approvedBy, approvedAt: new Date() })
    .where(eq(fundingRequests.requestId, requestId));
}

// ============= COMMUNICATION QUERIES =============

export async function listAgentCommunications(agentId: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentCommunications).where(eq(agentCommunications.agentId, agentId)).limit(limit).offset(offset);
}

export async function postAgentCommunication(data: InsertAgentCommunication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agentCommunications).values(data);
}

// ============= TELEMETRY QUERIES =============

export async function recordNetworkTelemetry(data: InsertNetworkTelemetry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(networkTelemetry).values(data);
}

export async function getNetworkMetrics(module: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(networkTelemetry).where(eq(networkTelemetry.module, module)).limit(limit);
}
