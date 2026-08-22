import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  affiliates,
  products,
  sales,
  commissions,
  payments,
  lotteries,
  careerLevels,
  auditLog
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

// ============ AFFILIATE QUERIES ============

export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAffiliates() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(affiliates);
}

export async function getAffiliateNetwork(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  // Retorna toda a rede (diretos e indiretos) de um afiliado
  return await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.sponsorId, affiliateId));
}

// ============ PRODUCT QUERIES ============

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
  return await db.select().from(products).where(eq(products.status, "active"));
}

// ============ SALES QUERIES ============

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(sales)
    .where(eq(sales.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliatesSales(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sales)
    .where(eq(sales.affiliateId, affiliateId));
}

// ============ COMMISSION QUERIES ============

export async function getAffiliatesCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.affiliateId, affiliateId));
}

export async function getPendingCommissions() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(commissions)
    .where(eq(commissions.status, "pending"));
}

// ============ PAYMENT QUERIES ============

export async function getAffiliatesPayments(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(payments)
    .where(eq(payments.affiliateId, affiliateId));
}

// ============ LOTTERY QUERIES ============

export async function getAffiliateLotteries(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(lotteries)
    .where(eq(lotteries.affiliateId, affiliateId));
}

// ============ CAREER LEVEL QUERIES ============

export async function getCareerLevelByLevel(level: number) {
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
  return await db.select().from(careerLevels).orderBy(careerLevels.level);
}

// ============ AUDIT LOG QUERIES ============

export async function logAuditAction(
  userId: number | null,
  actionType: string,
  entityType: string,
  entityId: number | null,
  description: string | null,
  previousData: string | null,
  newData: string | null
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({
    userId: userId || undefined,
    actionType,
    entityType,
    entityId: entityId || undefined,
    description,
    previousData,
    newData,
  });
}


