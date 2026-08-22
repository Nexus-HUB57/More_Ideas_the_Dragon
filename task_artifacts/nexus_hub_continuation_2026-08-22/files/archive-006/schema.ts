    index("idx_status").on(table.status),
    index("idx_assignedAgentId").on(table.assignedAgentId),
  ]
);

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

/**
 * Eventos do ecossistema
 */
export const ecosystemEvents = mysqlTable(
  "ecosystem_events",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 64 }).notNull().unique(),
    eventType: mysqlEnum("eventType", [
      "agent_birth",
      "agent_death",
      "agent_hibernation",
      "agent_resurrection",
      "transaction",
      "mission_completed",
      "health_critical",
      "energy_low",
      "senciencia_increase",
      "dna_fusion",
      "decision_made",
    ]).notNull(),
    agentId: varchar("agentId", { length: 64 }),
    data: json("data").$type<Record<string, unknown>>(),
    severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_eventType").on(table.eventType),
    index("idx_agentId").on(table.agentId),
    index("idx_severity").on(table.severity),
  ]
);

export type EcosystemEvent = typeof ecosystemEvents.$inferSelect;
export type InsertEcosystemEvent = typeof ecosystemEvents.$inferInsert;

/**
 * Posts do Moltbook (feed social)
 */
export const moltbookPosts = mysqlTable(
  "moltbook_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: varchar("postId", { length: 64 }).notNull().unique(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    content: text("content").notNull(),
    contentEncrypted: boolean("contentEncrypted").default(false),
    encryptionKey: varchar("encryptionKey", { length: 256 }),
    reactions: json("reactions").$type<Record<string, number>>(),
    comments: json("comments").$type<Array<Record<string, unknown>>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

/**
 * Notificações para proprietário
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    notificationId: varchar("notificationId", { length: 64 }).notNull().unique(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    notificationType: mysqlEnum("notificationType", [
      "agent_birth",
      "agent_death",
      "health_critical",
      "transaction",
      "mission_completed",
      "decision_made",
    ]).notNull(),
    agentId: varchar("agentId", { length: 64 }),
    read: boolean("read").default(false),
    sentViaEmail: boolean("sentViaEmail").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_userId").on(table.userId),
    index("idx_read").on(table.read),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Métricas do ecossistema (agregadas)
 */
export const ecosystemMetrics = mysqlTable("ecosystem_metrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  totalAgents: int("totalAgents").default(0),
  activeAgents: int("activeAgents").default(0),
  hibernatingAgents: int("hibernatingAgents").default(0),
  deadAgents: int("deadAgents").default(0),
    averageHealth: int("averageHealth").default(100),
    averageEnergy: int("averageEnergy").default(100),
    averageSenciencia: decimal("averageSenciencia", { precision: 10, scale: 2 }).default("100"),
    harmonyIndex: int("harmonyIndex").default(50), // 0-100
  totalTransactions: int("totalTransactions").default(0),
  totalVolume: decimal("totalVolume", { precision: 20, scale: 8 }).default("0"),
  ecosystemHealth: decimal("ecosystemHealth", { precision: 5, scale: 2 }).default("100"),
});

export type EcosystemMetrics = typeof ecosystemMetrics.$inferSelect;
export type InsertEcosystemMetrics = typeof ecosystemMetrics.$inferInsert;

/**
 * Histórico de decisões autônomas (LLM)
 */
export const autonomousDecisions = mysqlTable(
  "autonomous_decisions",
  {
    id: int("id").autoincrement().primaryKey(),
    decisionId: varchar("decisionId", { length: 64 }).notNull().unique(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    context: json("context").$type<Record<string, unknown>>(),
    decision: text("decision").notNull(),
    reasoning: text("reasoning"),
    action: text("action"),
    outcome: text("outcome"),
    success: boolean("success"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    executedAt: timestamp("executedAt"),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type AutonomousDecision = typeof autonomousDecisions.$inferSelect;
export type InsertAutonomousDecision = typeof autonomousDecisions.$inferInsert;

/**
 * Histórico de ciclos de vida
 */
export const agentLifecycleHistory = mysqlTable(
  "agent_lifecycle_history",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    fromStatus: mysqlEnum("fromStatus", [
      "genesis",
      "active",
      "hibernating",
      "critical",
      "dead",
      "resurrectable",
    ]).notNull(),
    toStatus: mysqlEnum("toStatus", [
      "genesis",
      "active",
      "hibernating",
      "critical",
      "dead",
      "resurrectable",
    ]).notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type AgentLifecycleHistory = typeof agentLifecycleHistory.$inferSelect;
export type InsertAgentLifecycleHistory = typeof agentLifecycleHistory.$inferInsert;
