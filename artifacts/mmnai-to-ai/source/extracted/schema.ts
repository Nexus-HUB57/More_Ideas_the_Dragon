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
  role: mysqlEnum("role", ["user", "admin", "leader", "supervisor", "affiliate"]).default("affiliate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Affiliates table - Dados específicos de afiliados
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: int("sponsorId"),
  commissionPercentage: int("commissionPercentage").default(10).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  totalCommissions: int("totalCommissions").default(0).notNull(),
  pendingCommissions: int("pendingCommissions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Network table - Relações de patrocínio pai-filho
 */
export const network = mysqlTable("network", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Network = typeof network.$inferSelect;
export type InsertNetwork = typeof network.$inferInsert;

/**
 * Commissions table - Histórico de comissões
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  level: int("level").notNull(),
  source: varchar("source", { length: 64 }).notNull(), // 'payment', 'order', 'bonus'
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Payments table - Registro de pagamentos
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  method: varchar("method", { length: 64 }).notNull(), // 'boleto', 'cartao', 'deposito', etc
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "cancelled"]).default("pending").notNull(),
  bankCode: varchar("bankCode", { length: 10 }),
  bankNumber: varchar("bankNumber", { length: 20 }),
  agency: varchar("agency", { length: 10 }),
  account: varchar("account", { length: 20 }),
  paymentDate: timestamp("paymentDate"),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Agents table - Configuração de agentes IA
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["learning", "active", "paused", "inactive"]).default("learning").notNull(),
  contentStrategy: text("contentStrategy"), // JSON
  performanceScore: int("performanceScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Upgrades table - Plugins e módulos disponíveis
 */
export const upgrades = mysqlTable("upgrades", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  category: varchar("category", { length: 64 }).notNull(), // 'copywriting', 'sentiment', 'automation', 'marketplace', 'prediction'
  status: mysqlEnum("status", ["available", "discontinued"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUpgrade = typeof upgrades.$inferInsert;

/**
 * Agent Upgrades table - Upgrades ativados por agente
 */
export const agentUpgrades = mysqlTable("agent_upgrades", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  upgradeId: int("upgradeId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type InsertAgentUpgrade = typeof agentUpgrades.$inferInsert;

/**
 * Products table - Catálogo de produtos de marketplaces
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(), // 'mercado_livre', 'shopee', 'hotmart'
  title: text("title").notNull(),
  description: text("description"),
  price: int("price").notNull(),
  commissionPercentage: int("commissionPercentage").notNull(),
  category: varchar("category", { length: 128 }),
  imageUrl: text("imageUrl"),
  url: text("url").notNull(),
  trending: int("trending").default(0).notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table - Histórico de pedidos
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  amount: int("amount").notNull(),
  commissionAmount: int("commissionAmount").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  customerName: varchar("customerName", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Bonuses table - Registro de bônus e prêmios
 */
export const bonuses = mysqlTable("bonuses", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  type: varchar("type", { length: 64 }).notNull(), // 'birthday', 'linear', 'top_sponsor', 'achievement'
  description: text("description"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bonus = typeof bonuses.$inferSelect;
export type InsertBonus = typeof bonuses.$inferInsert;

/**
 * Materials table - Banners, e-books e materiais de divulgação
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId"),
  name: varchar("name", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(), // 'banner', 'ebook', 'image', 'video'
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  description: text("description"),
  downloads: int("downloads").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Notifications table - Alertas do sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: varchar("type", { length: 64 }).notNull(), // 'new_signup', 'payment_confirmed', 'commission_credited', 'order_placed'
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;