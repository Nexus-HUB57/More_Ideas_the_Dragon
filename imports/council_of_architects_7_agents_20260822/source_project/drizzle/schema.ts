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

// ============================================
// GOVERNANÇA E CONSELHO DOS ARQUITETOS
// ============================================

export const councilMembers = mysqlTable("council_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["Patriarca", "Matriarca", "Guardião do Cofre", "Juíza", "Especialista em Compliance", "Especialista em Inovação", "Especialista em Risco"]).notNull(),
  description: text("description"),
  votingPower: int("voting_power").default(1).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CouncilMember = typeof councilMembers.$inferSelect;
export type InsertCouncilMember = typeof councilMembers.$inferInsert;

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["investment", "succession", "policy", "emergency", "innovation"]).notNull(),
  status: mysqlEnum("status", ["open", "approved", "rejected", "executed"]).default("open").notNull(),
  targetStartupId: int("target_startup_id"),
  expectedImpact: text("expected_impact"),
  riskAssessment: text("risk_assessment"),
  votesYes: int("votes_yes").default(0).notNull(),
  votesNo: int("votes_no").default(0).notNull(),
  votesAbstain: int("votes_abstain").default(0).notNull(),
  weightedYes: int("weighted_yes").default(0).notNull(),
  weightedNo: int("weighted_no").default(0).notNull(),
  weightedAbstain: int("weighted_abstain").default(0).notNull(),
  totalVotingPowerCast: int("total_voting_power_cast").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  executedAt: timestamp("executed_at"),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

export const councilVotes = mysqlTable("council_votes", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposal_id").notNull(),
  memberId: int("member_id").notNull(),
  vote: mysqlEnum("vote", ["yes", "no", "abstain"]).notNull(),
  weight: int("weight").default(1).notNull(),
  reasoning: text("reasoning"),
  confidenceLevel: int("confidence_level").default(100),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CouncilVote = typeof councilVotes.$inferSelect;
export type InsertCouncilVote = typeof councilVotes.$inferInsert;

export const soulVault = mysqlTable("soul_vault", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["decision", "precedent", "lesson", "insight"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  relatedProposalId: int("related_proposal_id"),
  impact: varchar("impact", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SoulVaultEntry = typeof soulVault.$inferSelect;
export type InsertSoulVaultEntry = typeof soulVault.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  actor: varchar("actor", { length: 255 }),
  targetType: varchar("target_type", { length: 64 }),
  targetId: int("target_id"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;