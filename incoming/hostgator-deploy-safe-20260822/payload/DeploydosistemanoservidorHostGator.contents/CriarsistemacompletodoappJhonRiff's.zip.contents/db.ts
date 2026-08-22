import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  products,
  sales,
  commissions,
  networkRelations,
  luckyNumbers,
  userPurchases,
  transactions,
  UserProfile,
  Product,
  Sale,
  Commission,
  Transaction,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get or create user profile for a user
 */
export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  // Create default profile if doesn't exist
  await db.insert(userProfiles).values({
    userId,
    careerLevel: "inscrito",
    points: 0,
    totalInvested: "0.00",
  });

  return await getUserProfile(userId);
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt));
}

/**
 * Get product by ID
 */
export async function getProductById(productId: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user's sales
 */
export async function getUserSales(userId: number): Promise<Sale[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sales)
    .where(eq(sales.userId, userId))
    .orderBy(desc(sales.createdAt));
}

/**
 * Get user's commissions
 */
export async function getUserCommissions(userId: number): Promise<Commission[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.userId, userId))
    .orderBy(desc(commissions.createdAt));
}

/**
 * Get total commission amount for a user
 */
export async function getUserTotalCommissions(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "0.00";

  const result = await db
    .select({
      total: sql<string>`SUM(amount)`,
    })
    .from(commissions)
    .where(
      and(
        eq(commissions.userId, userId),
        eq(commissions.status, "paid")
      )
    );

  return result[0]?.total || "0.00";
}

/**
 * Get user's direct downline (first level)
 */
export async function getUserDirectDownline(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ downlineId: networkRelations.downlineId })
    .from(networkRelations)
    .where(
      and(
        eq(networkRelations.uplineId, userId),
        eq(networkRelations.level, 1)
      )
    );

  return result.map((r) => r.downlineId);
}

/**
 * Get user's entire downline network
 */
export async function getUserDownlineNetwork(userId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ downlineId: networkRelations.downlineId })
    .from(networkRelations)
    .where(eq(networkRelations.uplineId, userId));

  return result.map((r) => r.downlineId);
}

/**
 * Get user's upline
 */
export async function getUserUpline(userId: number): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const profile = await getUserProfile(userId);
  return profile?.uplineId ?? undefined;
}

/**
 * Create a sale record
 */
export async function createSale(
  userId: number,
  productId: number,
  amount: string
): Promise<Sale | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(sales).values({
    userId,
    productId,
    amount: amount as any,
    commission: "0.00" as any,
    status: "pending",
  });

  const saleId = (result as any).insertId;
  return getSaleById(saleId);
}

/**
 * Get sale by ID
 */
export async function getSaleById(saleId: number): Promise<Sale | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Confirm a sale and calculate commissions
 */
export async function confirmSale(saleId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const sale = await getSaleById(saleId);
  if (!sale) return false;

  // Update sale status
  await db
    .update(sales)
    .set({ status: "confirmed" })
    .where(eq(sales.id, saleId));

  // Calculate and create commissions
  await calculateAndCreateCommissions(sale.userId, saleId, sale.amount);

  return true;
}

/**
 * Calculate commissions for a sale using Unilevel structure
 */
async function calculateAndCreateCommissions(
  userId: number,
  saleId: number,
  saleAmount: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const amount = parseFloat(saleAmount);

  // Direct commission (10%)
  const directCommission = (amount * 0.1).toFixed(2);
  await db.insert(commissions).values({
    userId,
    saleId,
    amount: directCommission as any,
    level: 0,
    type: "direct",
    status: "pending",
  });

  // Unilevel commissions (10%, 5%, 2.5%, 2.5%)
  const commissionRates = [0.1, 0.05, 0.025, 0.025];
  let currentUserId = userId;

  for (let level = 0; level < commissionRates.length; level++) {
    const uplineId = await getUserUpline(currentUserId);
    if (!uplineId) break;

    const commissionAmount = (amount * commissionRates[level]).toFixed(2);
    await db.insert(commissions).values({
      userId: uplineId,
      saleId,
      amount: commissionAmount as any,
      level: level + 1,
      type: "unilevel",
      status: "pending",
    });

    currentUserId = uplineId;
  }
}

/**
 * Get user's transactions
 */
export async function getUserTransactions(userId: number): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));
}

/**
 * Create a transaction record
 */
export async function createTransaction(
  userId: number,
  type: "sale" | "commission" | "bonus" | "withdrawal" | "refund",
  amount: string,
  description?: string
): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(transactions).values({
    userId,
    type,
    amount: amount as any,
    description,
    status: "pending",
  });

  const transactionId = (result as any).insertId;
  const txResult = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);

  return txResult.length > 0 ? txResult[0] : undefined;
}

/**
 * Get user's lucky numbers
 */
export async function getUserLuckyNumbers(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(luckyNumbers)
    .where(eq(luckyNumbers.userId, userId))
    .orderBy(desc(luckyNumbers.drawDate));
}

/**
 * Get user's purchased products
 */
export async function getUserPurchasedProducts(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      product: products,
      purchase: userPurchases,
    })
    .from(userPurchases)
    .innerJoin(products, eq(userPurchases.productId, products.id))
    .where(eq(userPurchases.userId, userId))
    .orderBy(desc(userPurchases.purchaseDate));
}

/**
 * Check if user has purchased a product
 */
export async function hasUserPurchasedProduct(
  userId: number,
  productId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(userPurchases)
    .where(
      and(
        eq(userPurchases.userId, userId),
        eq(userPurchases.productId, productId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Record a user purchase
 */
export async function recordUserPurchase(
  userId: number,
  productId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(userPurchases).values({
      userId,
      productId,
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to record purchase:", error);
    return false;
  }
}
