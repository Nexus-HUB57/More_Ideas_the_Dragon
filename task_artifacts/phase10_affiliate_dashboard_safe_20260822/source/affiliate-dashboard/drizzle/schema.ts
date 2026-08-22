import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

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

// Affiliate system tables
export const affiliates = mysqlTable("affiliates", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: int("sponsorId"),
  commissionPercentage: int("commissionPercentage").notNull().default(10),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
  totalCommissions: decimal("totalCommissions", { precision: 15, scale: 2 }).notNull().default("0.00"),
  pendingCommissions: decimal("pendingCommissions", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
}, (table) => ({
  userIdIdx: index("affiliates_userId_idx").on(table.userId),
  sponsorIdIdx: index("affiliates_sponsorId_idx").on(table.sponsorId),
}));

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export const commissions = mysqlTable("commissions", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  level: int("level").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
}, (table) => ({
  affiliateIdIdx: index("commissions_affiliateId_idx").on(table.affiliateId),
  statusIdx: index("commissions_status_idx").on(table.status),
}));

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

export const network = mysqlTable("network", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
}, (table) => ({
  userIdIdx: index("network_userId_idx").on(table.userId),
  sponsorIdIdx: index("network_sponsorId_idx").on(table.sponsorId),
}));

export type NetworkNode = typeof network.$inferSelect;
export type InsertNetworkNode = typeof network.$inferInsert;

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["learning", "active", "paused", "inactive"]).notNull().default("learning"),
  contentStrategy: text("contentStrategy"),
  performanceScore: int("performanceScore").notNull().default(0),
  totalSales: decimal("totalSales", { precision: 15, scale: 2 }).notNull().default("0.00"),
  totalCommissions: decimal("totalCommissions", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
}, (table) => ({
  userIdIdx: index("agents_userId_idx").on(table.userId),
}));

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

export const upgrades = mysqlTable("upgrades", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["available", "discontinued"]).notNull().default("available"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
}, (table) => ({
  statusIdx: index("upgrades_status_idx").on(table.status),
}));

export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUpgrade = typeof upgrades.$inferInsert;

export const agentUpgrades = mysqlTable("agent_upgrades", {
  id: int("id").primaryKey().autoincrement(),
  agentId: int("agentId").notNull(),
  upgradeId: int("upgradeId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).notNull().default("active"),
  activatedAt: timestamp("activatedAt").notNull().default(sql`(now())`),
  expiresAt: timestamp("expiresAt"),
}, (table) => ({
  agentIdIdx: index("agent_upgrades_agentId_idx").on(table.agentId),
  upgradeIdIdx: index("agent_upgrades_upgradeId_idx").on(table.upgradeId),
}));

export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type InsertAgentUpgrade = typeof agentUpgrades.$inferInsert;