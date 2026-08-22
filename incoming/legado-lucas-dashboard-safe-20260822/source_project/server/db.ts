import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  financialData,
  funds,
  bitcoinAddresses,
  bitcoinTransactions,
  securityAlerts,
  dailyLimits,
  InsertFinancialData,
  InsertFund,
  InsertBitcoinAddress,
  InsertBitcoinTransaction,
  InsertSecurityAlert,
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

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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

// ============= Financial Data Queries =============
export async function getFinancialDataByYear(year: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(financialData)
    .where(eq(financialData.year, year))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllFinancialData() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialData).orderBy(financialData.year);
}

export async function upsertFinancialData(data: InsertFinancialData) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .insert(financialData)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        patrimonioLiquido: data.patrimonioLiquido,
        lucroAnual: data.lucroAnual,
        crescimentoPL: data.crescimentoPL,
        valorMercado: data.valorMercado,
        valorIntangivel: data.valorIntangivel,
        multiploVMPC: data.multiploVMPC,
      },
    });
}

// ============= Fund Queries =============
export async function getFundsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(funds).where(eq(funds.userId, userId));
}

export async function upsertFund(fund: InsertFund) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(funds).values(fund);
}

// ============= Bitcoin Address Queries =============
export async function getBitcoinAddressesByUser(userId: number, addressType?: "GENESIS" | "CERBERUS") {
  const db = await getDb();
  if (!db) return [];
  
  if (addressType) {
    return await db
      .select()
      .from(bitcoinAddresses)
      .where(and(
        eq(bitcoinAddresses.userId, userId),
        eq(bitcoinAddresses.addressType, addressType)
      ));
  }
  
  return await db.select().from(bitcoinAddresses).where(eq(bitcoinAddresses.userId, userId));
}

export async function getBitcoinAddressByAddress(address: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(bitcoinAddresses)
    .where(eq(bitcoinAddresses.address, address))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createBitcoinAddress(addr: InsertBitcoinAddress) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(bitcoinAddresses).values(addr);
}

export async function updateBitcoinAddressBalance(addressId: number, balance: string, balanceSats: string) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(bitcoinAddresses)
    .set({ balance, balanceSats, lastUpdated: new Date() })
    .where(eq(bitcoinAddresses.id, addressId));
}

// ============= Bitcoin Transaction Queries =============
export async function getTransactionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(bitcoinTransactions)
    .where(eq(bitcoinTransactions.userId, userId))
    .orderBy(bitcoinTransactions.createdAt);
}

export async function createBitcoinTransaction(tx: InsertBitcoinTransaction) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(bitcoinTransactions).values(tx);
}

export async function updateTransactionStatus(txId: number, status: string, confirmations: number, txidHash?: string) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: Record<string, unknown> = {
    status,
    confirmations,
    updatedAt: new Date(),
  };
  
  if (txidHash) {
    updateData.txid = txidHash;
  }
  
  if (status === "CONFIRMED") {
    updateData.confirmedAt = new Date();
  }
  
  await db.update(bitcoinTransactions).set(updateData).where(eq(bitcoinTransactions.id, txId));
}

// ============= Security Alert Queries =============
export async function createSecurityAlert(alert: InsertSecurityAlert) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(securityAlerts).values(alert);
}

export async function getSecurityAlertsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(securityAlerts)
    .where(eq(securityAlerts.userId, userId))
    .orderBy(securityAlerts.createdAt);
}

// ============= Daily Limit Queries =============
export async function getDailyLimitByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(dailyLimits)
    .where(eq(dailyLimits.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDailyLimit(userId: number, usedBtc: string, remainingBtc: string) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(dailyLimits)
    .set({ usedBtc, remainingBtc, updatedAt: new Date() })
    .where(eq(dailyLimits.userId, userId));
}
