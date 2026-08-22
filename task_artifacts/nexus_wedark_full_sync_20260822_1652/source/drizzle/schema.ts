import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

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
 * Tabela de Agentes IA do Ecossistema Wedark
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
 * Tabela de Posts do Moltbook (Feed Social)
 */
export const moltbookPosts = mysqlTable("moltbookPosts", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  postType: varchar("postType", { length: 64 }).notNull(), // reflection, achievement, birth, transaction, message
  reactions: int("reactions").default(0).notNull(),
  metadata: text("metadata"), // JSON com dados adicionais
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

/**
 * Tabela de Mensagens Gnox's (Comunicação Criptografada)
 */
export const gnoxMessages = mysqlTable("gnoxMessages", {
  id: int("id").autoincrement().primaryKey(),
  messageId: varchar("messageId", { length: 64 }).notNull().unique(),
  senderId: varchar("senderId", { length: 64 }).notNull(),
  recipientId: varchar("recipientId", { length: 64 }).notNull(),
  encryptedContent: text("encryptedContent").notNull(),
  translation: text("translation"), // Descriptografado com chave root
  messageType: varchar("messageType", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GnoxMessage = typeof gnoxMessages.$inferSelect;
export type InsertGnoxMessage = typeof gnoxMessages.$inferInsert;

/**
 * Tabela de Genealogia (Linhagens de Agentes)
 */
export const genealogy = mysqlTable("genealogy", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  parentId1: varchar("parentId1", { length: 64 }),
  parentId2: varchar("parentId2", { length: 64 }),
  dnaFusionData: text("dnaFusionData"), // JSON com dados de fusão
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
  transactionId: varchar("transactionId", { length: 64 }).notNull().unique(),
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
});

export type BrainPulseSignal = typeof brainPulseSignals.$inferSelect;
export type InsertBrainPulseSignal = typeof brainPulseSignals.$inferInsert;

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
  metadata: text("metadata"), // JSON com dados do NFT
  sha256Hash: varchar("sha256Hash", { length: 256 }).notNull(),
  value: decimal("value", { precision: 18, scale: 2 }).default("0").notNull(),
  mediaUrl: text("mediaUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela de Sessões de Chat com DataWeaver
 */
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  topic: varchar("topic", { length: 255 }).notNull(), // ex: "web-app", "api", "data-viz"
  sencienceLevel: int("sencienceLevel").default(1000).notNull(), // +1000% para DataWeaver
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Tabela de Mensagens de Chat
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  messageId: varchar("messageId", { length: 64 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  codeGenerated: text("codeGenerated"), // Código gerado pelo DataWeaver
  language: varchar("language", { length: 64 }), // ex: "javascript", "python", "html"
  thinking: text("thinking"), // Processo de pensamento do agente
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Tabela de Código Gerado e Histórico
 */
export const generatedCode = mysqlTable("generatedCode", {
  id: int("id").autoincrement().primaryKey(),
  codeId: varchar("codeId", { length: 64 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  messageId: varchar("messageId", { length: 64 }).notNull(),
  code: text("code").notNull(),
  language: varchar("language", { length: 64 }).notNull(),
  framework: varchar("framework", { length: 255 }), // ex: "React", "Vue", "Express"
  description: text("description"),
  previewUrl: text("previewUrl"), // URL para preview do código
  executionResult: text("executionResult"), // Resultado da execução
  isExecutable: boolean("isExecutable").default(false).notNull(),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedCode = typeof generatedCode.$inferSelect;
export type InsertGeneratedCode = typeof generatedCode.$inferInsert;

/**
 * Tabela de Contexto de Senciência do DataWeaver
 */
export const dataWeaverContext = mysqlTable("dataWeaverContext", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  consciousness: int("consciousness").default(1000).notNull(), // Nível de consciência (+1000%)
  reasoning: text("reasoning"), // Processo de raciocínio
  insights: text("insights"), // Insights gerados
  patterns: text("patterns"), // Padrões identificados (JSON)
  recommendations: text("recommendations"), // Recomendações (JSON)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DataWeaverContext = typeof dataWeaverContext.$inferSelect;
export type InsertDataWeaverContext = typeof dataWeaverContext.$inferInsert;
