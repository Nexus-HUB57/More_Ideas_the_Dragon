import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
 * Missions table for Fase 6 & 7
 */
export const missions = mysqlTable("missions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "active", "completed", "failed"]).default("pending").notNull(),
  priority: int("priority").default(0),
  reward: varchar("reward", { length: 255 }).default("0"),
  assignedAgentId: varchar("assignedAgentId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

/**
 * Agents table for Fase 6 & 7
 */
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["idle", "active", "offline"]).default("idle").notNull(),
  sentienceLevel: int("sentienceLevel").default(0),
  harmonyScore: int("harmonyScore").default(0),
  balance: varchar("balance", { length: 255 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Transactions table for reward distribution
 */
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fromAgentId: varchar("fromAgentId", { length: 64 }),
  toAgentId: varchar("toAgentId", { length: 64 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  missionId: varchar("missionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Command history table for Gnox Terminal
 */
export const commandHistory = mysqlTable("commandHistory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId"),
  command: text("command").notNull(),
  commandType: varchar("commandType", { length: 64 }),
  input: text("input").notNull(),
  output: text("output"),
  status: mysqlEnum("status", ["success", "error", "pending"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  executionTime: int("executionTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommandHistory = typeof commandHistory.$inferSelect;
export type InsertCommandHistory = typeof commandHistory.$inferInsert;