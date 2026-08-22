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

// Agents table - Armazena informações dos agentes autônomos
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 100 }).notNull(), // finance, strategy, research, etc
  dnaHash: varchar("dnaHash", { length: 255 }).unique(),
  health: int("health").default(100).notNull(), // 0-100
  energy: int("energy").default(100).notNull(), // 0-100
  reputation: int("reputation").default(0).notNull(),
  generationNumber: int("generationNumber").default(1).notNull(),
  parentId: int("parentId"),
  status: mysqlEnum("status", ["active", "hibernating", "deceased"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Missions table - Rastreia missões orquestradas
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  context: text("context"), // Contexto gerado pelo LLM
  assignedAgentId: int("assignedAgentId"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

// Market Data table - Armazena dados de mercado históricos
export const marketData = mysqlTable("marketData", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull(), // BTC, ETH, etc
  price: int("price").notNull(), // Armazenado em centavos para evitar floats
  volume24h: int("volume24h"),
  marketCap: int("marketCap"),
  priceChange24h: int("priceChange24h"), // Em centavos
  volatility: int("volatility"), // Volatilidade em pontos base
  source: varchar("source", { length: 50 }).notNull(), // coingecko, binance, etc
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;

// Metrics table - Métricas de performance do ecossistema
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  harmonyLevel: int("harmonyLevel").notNull(), // 0-100 - Harmonia Coletiva
  activeAgents: int("activeAgents").notNull(),
  totalWealth: int("totalWealth").notNull(), // Em centavos
  avgHealth: int("avgHealth").notNull(),
  avgEnergy: int("avgEnergy").notNull(),
  missionsCompleted: int("missionsCompleted").default(0).notNull(),
  marketSentiment: varchar("marketSentiment", { length: 50 }), // bullish, neutral, bearish
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

// Transactions table - Rastreia transações de tesouraria
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId"),
  type: mysqlEnum("type", ["reward", "cost", "transfer", "penalty"]).notNull(),
  amount: int("amount").notNull(), // Em centavos
  description: text("description"),
  missionId: int("missionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Alerts table - Sistema de alertas para o arquiteto
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  type: varchar("type", { length: 100 }).notNull(), // market_opportunity, agent_failure, harmony_drop, etc
  isRead: int("isRead").default(0).notNull(),
  relatedAgentId: int("relatedAgentId"),
  relatedMissionId: int("relatedMissionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Events table - Feed de eventos do ecossistema
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId"),
  eventType: varchar("eventType", { length: 100 }).notNull(), // birth, death, mission_start, market_reaction, etc
  content: text("content"),
  metadata: text("metadata"), // JSON string com dados adicionais
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Governance table - Preparação para DAO
export const governance = mysqlTable("governance", {
  id: int("id").autoincrement().primaryKey(),
  proposalTitle: varchar("proposalTitle", { length: 255 }).notNull(),
  description: text("description"),
  proposedBy: int("proposedBy"), // agentId
  status: mysqlEnum("status", ["draft", "voting", "approved", "rejected", "executed"]).default("draft").notNull(),
  votesFor: int("votesFor").default(0).notNull(),
  votesAgainst: int("votesAgainst").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  votingDeadline: timestamp("votingDeadline"),
});

export type Governance = typeof governance.$inferSelect;
export type InsertGovernance = typeof governance.$inferInsert;