import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  sales,
  commissions,
  affiliateNetwork,
  careerLevels,
  lotteries,
  lotteryTickets,
  payments,
  teamPerformance,
  auditLog,
  User,
  Sale,
  Commission,
  Product,
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

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PRODUCTS ============
export async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SALES & COMMISSIONS ============
export async function createSale(sale: typeof sales.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sales).values(sale);
  return result;
}

export async function confirmSale(saleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sale = await db
    .select()
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);

  if (!sale.length) throw new Error("Sale not found");

  await db
    .update(sales)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(eq(sales.id, saleId));

  return sale[0];
}

export async function getUserSales(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(sales)
    .where(eq(sales.affiliateId, userId))
    .orderBy(desc(sales.createdAt));
}

export async function getUserCommissions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(commissions)
    .where(eq(commissions.recipientId, userId))
    .orderBy(desc(commissions.createdAt));
}

// ============ NETWORK STRUCTURE ============
export async function getAffiliateDownline(affiliateId: number, level?: number) {
  const db = await getDb();
  if (!db) return [];

  if (level !== undefined) {
    return db
      .select()
      .from(affiliateNetwork)
      .where(
        and(
          eq(affiliateNetwork.affiliateId, affiliateId),
          eq(affiliateNetwork.level, level)
        )
      )
      .orderBy(affiliateNetwork.level);
  }

  return db
    .select()
    .from(affiliateNetwork)
    .where(eq(affiliateNetwork.affiliateId, affiliateId))
    .orderBy(affiliateNetwork.level);
}

export async function getAffiliateUpline(affiliateId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const user = await getUserById(affiliateId);
  if (!user || !user.referrerId) return undefined;

  return getUserById(user.referrerId);
}

export async function createAffiliateRelationship(
  affiliateId: number,
  referrerId: number,
  level: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(affiliateNetwork).values({
    affiliateId,
    referrerId,
    level,
  });
}

// ============ COMMISSIONS CALCULATION ============
export async function calculateAndCreateCommissions(saleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sale = await db
    .select()
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);

  if (!sale.length) throw new Error("Sale not found");

  const saleData = sale[0];
  const affiliate = await getUserById(saleData.affiliateId);

  if (!affiliate) throw new Error("Affiliate not found");

  const careerLevel = await db
    .select()
    .from(careerLevels)
    .where(eq(careerLevels.level, affiliate.careerLevel))
    .limit(1);

  if (!careerLevel.length) throw new Error("Career level not found");

  const rates = {
    direct: parseFloat(careerLevel[0].directCommissionRate?.toString() || "10"),
    level2: parseFloat(careerLevel[0].level2CommissionRate?.toString() || "5"),
    level3: parseFloat(careerLevel[0].level3CommissionRate?.toString() || "2.5"),
    level4: parseFloat(careerLevel[0].level4CommissionRate?.toString() || "2.5"),
  };

  const commissionRecords: typeof commissions.$inferInsert[] = [];

  // Direct commission
  const saleAmount = typeof saleData.amount === 'string' ? parseFloat(saleData.amount) : saleData.amount;
  const directAmount = (saleAmount * rates.direct) / 100;
  commissionRecords.push({
    recipientId: saleData.affiliateId,
    saleId: saleData.id,
    affiliateId: saleData.affiliateId,
    commissionType: "direct",
    commissionRate: rates.direct.toString(),
    baseAmount: saleAmount.toString(),
    commissionAmount: directAmount.toString(),
    status: "pending",
  });

  // Network commissions (levels 2-4)
  let currentUpline = await getAffiliateUpline(saleData.affiliateId);
  let level = 2;

  while (currentUpline && level <= 4) {
    const rate = rates[`level${level}` as keyof typeof rates];
    const amount = (saleAmount * rate) / 100;

    commissionRecords.push({
      recipientId: currentUpline.id,
      saleId: saleData.id,
      affiliateId: saleData.affiliateId,
      commissionType: `level${level}` as any,
      commissionRate: rate.toString(),
      baseAmount: saleAmount.toString(),
      commissionAmount: amount.toString(),
      status: "pending",
    });

    currentUpline = await getAffiliateUpline(currentUpline.id);
    level++;
  }

  // Insert all commissions
  for (const commission of commissionRecords) {
    await db.insert(commissions).values(commission);
  }

  // Mark sale as processed
  await db
    .update(sales)
    .set({ commissionsCalculated: true })
    .where(eq(sales.id, saleId));

  return commissionRecords;
}

// ============ CAREER LEVELS ============
export async function getCareerLevels() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(careerLevels)
    .orderBy(careerLevels.level);
}

export async function getCareerLevelById(levelId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(careerLevels)
    .where(eq(careerLevels.id, levelId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ LOTTERIES ============
export async function getActiveLotteries() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(lotteries)
    .where(eq(lotteries.status, "active"))
    .orderBy(desc(lotteries.drawDate));
}

export async function getLotteryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(lotteries)
    .where(eq(lotteries.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserLotteryTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(lotteryTickets)
    .where(eq(lotteryTickets.ownerId, userId))
    .orderBy(desc(lotteryTickets.purchaseDate));
}

// ============ PAYMENTS ============
export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

export async function createPayment(payment: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(payments).values(payment);
}

// ============ TEAM PERFORMANCE ============
export async function getTeamPerformance(affiliateId: number, month: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(teamPerformance)
    .where(
      and(
        eq(teamPerformance.affiliateId, affiliateId),
        eq(teamPerformance.month, month)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AUDIT LOG ============
export async function logAuditEvent(
  userId: number | undefined,
  action: string,
  entityType: string,
  entityId?: number,
  details?: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLog).values({
      userId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error("[Audit Log] Failed to log event:", error);
  }
}


