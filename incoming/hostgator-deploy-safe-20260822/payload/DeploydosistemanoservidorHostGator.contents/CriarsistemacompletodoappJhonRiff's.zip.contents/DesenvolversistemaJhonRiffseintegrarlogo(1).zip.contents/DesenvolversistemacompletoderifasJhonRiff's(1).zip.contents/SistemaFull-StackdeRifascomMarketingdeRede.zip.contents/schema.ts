import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with MLM-specific fields for career level, points, and balance.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // MLM-specific fields
  careerLevel: int("careerLevel").default(0).notNull(), // 0=Iniciante, 1-7=Níveis
  careerPoints: int("careerPoints").default(0).notNull(), // Pontos acumulados para progressão
  directSalesCommission: decimal("directSalesCommission", { precision: 10, scale: 2 }).default("0.00").notNull(), // 10% de comissão direta
  teamCommissionBalance: decimal("teamCommissionBalance", { precision: 10, scale: 2 }).default("0.00").notNull(), // Saldo de comissões de equipe
  totalBalance: decimal("totalBalance", { precision: 10, scale: 2 }).default("0.00").notNull(), // Saldo total (JR Bank)
  
  // Referrer (indicador) - para estrutura Unilevel
  referrerId: int("referrerId"),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - E-books and digital products
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileSize: int("fileSize"), // in bytes
  downloadCount: int("downloadCount").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"),
  createdBy: int("createdBy").notNull(), // Admin who created it
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Sales/Revenue table - Records of customer payments
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(), // Who made the sale
  productId: int("productId"),
  customerId: int("customerId"), // Who bought (can be same as affiliateId for self-purchase)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // e.g., "boleto", "credit_card", "pix"
  paymentReference: varchar("paymentReference", { length: 100 }), // Boleto number, transaction ID, etc.
  
  // Commission calculation tracking
  commissionsCalculated: boolean("commissionsCalculated").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  confirmedAt: datetime("confirmedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Affiliate Network table - Unilevel structure
 * Tracks the direct referral relationship between affiliates
 */
export const affiliateNetwork = mysqlTable("affiliateNetwork", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(), // The affiliate
  referrerId: int("referrerId").notNull(), // Who referred them
  level: int("level").notNull(), // 1=direct, 2=second level, etc.
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type AffiliateNetwork = typeof affiliateNetwork.$inferSelect;
export type InsertAffiliateNetwork = typeof affiliateNetwork.$inferInsert;

/**
 * Commissions table - Tracks all commission payments
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  recipientId: int("recipientId").notNull(), // Who receives the commission
  saleId: int("saleId").notNull(), // Which sale triggered this commission
  affiliateId: int("affiliateId").notNull(), // The affiliate who made the sale
  commissionType: mysqlEnum("commissionType", ["direct", "level2", "level3", "level4"]).notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(), // e.g., 10.00, 5.00, 2.50
  baseAmount: decimal("baseAmount", { precision: 10, scale: 2 }).notNull(), // Sale amount
  commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).notNull(), // Calculated commission
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paidAt: datetime("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Career Levels table - Defines the 7-level career structure
 */
export const careerLevels = mysqlTable("careerLevels", {
  id: int("id").autoincrement().primaryKey(),
  level: int("level").notNull().unique(), // 1-7
  title: varchar("title", { length: 100 }).notNull(), // e.g., "Agente Autônomo", "Consultor"
  pointsRequired: int("pointsRequired").notNull(), // Points needed to reach this level
  investmentRequired: decimal("investmentRequired", { precision: 10, scale: 2 }).notNull(), // Kit/Pack cost
  teamRequirement: int("teamRequirement"), // Number of direct reports needed
  directCommissionRate: decimal("directCommissionRate", { precision: 5, scale: 2 }).notNull(), // 10%
  level2CommissionRate: decimal("level2CommissionRate", { precision: 5, scale: 2 }), // 5%
  level3CommissionRate: decimal("level3CommissionRate", { precision: 5, scale: 2 }), // 2.5%
  level4CommissionRate: decimal("level4CommissionRate", { precision: 5, scale: 2 }), // 2.5%
  monthlyBonus: decimal("monthlyBonus", { precision: 10, scale: 2 }), // Bônus mensal
  profitParticipationRate: decimal("profitParticipationRate", { precision: 5, scale: 2 }), // % de participação nos lucros
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CareerLevel = typeof careerLevels.$inferSelect;
export type InsertCareerLevel = typeof careerLevels.$inferInsert;

/**
 * Lotteries/Raffles table - +Sorte system
 */
export const lotteries = mysqlTable("lotteries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  drawDate: datetime("drawDate").notNull(),
  status: mysqlEnum("status", ["active", "drawn", "cancelled"]).default("active").notNull(),
  
  // Lottery details
  totalTickets: int("totalTickets").notNull(),
  ticketPrice: decimal("ticketPrice", { precision: 10, scale: 2 }).notNull(),
  prizePool: decimal("prizePool", { precision: 10, scale: 2 }).notNull(),
  
  // Sales goal requirement
  salesGoalRequired: decimal("salesGoalRequired", { precision: 10, scale: 2 }),
  currentSalesTotal: decimal("currentSalesTotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
  goalMet: boolean("goalMet").default(false).notNull(),
  
  // Federal Lottery integration
  federalLotteryNumber: varchar("federalLotteryNumber", { length: 50 }), // Linked to federal lottery
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  drawnAt: datetime("drawnAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lottery = typeof lotteries.$inferSelect;
export type InsertLottery = typeof lotteries.$inferInsert;

/**
 * Lottery Tickets table - Individual tickets/numbers
 */
export const lotteryTickets = mysqlTable("lotteryTickets", {
  id: int("id").autoincrement().primaryKey(),
  lotteryId: int("lotteryId").notNull(),
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull(), // Unique ticket number
  ownerId: int("ownerId").notNull(), // User who owns this ticket
  purchaseDate: timestamp("purchaseDate").defaultNow().notNull(),
  isWinner: boolean("isWinner").default(false).notNull(),
  prizeAmount: decimal("prizeAmount", { precision: 10, scale: 2 }),
  claimedAt: datetime("claimedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LotteryTicket = typeof lotteryTickets.$inferSelect;
export type InsertLotteryTicket = typeof lotteryTickets.$inferInsert;

/**
 * Payments/Withdrawals table - JR Bank transactions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["commission", "bonus", "withdrawal", "deposit"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processed", "failed"]).default("pending").notNull(),
  description: text("description"),
  relatedSaleId: int("relatedSaleId"), // If from a sale
  relatedCommissionId: int("relatedCommissionId"), // If from commission
  processedAt: datetime("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Team Performance table - Tracks team metrics for career progression
 */
export const teamPerformance = mysqlTable("teamPerformance", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  directTeamSize: int("directTeamSize").default(0).notNull(),
  totalTeamSize: int("totalTeamSize").default(0).notNull(),
  teamSalesTotal: decimal("teamSalesTotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
  teamCommissionsEarned: decimal("teamCommissionsEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamPerformance = typeof teamPerformance.$inferSelect;
export type InsertTeamPerformance = typeof teamPerformance.$inferInsert;

/**
 * Audit Log table - Track important system events
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
