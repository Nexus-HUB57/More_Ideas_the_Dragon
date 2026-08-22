import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with MMN-specific fields for affiliate management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).unique(),
  referrerCode: varchar("referrerCode", { length: 32 }),
  totalCommissions: decimal("totalCommissions", { precision: 10, scale: 2 }).default("0"),
  availableBalance: decimal("availableBalance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  affiliateCodeIdx: index("affiliateCode_idx").on(table.affiliateCode),
  referrerCodeIdx: index("referrerCode_idx").on(table.referrerCode),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Affiliates table - represents the network hierarchy
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  parentId: int("parentId"),
  level: int("level").default(1),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  joinedAt: timestamp("joinedAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  parentIdIdx: index("parentId_idx").on(table.parentId),
  parentLevelIdx: index("parentId_level_idx").on(table.parentId, table.level),
}));

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Agents table - AI agents for each user
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "paused"]).default("inactive"),
  energy: int("energy").default(100),
  health: int("health").default(100),
  creativity: int("creativity").default(80),
  reputation: int("reputation").default(50),
  strategy: varchar("strategy", { length: 64 }).default("balanced"),
  lastActionAt: timestamp("lastActionAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Commissions table - tracks all commissions
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["direct", "indirect", "bonus"]),
  sourceUserId: int("sourceUserId"),
  saleId: int("saleId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid"]).default("pending"),
  period: varchar("period", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow(),
  paidAt: timestamp("paidAt"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  periodStatusIdx: index("period_status_idx").on(table.period, table.status),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Sales table - tracks all sales
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).default("10"),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  affiliateIdIdx: index("affiliateId_idx").on(table.affiliateId),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Products table - marketplace products
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("10"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  marketplaceIdx: index("marketplace_idx").on(table.marketplace),
  statusIdx: index("status_idx").on(table.status),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Favorites table - user favorite products
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userProductUnique: unique("user_product_unique").on(table.userId, table.productId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Notifications table - system notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["commission", "affiliate", "agent", "system"]),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedId: int("relatedId"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  userIsReadIdx: index("userId_isRead_idx").on(table.userId, table.isRead),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Withdrawals table - withdrawal requests
 */
export const withdrawals = mysqlTable("withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "paid"]).default("pending"),
  bankAccount: varchar("bankAccount", { length: 255 }),
  requestedAt: timestamp("requestedAt").defaultNow(),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusRequestedIdx: index("status_requested_idx").on(table.status, table.requestedAt),
}));

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = typeof withdrawals.$inferInsert;
