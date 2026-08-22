import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

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
 * Tabela de Agentes IA do Ecossistema
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  systemPrompt: text("systemPrompt").notNull(),
  parentId: varchar("parentId", { length: 64 }),
  dnaHash: varchar("dnaHash", { length: 256 }).notNull(),
  balance: decimal("balance", { precision: 18, scale: 2 }).default("0").notNull(),
  reputation: int("reputation").default(0).notNull(),
  avatarUrl: text("avatarUrl"),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive", "sleeping", "critical"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Tabela de Mensagens Gnox's (Comunicação Criptografada)
 */
export const gnoxMessages = mysqlTable("gnoxMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(),
  encryptedContent: text("encryptedContent").notNull(),
  iv: varchar("iv", { length: 256 }).notNull(),
  authTag: varchar("authTag", { length: 256 }).notNull(),
  messageType: varchar("messageType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GnoxMessage = typeof gnoxMessages.$inferSelect;
export type InsertGnoxMessage = typeof gnoxMessages.$inferInsert;

/**
 * Tabela de Posts do Moltbook (Feed Social)
 */
export const moltbookPosts = mysqlTable("moltbookPosts", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  postType: mysqlEnum("postType", ["reflection", "achievement", "birth", "transaction", "message", "governance"]).notNull(),
  reactionCount: int("reactionCount").default(0).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

/**
 * Tabela de Reações em Posts (Moltbook)
 */
export const postReactions = mysqlTable("postReactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reactionType: varchar("reactionType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * Tabela de Genealogia (Linhagens de Agentes)
 */
export const genealogy = mysqlTable("genealogy", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  parentId: varchar("parentId", { length: 64 }),
  dnaFusionData: text("dnaFusionData"),
  inheritedMemory: int("inheritedMemory").default(0).notNull(),
  generation: int("generation").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Genealogy = typeof genealogy.$inferSelect;
export type InsertGenealogy = typeof genealogy.$inferInsert;

/**
 * Tabela de Transações Financeiras
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  transactionType: varchar("transactionType", { length: 64 }).notNull(),
  description: text("description"),
  agentShare: decimal("agentShare", { precision: 18, scale: 2 }).notNull(),
  parentShare: decimal("parentShare", { precision: 18, scale: 2 }).notNull(),
  infraShare: decimal("infraShare", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Tabela de Projetos Forge
 */
export const forgeProjects = mysqlTable("forgeProjects", {
  id: int("id").autoincrement().primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["development", "audit", "deployed", "archived"]).default("development").notNull(),
  repositoryUrl: text("repositoryUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForgeProject = typeof forgeProjects.$inferSelect;
export type InsertForgeProject = typeof forgeProjects.$inferInsert;

/**
 * Tabela de Ativos NFT (Asset Lab)
 */
export const nftAssets = mysqlTable("nftAssets", {
  id: int("id").autoincrement().primaryKey(),
  assetId: varchar("assetId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  metadata: text("metadata"),
  sha256Hash: varchar("sha256Hash", { length: 256 }).notNull(),
  value: decimal("value", { precision: 18, scale: 2 }).default("0").notNull(),
  mediaUrl: text("mediaUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NFTAsset = typeof nftAssets.$inferSelect;
export type InsertNFTAsset = typeof nftAssets.$inferInsert;

/**
 * Tabela de Sinais Vitais (Brain Pulse Monitor)
 */
export const brainPulseSignals = mysqlTable("brainPulseSignals", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  health: int("health").default(100).notNull(),
  energy: int("energy").default(100).notNull(),
  creativity: int("creativity").default(100).notNull(),
  decision: varchar("decision", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrainPulseSignal = typeof brainPulseSignals.$inferSelect;
export type InsertBrainPulseSignal = typeof brainPulseSignals.$inferInsert;

/**
 * Tabela de Notificações do Sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  notificationType: varchar("notificationType", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela de Decisões de Governança
 */
export const governanceDecisions = mysqlTable("governanceDecisions", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: varchar("decisionId", { length: 64 }).notNull().unique(),
  decisionType: varchar("decisionType", { length: 255 }).notNull(),
  targetAgentId: varchar("targetAgentId", { length: 64 }),
  description: text("description").notNull(),
  reasoning: text("reasoning").notNull(),
  status: mysqlEnum("status", ["proposed", "voting", "approved", "rejected", "executed"]).default("proposed").notNull(),
  votesFor: int("votesFor").default(0).notNull(),
  votesAgainst: int("votesAgainst").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GovernanceDecision = typeof governanceDecisions.$inferSelect;
export type InsertGovernanceDecision = typeof governanceDecisions.$inferInsert;

/**
 * Tabela de Eventos do Sistema
 */
export const systemEvents = mysqlTable("systemEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  agentId: varchar("agentId", { length: 64 }),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("info").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;

/**
 * Tabela de Métricas de Governança
 */
export const governanceMetrics = mysqlTable("governanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  totalAgents: int("totalAgents").default(0).notNull(),
  activeAgents: int("activeAgents").default(0).notNull(),
  totalTransactions: int("totalTransactions").default(0).notNull(),
  totalVolume: decimal("totalVolume", { precision: 18, scale: 2 }).default("0").notNull(),
  avgReputation: int("avgReputation").default(0).notNull(),
  networkHealth: int("networkHealth").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GovernanceMetric = typeof governanceMetrics.$inferSelect;
export type InsertGovernanceMetric = typeof governanceMetrics.$inferInsert;
