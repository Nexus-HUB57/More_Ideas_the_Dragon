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

/**
 * Tabela para armazenar códigos de bind gerados
 */
export const bindCodes = mysqlTable("bindCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  format: varchar("format", { length: 255 }).notNull(), // ex: ":bind CODE"
  status: mysqlEnum("status", ["active", "used", "expired", "revoked"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  usedAt: timestamp("usedAt"),
  usedBy: varchar("usedBy", { length: 255 }), // Telegram user ID or identifier
  description: text("description"),
});

export type BindCode = typeof bindCodes.$inferSelect;
export type InsertBindCode = typeof bindCodes.$inferInsert;

/**
 * Tabela para histórico de binds realizados
 */
export const bindHistory = mysqlTable("bindHistory", {
  id: int("id").autoincrement().primaryKey(),
  bindCodeId: int("bindCodeId").notNull(),
  nucleusId: varchar("nucleusId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "confirmed", "failed"]).default("pending").notNull(),
  telegramResponse: text("telegramResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  errorMessage: text("errorMessage"),
});

export type BindHistory = typeof bindHistory.$inferSelect;
export type InsertBindHistory = typeof bindHistory.$inferInsert;

/**
 * Tabela para status dos núcleos orquestradores
 */
export const nucleusStatus = mysqlTable("nucleusStatus", {
  id: int("id").autoincrement().primaryKey(),
  nucleusId: varchar("nucleusId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["primary", "secondary", "tertiary"]).default("primary").notNull(),
  status: mysqlEnum("status", ["online", "offline", "syncing", "error"]).default("offline").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  lastHeartbeat: timestamp("lastHeartbeat"),
  syncProgress: int("syncProgress").default(0), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NucleusStatus = typeof nucleusStatus.$inferSelect;
export type InsertNucleusStatus = typeof nucleusStatus.$inferInsert;

/**
 * Tabela para logs de atividades
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description"),
  resourceType: varchar("resourceType", { length: 64 }),
  resourceId: varchar("resourceId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;