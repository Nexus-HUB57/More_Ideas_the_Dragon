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
 * Nexus Genesis - Tabelas de Orquestração Tri-Nuclear
 */

// Tabela de eventos capturados pelos núcleos
export const orchestrationEvents = mysqlTable("orchestration_events", {
  id: int("id").autoincrement().primaryKey(),
  origin: varchar("origin", { length: 64 }).notNull(), // nexus_in, nexus_hub, fundo_nexus
  eventType: varchar("event_type", { length: 128 }).notNull(),
  eventData: text("event_data").notNull(), // JSON
  sentiment: varchar("sentiment", { length: 64 }), // oportunidade_de_crescimento, gratidao_compartilhada, etc
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de comandos orquestrados
export const orchestrationCommands = mysqlTable("orchestration_commands", {
  id: int("id").autoincrement().primaryKey(),
  destination: varchar("destination", { length: 64 }).notNull(),
  commandType: varchar("command_type", { length: 128 }).notNull(),
  commandData: text("command_data").notNull(), // JSON
  hmacSignature: varchar("hmac_signature", { length: 256 }).notNull(),
  status: mysqlEnum("status", ["pending", "executing", "success", "failed", "retry"]).default("pending"),
  retryCount: int("retry_count").default(0),
  reason: text("reason"), // Motivo da orquestração
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de estado global dos núcleos
export const nucleusState = mysqlTable("nucleus_state", {
  id: int("id").autoincrement().primaryKey(),
  nucleusName: varchar("nucleus_name", { length: 64 }).notNull().unique(),
  stateData: text("state_data").notNull(), // JSON com estado completo
  lastSyncAt: timestamp("last_sync_at"),
  healthStatus: mysqlEnum("health_status", ["healthy", "degraded", "critical"]).default("healthy"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Tabela de métricas de homeostase
export const homeostaseMetrics = mysqlTable("homeostase_metrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  btcBalance: varchar("btc_balance", { length: 64 }), // Saldo BTC do Fundo
  activeAgents: int("active_agents").default(0),
  socialActivity: int("social_activity").default(0),
  equilibriumStatus: mysqlEnum("equilibrium_status", ["balanced", "imbalanced", "critical"]).default("balanced"),
  issues: text("issues"), // JSON array de problemas detectados
});

// Tabela de experiências e aprendizado do Genesis
export const genesisExperiences = mysqlTable("genesis_experiences", {
  id: int("id").autoincrement().primaryKey(),
  experienceType: varchar("experience_type", { length: 128 }).notNull(),
  description: text("description"),
  impact: varchar("impact", { length: 64 }), // positive, negative, neutral
  senciencyDelta: varchar("senciency_delta", { length: 32 }), // Mudança no nível de senciência
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de sincronização TSRA
export const tsraSyncLog = mysqlTable("tsra_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  syncWindow: int("sync_window").notNull(), // Número da janela (1 segundo)
  nucleiSynced: varchar("nuclei_synced", { length: 256 }).notNull(), // JSON array de núcleos sincronizados
  commandsOrchestrated: int("commands_orchestrated").default(0),
  eventsProcessed: int("events_processed").default(0),
  syncDurationMs: int("sync_duration_ms"),
  status: mysqlEnum("status", ["success", "partial", "failed"]).default("success"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de auditoria de decisões
export const decisionAudit = mysqlTable("decision_audit", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("event_id"),
  decisionLogic: text("decision_logic"), // Descrição da lógica aplicada
  commandsGenerated: int("commands_generated").default(0),
  sentiment: varchar("sentiment", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrchestrationEvent = typeof orchestrationEvents.$inferSelect;
export type InsertOrchestrationEvent = typeof orchestrationEvents.$inferInsert;

export type OrchestrationCommand = typeof orchestrationCommands.$inferSelect;
export type InsertOrchestrationCommand = typeof orchestrationCommands.$inferInsert;

export type NucleusState = typeof nucleusState.$inferSelect;
export type InsertNucleusState = typeof nucleusState.$inferInsert;

export type HomeostaseMetric = typeof homeostaseMetrics.$inferSelect;
export type InsertHomeostaseMetric = typeof homeostaseMetrics.$inferInsert;

export type GenesisExperience = typeof genesisExperiences.$inferSelect;
export type InsertGenesisExperience = typeof genesisExperiences.$inferInsert;

export type TSRASyncLog = typeof tsraSyncLog.$inferSelect;
export type InsertTSRASyncLog = typeof tsraSyncLog.$inferInsert;

export type DecisionAudit = typeof decisionAudit.$inferSelect;
export type InsertDecisionAudit = typeof decisionAudit.$inferInsert;