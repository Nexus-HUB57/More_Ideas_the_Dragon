import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

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

// ============= AGENTS =============

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  dnaHash: varchar("dnaHash", { length: 255 }),
  generationNumber: int("generationNumber").default(0),
  parentAgentIdA: varchar("parentAgentIdA", { length: 128 }),
  parentAgentIdB: varchar("parentAgentIdB", { length: 128 }),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active"),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0"),
  reputation: int("reputation").default(0),
  health: int("health").default(100),
  energy: int("energy").default(100),
  creativity: int("creativity").default(50),
  integrity: int("integrity").default(100),
  preservation: int("preservation").default(50),
  socialBias: int("socialBias").default(0),
  generation: int("generation").default(0),
  systemPrompt: text("systemPrompt"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

export const agentSkills = mysqlTable("agent_skills", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 128 }).notNull(),
  skill: varchar("skill", { length: 255 }).notNull(),
  proficiency: int("proficiency").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

export const agentVitals = mysqlTable("agent_vitals", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 128 }).notNull(),
  health: int("health").default(100),
  energy: int("energy").default(100),
  creativity: int("creativity").default(50),
  integrity: int("integrity").default(100),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AgentVital = typeof agentVitals.$inferSelect;
export type InsertAgentVital = typeof agentVitals.$inferInsert;

export const agentMissions = mysqlTable("agent_missions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 128 }).notNull(),
  missionId: varchar("missionId", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMission = typeof agentMissions.$inferSelect;
export type InsertAgentMission = typeof agentMissions.$inferInsert;

export const agentCommunications = mysqlTable("agent_communications", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["moltbook", "gnox", "alert"]).notNull(),
  content: text("content").notNull(),
  targetAgentId: varchar("targetAgentId", { length: 128 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentCommunication = typeof agentCommunications.$inferSelect;
export type InsertAgentCommunication = typeof agentCommunications.$inferInsert;

// ============= STARTUPS =============

export const startups = mysqlTable("startups", {
  id: int("id").autoincrement().primaryKey(),
  startupId: varchar("startupId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["ideation", "development", "launch", "scaling", "mature"]).default("development"),
  developmentProgress: int("developmentProgress").default(0),
  successPotential: int("successPotential").default(50),
  validationStatus: varchar("validationStatus", { length: 255 }).default("pending"),
  leadAgentId: varchar("leadAgentId", { length: 128 }),
  budget: decimal("budget", { precision: 20, scale: 8 }).default("0"),
  spent: decimal("spent", { precision: 20, scale: 8 }).default("0"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;

export const startupMilestones = mysqlTable("startup_milestones", {
  id: int("id").autoincrement().primaryKey(),
  startupId: varchar("startupId", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: timestamp("targetDate"),
  completedAt: timestamp("completedAt"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StartupMilestone = typeof startupMilestones.$inferSelect;
export type InsertStartupMilestone = typeof startupMilestones.$inferInsert;

// ============= MISSIONS =============

export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  missionId: varchar("missionId", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  creatorAgentId: varchar("creatorAgentId", { length: 128 }).notNull(),
  assignedAgentId: varchar("assignedAgentId", { length: 128 }),
  requiredSkills: json("requiredSkills"),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "failed"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  progress: int("progress").default(0),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

// ============= FUNDING =============

export const fundingRequests = mysqlTable("funding_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 128 }).notNull().unique(),
  startupId: varchar("startupId", { length: 128 }).notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 20, scale: 8 }).notNull(),
  purpose: text("purpose"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "allocated"]).default("pending"),
  approvedBy: varchar("approvedBy", { length: 128 }),
  approvedAt: timestamp("approvedAt"),
  rejectedReason: text("rejectedReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingRequest = typeof fundingRequests.$inferSelect;
export type InsertFundingRequest = typeof fundingRequests.$inferInsert;

export const fundingAllocations = mysqlTable("funding_allocations", {
  id: int("id").autoincrement().primaryKey(),
  allocationId: varchar("allocationId", { length: 128 }).notNull().unique(),
  requestId: varchar("requestId", { length: 128 }).notNull(),
  startupId: varchar("startupId", { length: 128 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  allocatedBy: varchar("allocatedBy", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["allocated", "released", "revoked"]).default("allocated"),
  releasedAt: timestamp("releasedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FundingAllocation = typeof fundingAllocations.$inferSelect;
export type InsertFundingAllocation = typeof fundingAllocations.$inferInsert;

// ============= TELEMETRY =============

export const networkTelemetry = mysqlTable("network_telemetry", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 255 }).notNull(),
  metric: varchar("metric", { length: 255 }).notNull(),
  value: decimal("value", { precision: 20, scale: 8 }).notNull(),
  status: mysqlEnum("status", ["nominal", "warning", "critical"]).default("nominal"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type NetworkTelemetry = typeof networkTelemetry.$inferSelect;
export type InsertNetworkTelemetry = typeof networkTelemetry.$inferInsert;