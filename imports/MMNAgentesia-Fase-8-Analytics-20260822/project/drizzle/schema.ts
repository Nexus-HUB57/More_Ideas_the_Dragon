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

/**
 * Marketplace Accounts table - Contas conectadas de marketplaces
 */
export const marketplaceAccounts = mysqlTable("marketplace_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  marketplace: mysqlEnum("marketplace", ["mercado_libre", "shopee", "hotmart"]).notNull(),
  accountName: varchar("accountName", { length: 128 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  apiKey: text("apiKey"),
  apiSecret: text("apiSecret"),
  isActive: int("isActive").default(1).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  syncStatus: mysqlEnum("syncStatus", ["pending", "syncing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceAccount = typeof marketplaceAccounts.$inferSelect;
export type InsertMarketplaceAccount = typeof marketplaceAccounts.$inferInsert;

/**
 * Marketplace Products table - Produtos sincronizados dos marketplaces
 */
export const marketplaceProducts = mysqlTable("marketplace_products", {
  id: int("id").autoincrement().primaryKey(),
  marketplaceAccountId: int("marketplaceAccountId").notNull(),
  externalProductId: varchar("externalProductId", { length: 128 }).notNull(),
  marketplace: mysqlEnum("marketplace", ["mercado_libre", "shopee", "hotmart"]).notNull(),
  productName: varchar("productName", { length: 256 }).notNull(),
  productUrl: text("productUrl").notNull(),
  category: varchar("category", { length: 128 }),
  price: int("price").notNull(), // em centavos
  originalPrice: int("originalPrice"),
  discount: int("discount").default(0), // percentual
  rating: int("rating").default(0), // 0-100
  reviews: int("reviews").default(0),
  sales: int("sales").default(0),
  description: text("description"),
  imageUrl: text("imageUrl"),
  seller: varchar("seller", { length: 128 }),
  commissionPercentage: int("commissionPercentage").default(0),
  isActive: int("isActive").default(1).notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = typeof marketplaceProducts.$inferInsert;

/**
 * Product Trends table - Análise de tendências de produtos
 */
export const productTrends = mysqlTable("product_trends", {
  id: int("id").autoincrement().primaryKey(),
  marketplaceProductId: int("marketplaceProductId").notNull(),
  trendingScore: int("trendingScore").default(0), // 0-100
  viewsChange: int("viewsChange").default(0), // percentual
  salesChange: int("salesChange").default(0), // percentual
  priceChange: int("priceChange").default(0), // em centavos
  seasonality: varchar("seasonality", { length: 64 }), // 'high', 'medium', 'low', 'stable'
  demandLevel: varchar("demandLevel", { length: 64 }), // 'high', 'medium', 'low'
  competitionLevel: varchar("competitionLevel", { length: 64 }), // 'high', 'medium', 'low'
  profitabilityScore: int("profitabilityScore").default(0), // 0-100
  recommendation: varchar("recommendation", { length: 64 }), // 'buy', 'hold', 'sell', 'avoid'
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductTrend = typeof productTrends.$inferSelect;
export type InsertProductTrend = typeof productTrends.$inferInsert;

/**
 * Affiliate Margins table - Margens de afiliado por produto
 */
export const affiliateMargins = mysqlTable("affiliate_margins", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  marketplaceProductId: int("marketplaceProductId").notNull(),
  baseCommission: int("baseCommission").default(0), // percentual
  bonusCommission: int("bonusCommission").default(0), // percentual
  totalCommission: int("totalCommission").default(0), // percentual
  estimatedMonthlyEarnings: int("estimatedMonthlyEarnings").default(0), // em centavos
  totalEarnings: int("totalEarnings").default(0), // em centavos
  totalSales: int("totalSales").default(0),
  conversionRate: int("conversionRate").default(0), // percentual
  lastCalculatedAt: timestamp("lastCalculatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateMargin = typeof affiliateMargins.$inferSelect;
export type InsertAffiliateMargin = typeof affiliateMargins.$inferInsert;

/**
 * Marketplace Sync History table - Histórico de sincronizações
 */
export const marketplaceSyncHistory = mysqlTable("marketplace_sync_history", {
  id: int("id").autoincrement().primaryKey(),
  marketplaceAccountId: int("marketplaceAccountId").notNull(),
  syncType: varchar("syncType", { length: 64 }).notNull(), // 'products', 'orders', 'analytics'
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  productsAdded: int("productsAdded").default(0),
  productsUpdated: int("productsUpdated").default(0),
  productsFailed: int("productsFailed").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceSyncHistory = typeof marketplaceSyncHistory.$inferSelect;
export type InsertMarketplaceSyncHistory = typeof marketplaceSyncHistory.$inferInsert;
