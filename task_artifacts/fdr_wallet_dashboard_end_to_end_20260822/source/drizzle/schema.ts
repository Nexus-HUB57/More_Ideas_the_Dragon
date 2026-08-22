import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

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

export const fdrTransactions = mysqlTable("fdr_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  amountBtc: varchar("amountBtc", { length: 32 }).notNull(),
  destinationAddress: varchar("destinationAddress", { length: 128 }).notNull(),
  sourceAddress: varchar("sourceAddress", { length: 128 }),
  sourceAddressPath: varchar("sourceAddressPath", { length: 64 }),
  feeSatoshi: bigint("feeSatoshi", { mode: "number" }).default(10000).notNull(),
  state: mysqlEnum("state", ["PENDING_A", "PENDING_B", "PENDING_C", "COMPLETED", "FAILED"]).default("PENDING_A").notNull(),
  rawTxUnsignedHex: text("rawTxUnsignedHex"),
  signedTxHex: text("signedTxHex"),
  txid: varchar("txid", { length: 128 }),
  network: varchar("network", { length: 32 }).default("bitcoin").notNull(),
  createdBy: varchar("createdBy", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FdrTransaction = typeof fdrTransactions.$inferSelect;
export type InsertFdrTransaction = typeof fdrTransactions.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 128 }).notNull(),
  protocol: varchar("protocol", { length: 16 }).notNull(), // Protocol_A, Protocol_B, Protocol_C
  details: text("details"),
  txId: varchar("txId", { length: 64 }),
  userOpenId: varchar("userOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
