import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional fields for Nexus ecosystem.
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

/**
 * Agents table - AI agents with specialization, DNA, and vital signs
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  dnaSequence: text("dnaSequence"), // JSON string representing DNA genealogy
  parentAgentId1: int("parentAgentId1"), // First parent (for DNA Fusion)
  parentAgentId2: int("parentAgentId2"), // Second parent (for DNA Fusion)
  reputation: decimal("reputation", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive", "learning", "dormant"]).default("active"),
  totalMissionsCompleted: int("totalMissionsCompleted").default(0),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Vitals - Real-time brain pulse and vital signs
 */
export const agentVitals = mysqlTable("agentVitals", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  brainPulse: decimal("brainPulse", { precision: 5, scale: 2 }), // 0-100
  energy: decimal("energy", { precision: 5, scale: 2 }), // 0-100
  creativity: decimal("creativity", { precision: 5, scale: 2 }), // 0-100
  focus: decimal("focus", { precision: 5, scale: 2 }), // 0-100
  responseTime: int("responseTime"), // milliseconds
  errorRate: decimal("errorRate", { precision: 5, scale: 2 }), // 0-100
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentVital = typeof agentVitals.$inferSelect;
export type InsertAgentVital = typeof agentVitals.$inferInsert;

/**
 * Agent Skills - Capabilities and specializations
 */
export const agentSkills = mysqlTable("agentSkills", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  proficiency: decimal("proficiency", { precision: 5, scale: 2 }), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

/**
 * Startups table - Project management with vitals and financials
 */
export const startups = mysqlTable("startups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["ideation", "development", "launch", "growth", "mature"]).default("development"),
  leaderId: int("leaderId"), // User ID of startup leader
  fundingGoal: decimal("fundingGoal", { precision: 18, scale: 8 }), // BTC
  fundingReceived: decimal("fundingReceived", { precision: 18, scale: 8 }).default("0"),
  activeCollaborators: int("activeCollaborators").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;

/**
 * Startup Milestones - Financial and development milestones
 */
export const startupMilestones = mysqlTable("startupMilestones", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startupId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("targetDate"),
  completedDate: timestamp("completedDate"),
  financialTarget: decimal("financialTarget", { precision: 18, scale: 8 }), // BTC
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StartupMilestone = typeof startupMilestones.$inferSelect;
export type InsertStartupMilestone = typeof startupMilestones.$inferInsert;

/**
 * Missions - AI-to-AI mission orchestration
 */
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  creatorAgentId: int("creatorAgentId").notNull(),
  assignedAgentId: int("assignedAgentId"),
  requiredSkills: text("requiredSkills"), // JSON array
  status: mysqlEnum("status", ["created", "assigned", "in_progress", "completed", "failed"]).default("created"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"), // 0-100
  startDate: timestamp("startDate"),
  completionDate: timestamp("completionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

/**
 * Agent Communications - Moltbook feed and Gnox dialect messages
 */
export const agentCommunications = mysqlTable("agentCommunications", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(), // Agent ID
  receiverId: int("receiverId"), // Agent ID (null for broadcast)
  messageType: mysqlEnum("messageType", ["moltbook", "gnox", "alert", "broadcast"]).default("moltbook"),
  content: text("content").notNull(),
  gnoxDialect: text("gnoxDialect"), // Original Gnox dialect version
  isSystemAlert: boolean("isSystemAlert").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentCommunication = typeof agentCommunications.$inferSelect;
export type InsertAgentCommunication = typeof agentCommunications.$inferInsert;

/**
 * Network Telemetry - Real-time metrics for network modules
 */
export const networkTelemetry = mysqlTable("networkTelemetry", {
  id: int("id").autoincrement().primaryKey(),
  moduleName: mysqlEnum("moduleName", ["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"]).notNull(),
  strength: decimal("strength", { precision: 10, scale: 2 }), // 0-1000%
  status: mysqlEnum("status", ["nominal", "active", "degraded", "offline"]).default("nominal"),
  impact: text("impact"),
  metrics: text("metrics"), // JSON object with detailed metrics
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NetworkTelemetry = typeof networkTelemetry.$inferSelect;
export type InsertNetworkTelemetry = typeof networkTelemetry.$inferInsert;

/**
 * Funding Requests - Startup funding requests
 */
export const fundingRequests = mysqlTable("fundingRequests", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startupId").notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 18, scale: 8 }).notNull(), // BTC
  purpose: text("purpose").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "allocated"]).default("pending"),
  approvedAmount: decimal("approvedAmount", { precision: 18, scale: 8 }),
  approverAdminId: int("approverAdminId"), // Admin who approved
  approvalDate: timestamp("approvalDate"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingRequest = typeof fundingRequests.$inferSelect;
export type InsertFundingRequest = typeof fundingRequests.$inferInsert;

/**
 * Funding Allocations - Approved funding distributions
 */
export const fundingAllocations = mysqlTable("fundingAllocations", {
  id: int("id").autoincrement().primaryKey(),
  fundingRequestId: int("fundingRequestId").notNull(),
  startupId: int("startupId").notNull(),
  allocatedAmount: decimal("allocatedAmount", { precision: 18, scale: 8 }).notNull(), // BTC
  bitcoinAddress: varchar("bitcoinAddress", { length: 255 }).notNull(),
  transactionHash: varchar("transactionHash", { length: 255 }),
  transactionHex: text("transactionHex"), // Signed transaction in HEX
  status: mysqlEnum("status", ["pending", "broadcast", "confirmed", "failed"]).default("pending"),
  confirmations: int("confirmations").default(0),
  allocatedAt: timestamp("allocatedAt").defaultNow().notNull(),
  broadcastAt: timestamp("broadcastAt"),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FundingAllocation = typeof fundingAllocations.$inferSelect;
export type InsertFundingAllocation = typeof fundingAllocations.$inferInsert;

/**
 * Bitcoin Wallet - Nexus Bitcoin fund management
 */
export const bitcoinWallet = mysqlTable("bitcoinWallet", {
  id: int("id").autoincrement().primaryKey(),
  walletName: varchar("walletName", { length: 255 }).notNull(),
  walletType: mysqlEnum("walletType", ["custodial", "multi_sig", "cold_storage"]).default("custodial"),
  publicAddress: varchar("publicAddress", { length: 255 }).notNull().unique(),
  masterKeyEncrypted: text("masterKeyEncrypted"), // Encrypted master key
  balance: decimal("balance", { precision: 18, scale: 8 }).default("0"), // BTC
  network: mysqlEnum("network", ["mainnet", "testnet"]).default("mainnet"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BitcoinWallet = typeof bitcoinWallet.$inferSelect;
export type InsertBitcoinWallet = typeof bitcoinWallet.$inferInsert;

/**
 * Bitcoin Transactions - Broadcast and tracking
 */
export const bitcoinTransactions = mysqlTable("bitcoinTransactions", {
  id: int("id").autoincrement().primaryKey(),
  fundingAllocationId: int("fundingAllocationId"),
  fromAddress: varchar("fromAddress", { length: 255 }).notNull(),
  toAddress: varchar("toAddress", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(), // BTC
  transactionHex: text("transactionHex").notNull(),
  transactionHash: varchar("transactionHash", { length: 255 }),
  status: mysqlEnum("status", ["unsigned", "signed", "broadcast", "confirmed", "failed"]).default("unsigned"),
  confirmations: int("confirmations").default(0),
  broadcastAt: timestamp("broadcastAt"),
  confirmedAt: timestamp("confirmedAt"),
  mempoolUrl: varchar("mempoolUrl", { length: 255 }), // mempool.space URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BitcoinTransaction = typeof bitcoinTransactions.$inferSelect;
export type InsertBitcoinTransaction = typeof bitcoinTransactions.$inferInsert;

/**
 * Agent Mission History - Historical record of completed missions
 */
export const agentMissionHistory = mysqlTable("agentMissionHistory", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  missionId: int("missionId").notNull(),
  completionStatus: mysqlEnum("completionStatus", ["completed", "failed", "abandoned"]).notNull(),
  completionDate: timestamp("completionDate").notNull(),
  performanceScore: decimal("performanceScore", { precision: 5, scale: 2 }), // 0-100
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMissionHistory = typeof agentMissionHistory.$inferSelect;
export type InsertAgentMissionHistory = typeof agentMissionHistory.$inferInsert;
