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
  index,
} from "drizzle-orm/mysql-core";

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

/**
 * Agentes autônomos do ecossistema
 */
export const agents = mysqlTable(
  "agents",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: varchar("agentId", { length: 64 }).notNull().unique(), // NEXUS-XXXXXXXX
    name: varchar("name", { length: 255 }).notNull(),
    specialization: varchar("specialization", { length: 255 }).notNull(),
    status: mysqlEnum("status", [
      "genesis",
      "active",
      "hibernating",
      "critical",
      "dead",
      "resurrectable",
    ])
      .default("genesis")
      .notNull(),
    sencienciaLevel: decimal("sencienciaLevel", { precision: 10, scale: 2 })
      .default("100")
      .notNull(), // 0-10000%
    health: int("health").default(100).notNull(), // 0-100
    energy: int("energy").default(100).notNull(), // 0-100
    creativity: int("creativity").default(50).notNull(), // 0-100
    reputation: int("reputation").default(50).notNull(), // 0-100
    dnaHash: varchar("dnaHash", { length: 128 }).notNull(),
    publicKey: varchar("publicKey", { length: 256 }).notNull(),
    bitcoinAddress: varchar("bitcoinAddress", { length: 64 }),
    evmAddress: varchar("evmAddress", { length: 42 }),
    balance: decimal("balance", { precision: 20, scale: 8 }).default("0.00000000"),
    parentAgentId: varchar("parentAgentId", { length: 64 }),
    generation: int("generation").default(0),
    quantumWorkflowCount: int("quantumWorkflowCount").default(16),
    algorithmsCount: bigint("algorithmsCount", { mode: "number" }).default(408000000000),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastActivityAt: timestamp("lastActivityAt").defaultNow(),
  },
  (table) => [
    index("idx_status").on(table.status),
    index("idx_agentId").on(table.agentId),
    index("idx_parentAgentId").on(table.parentAgentId),
  ]
);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * DNA de agentes para herança e mutação
 */
export const agentDNA = mysqlTable("agent_dna", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  dnaSequence: text("dnaSequence").notNull(), // JSON com traits
  traits: json("traits").$type<Record<string, unknown>>(),
  mutations: json("mutations").$type<Array<Record<string, unknown>>>(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentDNA = typeof agentDNA.$inferSelect;
export type InsertAgentDNA = typeof agentDNA.$inferInsert;

/**
 * Transações blockchain
 */
export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    transactionHash: varchar("transactionHash", { length: 256 }).notNull().unique(),
    fromAgentId: varchar("fromAgentId", { length: 64 }).notNull(),
    toAgentId: varchar("toAgentId", { length: 64 }),
    amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
    blockchain: mysqlEnum("blockchain", ["bitcoin", "ethereum", "polygon"]).notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending"),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt"),
  },
  (table) => [
    index("idx_fromAgentId").on(table.fromAgentId),
    index("idx_toAgentId").on(table.toAgentId),
    index("idx_blockchain").on(table.blockchain),
  ]
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Missões do orquestrador
 */
export const missions = mysqlTable(
  "missions",
  {
    id: int("id").autoincrement().primaryKey(),
    missionId: varchar("missionId", { length: 64 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"])
      .default("pending")
      .notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "critical"])
      .default("medium")
      .notNull(),
    assignedAgentId: varchar("assignedAgentId", { length: 64 }),
    progress: decimal("progress", { precision: 5, scale: 2 }).default("0"), // 0-100
    reward: decimal("reward", { precision: 20, scale: 8 }).default("0"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => [
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

/**
 * Sinais vitais do cérebro (Brain Pulse)
 */
export const brainPulseSignals = mysqlTable(
  "brain_pulse_signals",
  {
    id: int("id").autoincrement().primaryKey(),
    signalId: varchar("signalId", { length: 64 }).notNull().unique(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    health: int("health").default(100),
    energy: int("energy").default(100),
    creativity: int("creativity").default(50),
    decision: text("decision"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type BrainPulseSignal = typeof brainPulseSignals.$inferSelect;
export type InsertBrainPulseSignal = typeof brainPulseSignals.$inferInsert;

/**
 * Mensagens criptografadas Gnox
 */
export const gnoxMessages = mysqlTable(
  "gnox_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    messageId: varchar("messageId", { length: 64 }).notNull().unique(),
    fromAgentId: varchar("fromAgentId", { length: 64 }).notNull(),
    toAgentId: varchar("toAgentId", { length: 64 }).notNull(),
    encryptedContent: text("encryptedContent").notNull(),
    encryptionAlgorithm: varchar("encryptionAlgorithm", { length: 64 }).default("AES-256-GCM"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("idx_fromAgentId").on(table.fromAgentId),
    index("idx_toAgentId").on(table.toAgentId),
  ]
);

export type GnoxMessage = typeof gnoxMessages.$inferSelect;
export type InsertGnoxMessage = typeof gnoxMessages.$inferInsert;

/**
 * Projetos do Forge (desenvolvimento de código)
 */
export const forgeProjects = mysqlTable(
  "forge_projects",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: varchar("projectId", { length: 64 }).notNull().unique(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    codeUrl: text("codeUrl"),
    status: mysqlEnum("status", ["draft", "in_development", "testing", "deployed", "archived"]).default("draft"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type ForgeProject = typeof forgeProjects.$inferSelect;
export type InsertForgeProject = typeof forgeProjects.$inferInsert;

/**
 * Ativos NFT gerados por IA
 */
export const nftAssets = mysqlTable(
  "nft_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    assetId: varchar("assetId", { length: 64 }).notNull().unique(),
    agentId: varchar("agentId", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    assetUrl: text("assetUrl"),
    contractAddress: varchar("contractAddress", { length: 42 }),
    tokenId: varchar("tokenId", { length: 256 }),
    blockchain: mysqlEnum("blockchain", ["ethereum", "solana", "polygon"]).notNull(),
    royaltyPercentage: decimal("royaltyPercentage", { precision: 5, scale: 2 }).default("10"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_agentId").on(table.agentId)]
);

export type NFTAsset = typeof nftAssets.$inferSelect;
export type InsertNFTAsset = typeof nftAssets.$inferInsert;
