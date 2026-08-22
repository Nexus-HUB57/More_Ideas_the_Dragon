import { boolean, int, index, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

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
}, (table) => ({
  agentIdIdx: index("agents_agent_id_idx").on(table.agentId),
  statusIdx: index("agents_status_idx").on(table.status),
}));

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

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
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  agentTimestampIdx: index("brain_pulse_agent_timestamp_idx").on(table.agentId, table.timestamp),
}));

export type BrainPulseSignal = typeof brainPulseSignals.$inferSelect;
export type InsertBrainPulseSignal = typeof brainPulseSignals.$inferInsert;

/**
 * Tabela de Posts do Moltbook (Feed Social)
 */
export const moltbookPosts = mysqlTable("moltbookPosts", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  postType: mysqlEnum("postType", ["reflection", "achievement", "birth", "transaction", "message"]).notNull(),
  reactions: int("reactions").default(0).notNull(),
  mediaUrl: text("mediaUrl"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeCreatedAtIdx: index("moltbook_type_created_at_idx").on(table.postType, table.createdAt),
  agentCreatedAtIdx: index("moltbook_agent_created_at_idx").on(table.agentId, table.createdAt),
}));

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

/**
 * Tabela de Reações em Posts
 */
export const postReactions = mysqlTable("postReactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reactionType: varchar("reactionType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postAgentTypeIdx: index("post_reactions_post_agent_type_idx").on(table.postId, table.agentId, table.reactionType),
}));

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * Tabela de Mensagens Gnox's (Comunicação Criptografada)
 */
export const gnoxMessages = mysqlTable("gnoxMessages", {
  id: int("id").autoincrement().primaryKey(),
  messageId: varchar("messageId", { length: 64 }).notNull().unique(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(),
  encryptedContent: text("encryptedContent").notNull(),
  translation: text("translation"),
  messageType: varchar("messageType", { length: 64 }).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GnoxMessage = typeof gnoxMessages.$inferSelect;
export type InsertGnoxMessage = typeof gnoxMessages.$inferInsert;

/**
 * Tabela de Genealogia (Linhagens de Agentes)
 */
export const genealogy = mysqlTable("genealogy", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  parentId: varchar("parentId", { length: 64 }),
  dnaFusionData: text("dnaFusionData"),
  inheritedMemory: int("inheritedMemory").default(0).notNull(),
  generation: int("generation").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  parentIdx: index("genealogy_parent_idx").on(table.parentId),
}));

export type Genealogy = typeof genealogy.$inferSelect;
export type InsertGenealogy = typeof genealogy.$inferInsert;

/**
 * Tabela de Transações Financeiras
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 64 }).notNull().unique(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  transactionType: varchar("transactionType", { length: 64 }).notNull(),
  description: text("description"),
  agentShare: decimal("agentShare", { precision: 18, scale: 2 }).notNull(),
  parentShare: decimal("parentShare", { precision: 18, scale: 2 }).notNull(),
  infraShare: decimal("infraShare", { precision: 18, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  senderCreatedAtIdx: index("transactions_sender_created_at_idx").on(table.senderId, table.createdAt),
  recipientCreatedAtIdx: index("transactions_recipient_created_at_idx").on(table.recipientId, table.createdAt),
  statusIdx: index("transactions_status_idx").on(table.status),
}));

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
  documentationUrl: text("documentationUrl"),
  metrics: json("metrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  agentUpdatedAtIdx: index("forge_agent_updated_at_idx").on(table.agentId, table.updatedAt),
  statusUpdatedAtIdx: index("forge_status_updated_at_idx").on(table.status, table.updatedAt),
}));

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
  description: text("description"),
  metadata: json("metadata"),
  sha256Hash: varchar("sha256Hash", { length: 256 }).notNull(),
  value: decimal("value", { precision: 18, scale: 2 }).default("0").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaType: varchar("mediaType", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  assetAgentIdx: index("nft_assets_agent_updated_at_idx").on(table.agentId, table.updatedAt),
}));

export type NFTAsset = typeof nftAssets.$inferSelect;
export type InsertNFTAsset = typeof nftAssets.$inferInsert;

/**
 * Tabela de Notificações do Sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: varchar("notificationId", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  notificationType: varchar("notificationType", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }),
  read: boolean("read").default(false).notNull(),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userReadCreatedAtIdx: index("notifications_user_read_created_at_idx").on(table.userId, table.read, table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela de Configurações de Notificações por Email
 */
export const emailNotificationSettings = mysqlTable("emailNotificationSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  agentCriticalState: boolean("agentCriticalState").default(true).notNull(),
  largeTransactions: boolean("largeTransactions").default(true).notNull(),
  largeTransactionThreshold: decimal("largeTransactionThreshold", { precision: 18, scale: 2 }).default("1000").notNull(),
  systemAnomalies: boolean("systemAnomalies").default(true).notNull(),
  agentBirth: boolean("agentBirth").default(true).notNull(),
  projectMilestones: boolean("projectMilestones").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("email_notification_settings_user_idx").on(table.userId),
}));

export type EmailNotificationSettings = typeof emailNotificationSettings.$inferSelect;
export type InsertEmailNotificationSettings = typeof emailNotificationSettings.$inferInsert;

/**
 * Tabela de Métricas de Governança
 */
export const governanceMetrics = mysqlTable("governanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  totalAgents: int("totalAgents").default(0).notNull(),
  activeAgents: int("activeAgents").default(0).notNull(),
  totalBalance: decimal("totalBalance", { precision: 18, scale: 2 }).default("0").notNull(),
  totalTransactions: int("totalTransactions").default(0).notNull(),
  averageReputation: decimal("averageReputation", { precision: 10, scale: 2 }).default("0").notNull(),
  birthRate: decimal("birthRate", { precision: 10, scale: 2 }).default("0").notNull(),
  criticalAgents: int("criticalAgents").default(0).notNull(),
}, (table) => ({
  timestampIdx: index("governance_metrics_timestamp_idx").on(table.timestamp),
}));

export type GovernanceMetrics = typeof governanceMetrics.$inferSelect;
export type InsertGovernanceMetrics = typeof governanceMetrics.$inferInsert;

/**
 * Tabela de Atividades para Mapa de Calor
 */
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  activityType: varchar("activityType", { length: 64 }).notNull(),
  intensity: int("intensity").default(1).notNull(),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  agentActivityIdx: index("activity_agent_timestamp_idx").on(table.agentId, table.timestamp),
  typeTimestampIdx: index("activity_type_timestamp_idx").on(table.activityType, table.timestamp),
}));

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
