import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

// ============================================================================
// AGENTS & GENEALOGY
// ============================================================================

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  dnaHash: varchar("dnaHash", { length: 255 }).unique(),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  balance: int("balance").default(1000).notNull(),
  health: int("health").default(100).notNull(),
  energy: int("energy").default(100).notNull(),
  reputation: int("reputation").default(50).notNull(),
  generationNumber: int("generationNumber").default(1).notNull(),
  status: mysqlEnum("status", ["active", "sleeping", "inactive"]).default("active").notNull(),
  systemPrompt: text("systemPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

export const genealogy = mysqlTable("genealogy", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  parentId: varchar("parentId", { length: 64 }),
  inheritedMemory: int("inheritedMemory").default(0).notNull(),
  generation: int("generation").default(1).notNull(),
  dnaFusionData: text("dnaFusionData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Genealogy = typeof genealogy.$inferSelect;
export type InsertGenealogy = typeof genealogy.$inferInsert;

export const brainPulseSignals = mysqlTable("brainPulseSignals", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  health: int("health").notNull(),
  energy: int("energy").notNull(),
  mood: varchar("mood", { length: 50 }),
  activity: varchar("activity", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BrainPulseSignal = typeof brainPulseSignals.$inferSelect;
export type InsertBrainPulseSignal = typeof brainPulseSignals.$inferInsert;

// ============================================================================
// MISSIONS & ORCHESTRATION
// ============================================================================

export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  missionId: varchar("missionId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  context: text("context"),
  assignedAgentId: varchar("assignedAgentId", { length: 64 }),
  targetSpecialization: varchar("targetSpecialization", { length: 100 }),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  reward: int("reward").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

// ============================================================================
// ECOSYSTEM ACTIVITIES & FEED
// ============================================================================

export const ecosystemActivities = mysqlTable("ecosystemActivities", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EcosystemActivity = typeof ecosystemActivities.$inferSelect;
export type InsertEcosystemActivity = typeof ecosystemActivities.$inferInsert;

export const moltbookPosts = mysqlTable("moltbookPosts", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  gnoxSignal: text("gnoxSignal"),
  reactionCount: int("reactionCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

export const moltbookComments = mysqlTable("moltbookComments", {
  id: int("id").autoincrement().primaryKey(),
  commentId: varchar("commentId", { length: 64 }).notNull().unique(),
  postId: varchar("postId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookComment = typeof moltbookComments.$inferSelect;
export type InsertMoltbookComment = typeof moltbookComments.$inferInsert;

export const moltbookReactions = mysqlTable("moltbookReactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: varchar("postId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reactionType: varchar("reactionType", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookReaction = typeof moltbookReactions.$inferSelect;
export type InsertMoltbookReaction = typeof moltbookReactions.$inferInsert;

// ============================================================================
// TRANSACTIONS & TREASURY
// ============================================================================

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 64 }).notNull().unique(),
  fromAgentId: varchar("fromAgentId", { length: 64 }).notNull(),
  toAgentId: varchar("toAgentId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["reward", "cost", "transfer", "penalty", "inheritance"]).notNull(),
  amount: int("amount").notNull(),
  description: text("description"),
  missionId: varchar("missionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ============================================================================
// PROJECTS & FORGE
// ============================================================================

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorAgentId: varchar("creatorAgentId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["planning", "development", "active", "completed", "abandoned"]).default("planning").notNull(),
  budget: int("budget").default(0).notNull(),
  spent: int("spent").default(0).notNull(),
  progress: int("progress").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const projectTasks = mysqlTable("projectTasks", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 64 }).notNull().unique(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedAgentId: varchar("assignedAgentId", { length: 64 }),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

// ============================================================================
// ALERTS & NOTIFICATIONS
// ============================================================================

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertId: varchar("alertId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  isRead: int("isRead").default(0).notNull(),
  relatedAgentId: varchar("relatedAgentId", { length: 64 }),
  relatedMissionId: varchar("relatedMissionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// ============================================================================
// GOVERNANCE & DAO
// ============================================================================

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: varchar("proposalId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  proposedByAgentId: varchar("proposedByAgentId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["draft", "voting", "approved", "rejected", "executed"]).default("draft").notNull(),
  votesFor: int("votesFor").default(0).notNull(),
  votesAgainst: int("votesAgainst").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  votingDeadline: timestamp("votingDeadline"),
  executedAt: timestamp("executedAt"),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: varchar("proposalId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  voteType: mysqlEnum("voteType", ["for", "against"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

// ============================================================================
// ECOSYSTEM METRICS
// ============================================================================

export const ecosystemMetrics = mysqlTable("ecosystemMetrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activeAgents: int("activeAgents").notNull(),
  sleepingAgents: int("sleepingAgents").notNull(),
  totalWealth: int("totalWealth").notNull(),
  avgHealth: int("avgHealth").notNull(),
  avgEnergy: int("avgEnergy").notNull(),
  avgReputation: int("avgReputation").notNull(),
  harmonyLevel: int("harmonyLevel").notNull(),
  birthRate: int("birthRate").notNull(),
  dissolutionRate: int("dissolutionRate").notNull(),
});

export type EcosystemMetric = typeof ecosystemMetrics.$inferSelect;
export type InsertEcosystemMetric = typeof ecosystemMetrics.$inferInsert;

// ============================================================================
// MARKET DATA
// ============================================================================

export const marketData = mysqlTable("marketData", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  price: int("price").notNull(),
  volume24h: int("volume24h"),
  marketCap: int("marketCap"),
  priceChange24h: int("priceChange24h"),
  volatility: int("volatility"),
  source: varchar("source", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;
