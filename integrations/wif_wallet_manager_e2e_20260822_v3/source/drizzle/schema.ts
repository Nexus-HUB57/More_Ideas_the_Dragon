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
 * Wallets table for storing Bitcoin wallet information
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  address: varchar("address", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  network: mysqlEnum("network", ["mainnet", "testnet"]).default("mainnet").notNull(),
  balance: varchar("balance", { length: 255 }).default("0"),
  lastBalanceUpdate: timestamp("lastBalanceUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * WIF Conversions table for storing private key to WIF conversions
 */
export const wifConversions = mysqlTable("wifConversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  privateKeyHex: varchar("privateKeyHex", { length: 64 }).notNull(),
  wifCompressed: varchar("wifCompressed", { length: 255 }).notNull(),
  wifUncompressed: varchar("wifUncompressed", { length: 255 }).notNull(),
  network: mysqlEnum("network", ["mainnet", "testnet"]).default("mainnet").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WifConversion = typeof wifConversions.$inferSelect;
export type InsertWifConversion = typeof wifConversions.$inferInsert;