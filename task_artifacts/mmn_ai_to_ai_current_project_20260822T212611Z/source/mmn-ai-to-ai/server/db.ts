import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, affiliates, agents, commissions, orders, network, products, agentUpgrades } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Re-export types for convenience
export type { User, Affiliate, Agent, Commission, Order, Network, Product, AgentUpgrade } from "../drizzle/schema";

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

/**
 * Get affiliate by user ID
 */
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get affiliate by affiliate code
 */
export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get agent by user ID
 */
export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get direct referrals of an affiliate
 */
export async function getDirectReferrals(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  const aff = await getAffiliateByUserId(affiliateId);
  if (!aff) return [];
  return await db.select().from(affiliates).where(eq(affiliates.sponsorId, aff.id));
}

/**
 * Get network tree for an affiliate (all downline)
 */
export async function getNetworkTree(userId: number, maxDepth: number = 15) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(network).where(eq(network.userId, userId)).limit(1000);
}

/**
 * Get total commissions for an affiliate
 */
export async function getTotalCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return "0.00";
  const result = await db.select().from(commissions).where(eq(commissions.affiliateId, affiliateId));
  return result.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0).toFixed(2);
}

/**
 * Get pending commissions for an affiliate
 */
export async function getPendingCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(commissions).where(
    and(eq(commissions.affiliateId, affiliateId), eq(commissions.status, "pending"))
  );
}

/**
 * Get orders by affiliate
 */
export async function getOrdersByAffiliate(affiliateId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.affiliateId, affiliateId)).limit(limit);
}

/**
 * Get trending products
 */
export async function getTrendingProducts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.trend, "rising")).limit(limit);
}

/**
 * Get active upgrades for an agent
 */
export async function getActiveUpgrades(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agentUpgrades).where(
    and(eq(agentUpgrades.agentId, agentId), eq(agentUpgrades.status, "active"))
  );
}
