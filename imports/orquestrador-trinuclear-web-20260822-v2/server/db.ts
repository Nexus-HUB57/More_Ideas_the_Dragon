import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bindCodes, bindHistory, nucleusStatus, activityLogs, creditHistory } from "../drizzle/schema";
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

// Bind Codes queries
export async function createBindCode(
  code: string,
  createdBy: number,
  expiresAt?: Date,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const format = `:bind ${code}`;
  const result = await db.insert(bindCodes).values({
    code,
    format,
    createdBy,
    expiresAt,
    description,
  });

  return result;
}

export async function getBindCodeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bindCodes).where(eq(bindCodes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBindCodeByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(bindCodes).where(eq(bindCodes.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBindCodes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bindCodes);
}

export async function updateBindCodeStatus(id: number, status: string, usedBy?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (status === "used") {
    updateData.usedAt = new Date();
    if (usedBy) updateData.usedBy = usedBy;
  }

  return await db.update(bindCodes).set(updateData).where(eq(bindCodes.id, id));
}

// Nucleus Status queries
export async function createOrUpdateNucleusStatus(
  nucleusId: string,
  name: string,
  type: "primary" | "secondary" | "tertiary" = "primary"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(nucleusStatus).where(eq(nucleusStatus.nucleusId, nucleusId)).limit(1);

  if (existing.length > 0) {
    return await db.update(nucleusStatus).set({ name, type }).where(eq(nucleusStatus.nucleusId, nucleusId));
  }

  return await db.insert(nucleusStatus).values({ nucleusId, name, type });
}

export async function getNucleusStatus(nucleusId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(nucleusStatus).where(eq(nucleusStatus.nucleusId, nucleusId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllNucleusStatus() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(nucleusStatus);
}

export async function updateNucleusHeartbeat(nucleusId: string, syncProgress?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { lastHeartbeat: new Date(), updatedAt: new Date() };
  if (syncProgress !== undefined) updateData.syncProgress = syncProgress;

  return await db.update(nucleusStatus).set(updateData).where(eq(nucleusStatus.nucleusId, nucleusId));
}

// Bind History queries
export async function createBindHistory(
  bindCodeId: number,
  nucleusId: string,
  status: "pending" | "sent" | "confirmed" | "failed" = "pending"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(bindHistory).values({ bindCodeId, nucleusId, status });
}

export async function getBindHistoryByCodeId(bindCodeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bindHistory).where(eq(bindHistory.bindCodeId, bindCodeId));
}

export async function getAllBindHistory() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bindHistory);
}

export async function updateBindHistoryStatus(
  id: number,
  status: "pending" | "sent" | "confirmed" | "failed",
  telegramResponse?: string,
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (telegramResponse) updateData.telegramResponse = telegramResponse;
  if (errorMessage) updateData.errorMessage = errorMessage;

  return await db.update(bindHistory).set(updateData).where(eq(bindHistory.id, id));
}

// Activity Logs queries
export async function createActivityLog(
  userId: number,
  action: string,
  description?: string,
  resourceType?: string,
  resourceId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(activityLogs).values({
    userId,
    action,
    description,
    resourceType,
    resourceId,
  });
}

export async function getActivityLogsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs).where(eq(activityLogs.userId, userId));
}

export async function getAllActivityLogs() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs);
}


export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];
  if (!user) return null;
  return {
    monthlyCredits: user.monthlyCredits,
    creditsUsed: user.creditsUsed,
    creditsAvailable: Math.max(0, user.monthlyCredits - user.creditsUsed),
    creditResetDate: user.creditResetDate,
  };
}

export async function consumeCredits(userId: number, amount: number, action: string, description?: string, bindCodeId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = result[0];
  if (!user) throw new Error("User not found");
  const now = new Date();
  let used = user.creditsUsed;
  let resetDate = user.creditResetDate;
  if (now >= resetDate) {
    used = 0;
    resetDate = new Date(now);
    resetDate.setMonth(resetDate.getMonth() + 1);
    await db.update(users).set({ creditsUsed: 0, creditResetDate: resetDate }).where(eq(users.id, userId));
  }
  const available = user.monthlyCredits - used;
  if (available < amount) throw new Error(`Créditos insuficientes. Disponível: ${Math.max(0, available)}; necessário: ${amount}.`);
  await db.update(users).set({ creditsUsed: used + amount }).where(eq(users.id, userId));
  await db.insert(creditHistory).values({ userId, action, creditsUsed: amount, description, bindCodeId });
  return { creditsConsumed: amount, creditsRemaining: available - amount };
}

export async function getCreditHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditHistory).where(eq(creditHistory.userId, userId));
}
