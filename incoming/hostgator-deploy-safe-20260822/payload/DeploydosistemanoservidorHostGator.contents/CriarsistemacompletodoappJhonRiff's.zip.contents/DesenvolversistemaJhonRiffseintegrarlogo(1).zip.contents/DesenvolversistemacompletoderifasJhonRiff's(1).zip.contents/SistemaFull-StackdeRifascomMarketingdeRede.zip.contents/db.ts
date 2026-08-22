import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  sales,
  affiliateNetwork,
  commissions,
  careerLevels,
  lotteries,
  lotteryTickets,
  payments,
  teamPerformance,
  auditLog,
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

// ============================================================================
// USER OPERATIONS
// ============================================================================

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

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users);
}

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export async function createProduct(product: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(products).values(product);
  return result;
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

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products).where(eq(products.isActive, true));
}

// ============================================================================
// SALES OPERATIONS
// ============================================================================

export async function createSale(sale: typeof sales.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(sales).values(sale);
  return result;
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSalesByAffiliateId(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sales)
    .where(eq(sales.affiliateId, affiliateId))
    .orderBy(desc(sales.createdAt));
}

export async function updateSaleStatus(
  saleId: number,
  status: "pending" | "confirmed" | "failed",
  confirmedAt?: Date
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (confirmedAt) {
    updateData.confirmedAt = confirmedAt;
  }

  return await db.update(sales).set(updateData).where(eq(sales.id, saleId));
}

// ============================================================================
// AFFILIATE NETWORK OPERATIONS
// ============================================================================

export async function createAffiliateRelationship(
  affiliateId: number,
  referrerId: number
) {
  const db = await getDb();
  if (!db) return null;

  // Determine level based on referrer's network
  const referrerNetwork = await db
    .select()
    .from(affiliateNetwork)
    .where(eq(affiliateNetwork.affiliateId, referrerId))
    .limit(1);

  const level = referrerNetwork.length > 0 ? referrerNetwork[0].level + 1 : 1;

  return await db.insert(affiliateNetwork).values({
    affiliateId,
    referrerId,
    level,
  });
}

export async function getAffiliateNetwork(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(affiliateNetwork)
    .where(eq(affiliateNetwork.affiliateId, affiliateId));
}

export async function getDirectReferrals(referrerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(affiliateNetwork)
    .where(eq(affiliateNetwork.referrerId, referrerId));
}

// ============================================================================
// COMMISSION OPERATIONS
// ============================================================================

export async function createCommission(
  commission: typeof commissions.$inferInsert
) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(commissions).values(commission);
}

export async function getCommissionsBySaleId(saleId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.saleId, saleId));
}

export async function getCommissionsByRecipientId(recipientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.recipientId, recipientId))
    .orderBy(desc(commissions.createdAt));
}

export async function updateCommissionStatus(
  commissionId: number,
  status: "pending" | "paid" | "cancelled",
  paidAt?: Date
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (paidAt) {
    updateData.paidAt = paidAt;
  }

  return await db
    .update(commissions)
    .set(updateData)
    .where(eq(commissions.id, commissionId));
}

// ============================================================================
// CAREER LEVEL OPERATIONS
// ============================================================================

export async function getCareerLevel(level: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(careerLevels)
    .where(eq(careerLevels.level, level))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCareerLevels() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(careerLevels).orderBy(asc(careerLevels.level));
}

// ============================================================================
// LOTTERY OPERATIONS
// ============================================================================

export async function createLottery(lottery: typeof lotteries.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(lotteries).values(lottery);
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

export async function getActiveLotteries() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(lotteries)
    .where(eq(lotteries.status, "active"))
    .orderBy(desc(lotteries.drawDate));
}

// ============================================================================
// LOTTERY TICKET OPERATIONS
// ============================================================================

export async function createLotteryTicket(
  ticket: typeof lotteryTickets.$inferInsert
) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(lotteryTickets).values(ticket);
}

export async function getLotteryTicketsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(lotteryTickets)
    .where(eq(lotteryTickets.ownerId, ownerId))
    .orderBy(desc(lotteryTickets.purchaseDate));
}

export async function getLotteryTicketsByLotteryId(lotteryId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(lotteryTickets)
    .where(eq(lotteryTickets.lotteryId, lotteryId));
}

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

export async function createPayment(payment: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(payments).values(payment);
}

export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}

export async function updatePaymentStatus(
  paymentId: number,
  status: "pending" | "processed" | "failed",
  processedAt?: Date
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (processedAt) {
    updateData.processedAt = processedAt;
  }

  return await db
    .update(payments)
    .set(updateData)
    .where(eq(payments.id, paymentId));
}

// ============================================================================
// TEAM PERFORMANCE OPERATIONS
// ============================================================================

export async function createTeamPerformance(
  performance: typeof teamPerformance.$inferInsert
) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(teamPerformance).values(performance);
}

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

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

export async function logAuditEvent(
  log: typeof auditLog.$inferInsert
) {
  const db = await getDb();
  if (!db) return null;

  return await db.insert(auditLog).values(log);
}

// ============================================================================
// BALANCE UPDATE OPERATIONS
// ============================================================================

export async function updateUserBalance(
  userId: number,
  amount: number,
  type: "add" | "subtract"
) {
  const db = await getDb();
  if (!db) return null;

  const user = await getUserById(userId);
  if (!user) return null;

  const currentBalance = parseFloat(user.totalBalance.toString());
  const newBalance =
    type === "add" ? currentBalance + amount : currentBalance - amount;

  return await db
    .update(users)
    .set({ totalBalance: newBalance.toString() })
    .where(eq(users.id, userId));
}
