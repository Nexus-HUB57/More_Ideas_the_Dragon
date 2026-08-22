import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, wallets, InsertWallet, Wallet, wifConversions, InsertWifConversion, WifConversion } from "../drizzle/schema";
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

/**
 * Add a new wallet for a user
 */
export async function addWallet(userId: number, wallet: Omit<InsertWallet, 'userId'>): Promise<Wallet | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add wallet: database not available");
    return null;
  }

  try {
    const result = await db.insert(wallets).values({
      ...wallet,
      userId,
    });
    
    // Fetch and return the inserted wallet
    const inserted = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    return inserted.length > 0 ? inserted[0] : null;
  } catch (error) {
    console.error("[Database] Failed to add wallet:", error);
    throw error;
  }
}

/**
 * Get all wallets for a user
 */
export async function getUserWallets(userId: number): Promise<Wallet[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get wallets: database not available");
    return [];
  }

  try {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get wallets:", error);
    throw error;
  }
}

/**
 * Save a WIF conversion record
 */
export async function saveWifConversion(
  userId: number,
  conversion: Omit<InsertWifConversion, 'userId'>
): Promise<WifConversion | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save WIF conversion: database not available");
    return null;
  }

  try {
    await db.insert(wifConversions).values({
      ...conversion,
      userId,
    });
    
    // Fetch and return the inserted record
    const inserted = await db
      .select()
      .from(wifConversions)
      .where(eq(wifConversions.userId, userId))
      .limit(1);
    
    return inserted.length > 0 ? inserted[0] : null;
  } catch (error) {
    console.error("[Database] Failed to save WIF conversion:", error);
    throw error;
  }
}

/**
 * Get WIF conversion history for a user
 */
export async function getUserWifConversions(userId: number): Promise<WifConversion[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get WIF conversions: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(wifConversions)
      .where(eq(wifConversions.userId, userId))
      .orderBy(desc(wifConversions.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get WIF conversions:", error);
    throw error;
  }
}
