import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  affiliates, InsertAffiliate,
  network, InsertNetwork,
  agents, InsertAgent,
  commissions, InsertCommission,
  payments, InsertPayment,
  orders, InsertOrder,
  bonuses, InsertBonus,
  upgrades, agentUpgrades,
  products,
  materials,
  notifications
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

// TODO: add feature queries here as your schema grows.

// ============ Affiliate Helpers ============

export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAffiliate(data: InsertAffiliate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliates).values(data);
  return (result as any).insertId;
}

// ============ Network Helpers ============

export async function getDirectReferrals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      affiliateCode: affiliates.affiliateCode,
      totalCommissions: affiliates.totalCommissions,
      createdAt: affiliates.createdAt
    })
    .from(network)
    .innerJoin(users, eq(network.userId, users.id))
    .innerJoin(affiliates, eq(affiliates.userId, users.id))
    .where(and(eq(network.sponsorId, userId), eq(network.level, 1)));
}

export async function getNetworkTree(userId: number, maxDepth: number = 15) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(network)
    .where(eq(network.sponsorId, userId))
    .orderBy(network.level);
}

// ============ Agent Helpers ============

export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(agents).values(data);
  return (result as any).insertId;
}

// ============ Commission Helpers ============

export async function getTotalCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`SUM(amount)` })
    .from(commissions)
    .where(and(eq(commissions.affiliateId, affiliateId), eq(commissions.status, "confirmed")));
  return result[0]?.total ?? 0;
}

export async function getPendingCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ total: sql<number>`SUM(amount)` })
    .from(commissions)
    .where(and(eq(commissions.affiliateId, affiliateId), eq(commissions.status, "pending")));
  return result[0]?.total ?? 0;
}

export async function getCommissionHistory(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.affiliateId, affiliateId))
    .orderBy(desc(commissions.createdAt));
}

// ============ Order Helpers ============

export async function getOrdersByAffiliate(affiliateId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(orders)
    .where(eq(orders.affiliateId, affiliateId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

// ============ Product Helpers ============

export async function getTrendingProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(products)
    .orderBy(desc(products.trending))
    .limit(limit);
}

// ============ Upgrade Helpers ============

export async function getActiveUpgrades(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: upgrades.id,
      name: upgrades.name,
      description: upgrades.description,
      category: upgrades.category,
      activatedAt: agentUpgrades.activatedAt,
      expiresAt: agentUpgrades.expiresAt
    })
    .from(agentUpgrades)
    .innerJoin(upgrades, eq(agentUpgrades.upgradeId, upgrades.id))
    .where(and(eq(agentUpgrades.agentId, agentId), eq(agentUpgrades.status, "active")));
}

// ============ Material Helpers ============

export async function getMaterialsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(materials)
    .where(eq(materials.affiliateId, affiliateId))
    .orderBy(desc(materials.createdAt));
}

// ============ Payment Helpers ============

export async function getPaymentsByAffiliate(affiliateId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq(payments.affiliateId, affiliateId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getConfirmedPaymentsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(and(eq(payments.affiliateId, affiliateId), eq(payments.status, "confirmed")))
    .orderBy(desc(payments.createdAt));
}

// ============ Notification Helpers ============

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return (result as any).insertId;
}

export async function getNotificationsByUser(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}
