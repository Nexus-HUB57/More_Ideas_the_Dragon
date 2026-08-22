import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Wallets table - stores Bitcoin wallets for users
 * Each wallet is derived from a seed phrase (BIP39/BIP32/BIP44)
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  masterWalletName: varchar("masterWalletName", { length: 255 }).default("FDR"),
  // Encrypted seed phrase (BIP39 mnemonic)
  encryptedSeed: text("encryptedSeed").notNull(),
  // Salt for PBKDF2 key derivation
  seedSalt: varchar("seedSalt", { length: 255 }).notNull(),
  // IV for AES encryption
  seedIv: varchar("seedIv", { length: 255 }).notNull(),
  // BIP32 root key (xprv)
  xprv: text("xprv"),
  // BIP32 public key (xpub)
  xpub: text("xpub"),
  // Wallet type: "legacy" (P2PKH), "segwit" (P2WPKH), "taproot" (P2TR)
  walletType: varchar("walletType", { length: 50 }).default("segwit"),
  // Network: "mainnet" or "testnet"
  network: varchar("network", { length: 50 }).default("mainnet"),
  // Total balance in satoshis
  totalBalance: varchar("totalBalance", { length: 50 }).default("0"),
  // Last sync timestamp
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Bitcoin addresses table - stores derived addresses from wallet
 * Each address is derived using BIP44 path: m/44'/0'/account'/change/index
 */
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  // BIP44 derivation path
  derivationPath: varchar("derivationPath", { length: 255 }).notNull(),
  // Bitcoin address (P2PKH, P2WPKH, or P2TR format)
  address: varchar("address", { length: 255 }).notNull().unique(),
  // Public key (hex)
  publicKey: text("publicKey").notNull(),
  // Encrypted private key (WIF format)
  encryptedPrivateKey: text("encryptedPrivateKey").notNull(),
  // Salt for PBKDF2 key derivation
  privatekeySalt: varchar("privatekeySalt", { length: 255 }).notNull(),
  // IV for AES encryption
  privatekeyIv: varchar("privatekeyIv", { length: 255 }).notNull(),
  // Address balance in satoshis
  balance: varchar("balance", { length: 50 }).default("0"),
  // Address type: "receive" or "change"
  addressType: varchar("addressType", { length: 50 }).default("receive"),
  // Is this address used (has transactions)
  isUsed: boolean("isUsed").default(false),
  // Last sync timestamp
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * UTXOs table - stores unspent transaction outputs
 * Used for transaction building and balance calculation
 */
export const utxos = mysqlTable("utxos", {
  id: int("id").autoincrement().primaryKey(),
  addressId: int("addressId").notNull(),
  // Transaction hash (txid)
  txid: varchar("txid", { length: 255 }).notNull(),
  // Output index (vout)
  vout: int("vout").notNull(),
  // Amount in satoshis
  amount: varchar("amount", { length: 50 }).notNull(),
  // Script pubkey (hex)
  scriptPubkey: text("scriptPubkey").notNull(),
  // Confirmation count
  confirmations: int("confirmations").default(0),
  // Is this UTXO spent
  isSpent: boolean("isSpent").default(false),
  // Block height where UTXO was created
  blockHeight: int("blockHeight"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UTXO = typeof utxos.$inferSelect;
export type InsertUTXO = typeof utxos.$inferInsert;

/**
 * Transactions table - stores Bitcoin transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  // Transaction hash (txid)
  txid: varchar("txid", { length: 255 }).notNull().unique(),
  // Raw transaction hex
  rawTx: text("rawTx"),
  // Transaction type: "send" or "receive"
  type: varchar("type", { length: 50 }).notNull(),
  // From address
  fromAddress: varchar("fromAddress", { length: 255 }),
  // To address
  toAddress: varchar("toAddress", { length: 255 }),
  // Amount in satoshis
  amount: varchar("amount", { length: 50 }).notNull(),
  // Transaction fee in satoshis
  fee: varchar("fee", { length: 50 }).default("0"),
  // Transaction status: "pending", "confirmed", "failed"
  status: varchar("status", { length: 50 }).default("pending"),
  // Block height (null if not confirmed)
  blockHeight: int("blockHeight"),
  // Confirmation count
  confirmations: int("confirmations").default(0),
  // Timestamp when transaction was created
  timestamp: timestamp("timestamp"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Operation history table - audit log for all wallet operations
 */
export const operationHistory = mysqlTable("operationHistory", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  // Operation type: "create_wallet", "import_wallet", "generate_address", "send_transaction", etc
  operationType: varchar("operationType", { length: 255 }).notNull(),
  // Operation description
  description: text("description"),
  // Operation status: "success", "failed", "pending"
  status: varchar("status", { length: 50 }).default("success"),
  // Error message if operation failed
  errorMessage: text("errorMessage"),
  // Additional metadata as JSON
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OperationHistory = typeof operationHistory.$inferSelect;
export type InsertOperationHistory = typeof operationHistory.$inferInsert;

/**
 * Master Key table - stores encrypted master key for all private keys
 * Protected by passphrase: '[REDACTED: use a runtime secret outside version control]'
 */
export const masterKeys = mysqlTable("masterKeys", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  // Encrypted master key
  encryptedMasterKey: text("encryptedMasterKey").notNull(),
  // Salt for PBKDF2 key derivation
  salt: varchar("salt", { length: 255 }).notNull(),
  // IV for AES encryption
  iv: varchar("iv", { length: 255 }).notNull(),
  // Passphrase hint (not the actual passphrase)
  passphraseHint: varchar("passphraseHint", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MasterKey = typeof masterKeys.$inferSelect;
export type InsertMasterKey = typeof masterKeys.$inferInsert;