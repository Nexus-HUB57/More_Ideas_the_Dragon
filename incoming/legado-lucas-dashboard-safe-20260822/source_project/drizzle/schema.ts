import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
 * Tabela de Dados Financeiros - KPIs por ano (Ano 0 ao Ano 10)
 */
export const financialData = mysqlTable("financial_data", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(), // 0 a 10
  patrimonioLiquido: varchar("patrimonio_liquido", { length: 64 }).notNull(), // R$ em string para precisão
  lucroAnual: varchar("lucro_anual", { length: 64 }).notNull(),
  crescimentoPL: varchar("crescimento_pl", { length: 32 }).notNull(), // Percentual
  valorMercado: varchar("valor_mercado", { length: 64 }).notNull(),
  valorIntangivel: varchar("valor_intangivel", { length: 64 }).notNull(),
  multiploVMPC: varchar("multiplo_vm_pc", { length: 32 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = typeof financialData.$inferInsert;

/**
 * Tabela de Fundos - Estrutura dual (FP, FS, FIQ, Endowment)
 */
export const funds = mysqlTable("funds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  fundType: mysqlEnum("fund_type", ["FP", "FS", "FIQ", "ENDOWMENT"]).notNull(), // Tipo de fundo
  fundName: varchar("fund_name", { length: 128 }).notNull(),
  description: text("description"),
  totalValue: varchar("total_value", { length: 64 }).notNull(), // R$ em string
  allocationPercentage: varchar("allocation_percentage", { length: 32 }).notNull(), // %
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Fund = typeof funds.$inferSelect;
export type InsertFund = typeof funds.$inferInsert;

/**
 * Tabela de Endereços Bitcoin - Gênesis (Hot Wallet) e Cerberus (Cold Storage)
 */
export const bitcoinAddresses = mysqlTable("bitcoin_addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  addressType: mysqlEnum("address_type", ["GENESIS", "CERBERUS"]).notNull(),
  address: varchar("address", { length: 128 }).notNull().unique(),
  label: varchar("label", { length: 256 }),
  publicKey: text("public_key"),
  derivationPath: varchar("derivation_path", { length: 128 }), // BIP44 path
  balance: varchar("balance", { length: 64 }).default("0"), // BTC em string
  balanceSats: varchar("balance_sats", { length: 64 }).default("0"), // Satoshis
  isActive: int("is_active").default(1), // 1 = true, 0 = false
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BitcoinAddress = typeof bitcoinAddresses.$inferSelect;
export type InsertBitcoinAddress = typeof bitcoinAddresses.$inferInsert;

/**
 * Tabela de Chaves Privadas - Criptografadas
 */
export const privateKeys = mysqlTable("private_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  addressId: int("address_id").notNull().references(() => bitcoinAddresses.id),
  encryptedKey: text("encrypted_key").notNull(), // WIF criptografado
  keyType: mysqlEnum("key_type", ["WIF", "XPRV", "SEED"]).notNull(),
  isMasterKey: int("is_master_key").default(0), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrivateKey = typeof privateKeys.$inferSelect;
export type InsertPrivateKey = typeof privateKeys.$inferInsert;

/**
 * Tabela de Transações Bitcoin
 */
export const bitcoinTransactions = mysqlTable("bitcoin_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  fromAddressId: int("from_address_id").notNull().references(() => bitcoinAddresses.id),
  toAddress: varchar("to_address", { length: 128 }).notNull(),
  txid: varchar("txid", { length: 128 }).unique(),
  amount: varchar("amount", { length: 64 }).notNull(), // BTC
  amountSats: varchar("amount_sats", { length: 64 }).notNull(), // Satoshis
  fee: varchar("fee", { length: 64 }).notNull(), // BTC
  feeSats: varchar("fee_sats", { length: 64 }).notNull(), // Satoshis
  status: mysqlEnum("status", ["PENDING", "CONFIRMED", "FAILED", "CANCELLED"]).default("PENDING"),
  confirmations: int("confirmations").default(0),
  broadcastService: varchar("broadcast_service", { length: 64 }), // Blockchair, mempool.space, etc
  rawTxHex: text("raw_tx_hex"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BitcoinTransaction = typeof bitcoinTransactions.$inferSelect;
export type InsertBitcoinTransaction = typeof bitcoinTransactions.$inferInsert;

/**
 * Tabela de Limites Diários (Guardian Protocol)
 */
export const dailyLimits = mysqlTable("daily_limits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  limitBtc: varchar("limit_btc", { length: 64 }).notNull(), // BTC máximo por dia
  usedBtc: varchar("used_btc", { length: 64 }).default("0"),
  remainingBtc: varchar("remaining_btc", { length: 64 }).notNull(),
  resetDate: timestamp("reset_date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyLimit = typeof dailyLimits.$inferSelect;
export type InsertDailyLimit = typeof dailyLimits.$inferInsert;

/**
 * Tabela de Alertas e Eventos de Segurança
 */
export const securityAlerts = mysqlTable("security_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  alertType: mysqlEnum("alert_type", [
    "TRANSACTION_LIMIT_EXCEEDED",
    "UNAUTHORIZED_ACCESS_ATTEMPT",
    "CRITICAL_OPERATION",
    "KEY_ROTATION",
    "VAULT_MOVEMENT",
    "SECURITY_VALIDATION_FAILED"
  ]).notNull(),
  severity: mysqlEnum("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  isRead: int("is_read").default(0), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = typeof securityAlerts.$inferInsert;