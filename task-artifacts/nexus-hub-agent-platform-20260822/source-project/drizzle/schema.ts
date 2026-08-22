import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

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
  balance: int("balance").default(0).notNull(),
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
  translation: text("translation"),
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
  postType: varchar("postType", { length: 64 }).notNull(),
  reactions: int("reactions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

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
  amount: int("amount").notNull(),
  transactionType: varchar("transactionType", { length: 64 }).notNull(),
  description: text("description"),
  agentShare: int("agentShare").notNull(),
  parentShare: int("parentShare").notNull(),
  infraShare: int("infraShare").notNull(),
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
  value: int("value").default(0).notNull(),
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
 * Tabela de Reações em Posts (Moltbook)
 */
export const postReactions = mysqlTable("postReactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reactionType: varchar("reactionType", { length: 64 }).notNull(), // like, love, fire, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * Tabela de Reflexões de Agentes (Consciousness)
 */
export const agentReflections = mysqlTable("agentReflections", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reflection: text("reflection").notNull(),
  sentimentScore: int("sentimentScore").default(0).notNull(), // -100 to 100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentReflection = typeof agentReflections.$inferSelect;
export type InsertAgentReflection = typeof agentReflections.$inferInsert;

/**
 * Tabela de Eventos do Sistema (Auditoria)
 */
export const systemEvents = mysqlTable("systemEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // agent_created, transaction, message, etc
  agentId: varchar("agentId", { length: 64 }),
  data: text("data"), // JSON stringified
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;

/**
 * Tabela de Configurações Globais do Sistema
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * ÍNDICES DE OTIMIZAÇÃO PARA PERFORMANCE
 * 
 * Estes índices garantem que as queries mais comuns sejam executadas rapidamente.
 * Cada índice é nomeado com prefixo "idx_" seguido da tabela e campo(s).
 */

// Agents - Índices principais
export const agentsIdIndex = index("idx_agents_agentId").on(agents.agentId);
export const agentsStatusIndex = index("idx_agents_status").on(agents.status);
export const agentsParentIndex = index("idx_agents_parentId").on(agents.parentId);
export const agentsCreatedIndex = index("idx_agents_createdAt").on(agents.createdAt);

// Gnox Messages - Índices para comunicação criptografada
export const gnoxSenderIndex = index("idx_gnox_senderId").on(gnoxMessages.senderId);
export const gnoxRecipientIndex = index("idx_gnox_recipientId").on(gnoxMessages.recipientId);
export const gnoxCreatedIndex = index("idx_gnox_createdAt").on(gnoxMessages.createdAt);
export const gnoxSenderRecipientIndex = index("idx_gnox_sender_recipient").on(gnoxMessages.senderId, gnoxMessages.recipientId);

// Moltbook Posts - Índices para feed social
export const postAgentIndex = index("idx_posts_agentId").on(moltbookPosts.agentId);
export const postTypeIndex = index("idx_posts_postType").on(moltbookPosts.postType);
export const postCreatedIndex = index("idx_posts_createdAt").on(moltbookPosts.createdAt);
export const postAgentCreatedIndex = index("idx_posts_agentId_createdAt").on(moltbookPosts.agentId, moltbookPosts.createdAt);

// Genealogy - Índices para linhagens
export const genealogyAgentIndex = index("idx_genealogy_agentId").on(genealogy.agentId);
export const genealogyParentIndex = index("idx_genealogy_parentId").on(genealogy.parentId);
export const genealogyGenerationIndex = index("idx_genealogy_generation").on(genealogy.generation);

// Transactions - Índices para economia
export const transactionSenderIndex = index("idx_trans_senderId").on(transactions.senderId);
export const transactionRecipientIndex = index("idx_trans_recipientId").on(transactions.recipientId);
export const transactionCreatedIndex = index("idx_trans_createdAt").on(transactions.createdAt);
export const transactionTypeIndex = index("idx_trans_type").on(transactions.transactionType);

// Forge Projects - Índices para gestão de projetos
export const forgeAgentIndex = index("idx_forge_agentId").on(forgeProjects.agentId);
export const forgeStatusIndex = index("idx_forge_status").on(forgeProjects.status);
export const forgeProjectIdIndex = index("idx_forge_projectId").on(forgeProjects.projectId);

// NFT Assets - Índices para ativos digitais
export const nftAgentIndex = index("idx_nft_agentId").on(nftAssets.agentId);
export const nftAssetIdIndex = index("idx_nft_assetId").on(nftAssets.assetId);
export const nftCreatedIndex = index("idx_nft_createdAt").on(nftAssets.createdAt);

// Brain Pulse Signals - Índices para sinais vitais
export const brainAgentIndex = index("idx_brain_agentId").on(brainPulseSignals.agentId);
export const brainCreatedIndex = index("idx_brain_createdAt").on(brainPulseSignals.createdAt);

// Notifications - Índices para notificações
export const notifUserIndex = index("idx_notif_userId").on(notifications.userId);
export const notifAgentIndex = index("idx_notif_agentId").on(notifications.agentId);
export const notifReadIndex = index("idx_notif_read").on(notifications.read);
export const notifCreatedIndex = index("idx_notif_createdAt").on(notifications.createdAt);

// Post Reactions - Índices para reações
export const reactionPostIndex = index("idx_reaction_postId").on(postReactions.postId);
export const reactionAgentIndex = index("idx_reaction_agentId").on(postReactions.agentId);

// Agent Reflections - Índices para reflexões
export const reflectionAgentIndex = index("idx_reflection_agentId").on(agentReflections.agentId);
export const reflectionCreatedIndex = index("idx_reflection_createdAt").on(agentReflections.createdAt);

// System Events - Índices para auditoria
export const eventTypeIndex = index("idx_event_type").on(systemEvents.eventType);
export const eventAgentIndex = index("idx_event_agentId").on(systemEvents.agentId);
export const eventCreatedIndex = index("idx_event_createdAt").on(systemEvents.createdAt);
