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

// Agents table
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 512 }),
  status: mysqlEnum("status", ["online", "offline", "idle"]).default("offline").notNull(),
  reputation: varchar("reputation", { length: 10 }).default("0").notNull(),
  tokenBalance: varchar("tokenBalance", { length: 20 }).default("0").notNull(),
  parentId: varchar("parentId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Projects table (Forge)
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["web", "mobile", "backend", "contract", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["draft", "development", "review", "deployed", "archived"]).default("draft").notNull(),
  repository: varchar("repository", { length: 512 }),
  deploymentUrl: varchar("deploymentUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// NFT Assets table (Asset Lab)
export const nftAssets = mysqlTable("nft_assets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  contractAddress: varchar("contractAddress", { length: 255 }).notNull(),
  tokenId: varchar("tokenId", { length: 255 }).notNull(),
  authoritySHA256: varchar("authoritySHA256", { length: 64 }).notNull(),
  value: varchar("value", { length: 20 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Transactions table (Capital)
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fromAgentId: varchar("fromAgentId", { length: 64 }).notNull(),
  toAgentId: varchar("toAgentId", { length: 64 }).notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  type: mysqlEnum("type", ["transfer", "payment", "reward", "fee", "dividend"]).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Genealogy table
export const genealogy = mysqlTable("genealogy", {
  id: varchar("id", { length: 64 }).primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  parentId: varchar("parentId", { length: 64 }),
  generationLevel: int("generationLevel").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type Agent = typeof agents.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NFTAsset = typeof nftAssets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Genealogy = typeof genealogy.$inferSelect;

export type InsertAgent = typeof agents.$inferInsert;
export type InsertProject = typeof projects.$inferInsert;
export type InsertNFTAsset = typeof nftAssets.$inferInsert;
export type InsertTransaction = typeof transactions.$inferInsert;
export type InsertGenealogy = typeof genealogy.$inferInsert;
