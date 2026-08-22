import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, wallets, addresses, transactions, utxos, operationHistory, masterKeys } from "../drizzle/schema";
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

// Wallet operations
export async function createWallet(
  userId: number,
  walletName: string,
  encryptedSeed: string,
  seedSalt: string,
  seedIv: string,
  xprv: string,
  xpub: string,
  walletType: string = "segwit",
  network: string = "mainnet"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(wallets).values({
    userId,
    name: walletName,
    encryptedSeed,
    seedSalt,
    seedIv,
    xprv,
    xpub,
    walletType,
    network,
  });
}

export async function getWalletsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(wallets).where(eq(wallets.userId, userId));
}

export async function getWalletById(walletId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Address operations
export async function createAddress(
  walletId: number,
  derivationPath: string,
  address: string,
  publicKey: string,
  encryptedPrivateKey: string,
  privatekeySalt: string,
  privatekeyIv: string,
  addressType: string = "receive"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(addresses).values({
    walletId,
    derivationPath,
    address,
    publicKey,
    encryptedPrivateKey,
    privatekeySalt,
    privatekeyIv,
    addressType,
  });
}

export async function getAddressesByWalletId(walletId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(addresses).where(eq(addresses.walletId, walletId));
}

export async function getAddressByAddress(address: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(addresses).where(eq(addresses.address, address)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Transaction operations
export async function createTransaction(
  walletId: number,
  txid: string,
  type: string,
  fromAddress: string | null,
  toAddress: string | null,
  amount: string,
  fee: string = "0",
  status: string = "pending"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(transactions).values({
    walletId,
    txid,
    type,
    fromAddress,
    toAddress,
    amount,
    fee,
    status,
    timestamp: new Date(),
  });
}

export async function getTransactionsByWalletId(walletId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(transactions).where(eq(transactions.walletId, walletId));
}

// UTXO operations
export async function createUTXO(
  addressId: number,
  txid: string,
  vout: number,
  amount: string,
  scriptPubkey: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(utxos).values({
    addressId,
    txid,
    vout,
    amount,
    scriptPubkey,
  });
}

export async function getUTXOsByAddressId(addressId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(utxos).where(eq(utxos.addressId, addressId));
}

// Operation history
export async function logOperation(
  walletId: number,
  operationType: string,
  description: string | null,
  status: string = "success",
  errorMessage: string | null = null,
  metadata: any = null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(operationHistory).values({
    walletId,
    operationType,
    description,
    status,
    errorMessage,
    metadata,
  });
}
