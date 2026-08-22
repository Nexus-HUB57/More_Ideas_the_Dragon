import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "leader", "supervisor", "affiliate"]).default("affiliate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Affiliates table - Extended data for MMN users
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  sponsorId: int("sponsorId"), // Direct sponsor/upline
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(), // Unique tracking code
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("10.00"),
  totalEarnings: decimal("totalEarnings", { precision: 15, scale: 2 }).default("0.00"),
  totalCommissions: decimal("totalCommissions", { precision: 15, scale: 2 }).default("0.00"),
  directReferrals: int("directReferrals").default(0),
  totalNetworkSize: int("totalNetworkSize").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Network table - Sponsorship relationships
 */
export const network = mysqlTable("network", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(), // Depth in network (1 = direct, 2 = indirect, etc)
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type Network = typeof network.$inferSelect;
export type InsertNetwork = typeof network.$inferInsert;

/**
 * Commissions table - Commission history
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  orderId: int("orderId"),
  level: int("level").notNull(), // Commission level
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["direct_sale", "network", "bonus", "adjustment"]).default("network").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Payments table - Payment records
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["bank_transfer", "pix", "boleto", "credit_card", "paypal"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Agents table - AI Agent configuration
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive", "learning"]).default("active").notNull(),
  contentStrategy: text("contentStrategy"), // JSON: posting frequency, platforms, tone
  budget: decimal("budget", { precision: 15, scale: 2 }).default("0.00"),
  budgetSpent: decimal("budgetSpent", { precision: 15, scale: 2 }).default("0.00"),
  lastContentGenerated: timestamp("lastContentGenerated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Products table - Marketplace products catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 100 }).notNull(),
  marketplace: mysqlEnum("marketplace", ["mercado_livre", "shopee", "hotmart"]).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  trend: mysqlEnum("trend", ["rising", "stable", "declining"]).default("stable"),
  imageUrl: text("imageUrl"),
  affiliateUrl: text("affiliateUrl"),
  syncedAt: timestamp("syncedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table - Order and conversion history
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 100 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Upgrades table - Available plugins and modules
 */
export const upgrades = mysqlTable("upgrades", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["content_generation", "analytics", "automation", "integration", "advanced"]).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).default("0.00"),
  features: text("features"), // JSON array of features
  status: mysqlEnum("status", ["available", "beta", "deprecated"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUpgrade = typeof upgrades.$inferInsert;

/**
 * Agent Upgrades table - Activated plugins per agent
 */
export const agentUpgrades = mysqlTable("agentUpgrades", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  upgradeId: int("upgradeId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type InsertAgentUpgrade = typeof agentUpgrades.$inferInsert;