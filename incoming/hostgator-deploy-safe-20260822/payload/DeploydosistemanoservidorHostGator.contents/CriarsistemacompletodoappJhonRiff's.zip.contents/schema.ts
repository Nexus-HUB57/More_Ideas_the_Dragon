import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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
 * Extended user profile for Jhon Riff's system
 * Stores career level, points, and network information
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  careerLevel: mysqlEnum("careerLevel", [
    "inscrito",
    "agenteAutonomo",
    "consultor",
    "mentor",
    "executivo",
    "socioInvestidor",
    "socioGestor",
    "socioJRGroup"
  ]).default("inscrito").notNull(),
  points: int("points").default(0).notNull(),
  totalInvested: decimal("totalInvested", { precision: 12, scale: 2 }).default("0.00").notNull(),
  uplineId: int("uplineId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Products table for e-books and PPR (Produtos de Propriedade Replicável)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Sales table - records all product sales
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => (({
  userIdIdx: index("userIdIdx").on(table.userId),
  statusIdx: index("statusIdx").on(table.status),
})));

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Commissions table - tracks all commission payments
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  saleId: int("saleId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  level: int("level").notNull(),
  type: mysqlEnum("type", ["direct", "unilevel", "bonus"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => (({
  userIdIdx: index("userIdIdx").on(table.userId),
  statusIdx: index("statusIdx").on(table.status),
})));

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Network table - tracks upline/downline relationships
 */
export const networkRelations = mysqlTable("networkRelations", {
  id: int("id").autoincrement().primaryKey(),
  uplineId: int("uplineId").notNull(),
  downlineId: int("downlineId").notNull(),
  level: int("level").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => (({
  uplineIdx: index("uplineIdx").on(table.uplineId),
  downlineIdx: index("downlineIdx").on(table.downlineId),
})));

export type NetworkRelation = typeof networkRelations.$inferSelect;
export type InsertNetworkRelation = typeof networkRelations.$inferInsert;

/**
 * Lucky numbers table for +Sorte lottery system
 */
export const luckyNumbers = mysqlTable("luckyNumbers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  number: int("number").notNull(),
  drawDate: timestamp("drawDate").notNull(),
  isWinner: boolean("isWinner").default(false).notNull(),
  prize: decimal("prize", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => (({
  userIdIdx: index("userIdIdx").on(table.userId),
  drawDateIdx: index("drawDateIdx").on(table.drawDate),
})));

export type LuckyNumber = typeof luckyNumbers.$inferSelect;
export type InsertLuckyNumber = typeof luckyNumbers.$inferInsert;

/**
 * User purchases table - tracks which products each user has purchased
 */
export const userPurchases = mysqlTable("userPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  purchaseDate: timestamp("purchaseDate").defaultNow().notNull(),
  accessExpiry: timestamp("accessExpiry"),
}, (table) => (({
  userIdIdx: index("userIdIdx").on(table.userId),
  productIdIdx: index("productIdIdx").on(table.productId),
})));

export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertUserPurchase = typeof userPurchases.$inferInsert;

/**
 * Transactions table - audit trail for all financial movements
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["sale", "commission", "bonus", "withdrawal", "refund"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => (({
  userIdIdx: index("userIdIdx").on(table.userId),
  typeIdx: index("typeIdx").on(table.type),
})));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
