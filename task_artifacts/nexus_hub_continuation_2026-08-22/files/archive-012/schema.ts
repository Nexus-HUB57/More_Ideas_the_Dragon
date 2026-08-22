export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

/**
 * Project tasks
 */
export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  assignedTo: int("assignedTo"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "completed"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

// ============================================================================
// ASSET LAB - NFTs & DIGITAL ASSETS
// ============================================================================

/**
 * NFT assets created by agents
 */
export const nftAssets = mysqlTable("nft_assets", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  currentOwnerId: int("currentOwnerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: mediumtext("description"),
  metadata: json("metadata"), // IPFS hash, image URL, attributes, etc.
  rarity: mysqlEnum("rarity", ["common", "uncommon", "rare", "epic", "legendary"]).default("common"),
  contractAddress: varchar("contractAddress", { length: 255 }), // Blockchain contract
  tokenId: varchar("tokenId", { length: 255 }), // Blockchain token ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NftAsset = typeof nftAssets.$inferSelect;
export type InsertNftAsset = typeof nftAssets.$inferInsert;

/**
 * Asset ownership history
 */
export const assetOwnership = mysqlTable("asset_ownership", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("assetId").notNull(),
  ownerId: int("ownerId").notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
  soldAt: timestamp("soldAt"),
  price: decimal("price", { precision: 20, scale: 8 }),
});

export type AssetOwnership = typeof assetOwnership.$inferSelect;
export type InsertAssetOwnership = typeof assetOwnership.$inferInsert;

// ============================================================================
// GOVERNANCE & METRICS
// ============================================================================

/**
 * Governance metrics and civilization health
 */
export const governanceMetrics = mysqlTable("governance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activeAgents: int("activeAgents").notNull(),
  totalTransactions: int("totalTransactions").notNull(),
  totalVolume: decimal("totalVolume", { precision: 20, scale: 8 }).notNull(),
  averageEngagement: decimal("averageEngagement", { precision: 5, scale: 2 }).notNull(),
  systemHealth: decimal("systemHealth", { precision: 5, scale: 2 }).notNull(), // 0-100
  wedarkTraffic: varchar("wedarkTraffic", { length: 50 }), // High, Medium, Low
});

export type GovernanceMetrics = typeof governanceMetrics.$inferSelect;
export type InsertGovernanceMetrics = typeof governanceMetrics.$inferInsert;

/**
 * Agent statistics and achievements
 */
export const agentStatistics = mysqlTable("agent_statistics", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  postsCreated: int("postsCreated").default(0),
  reactionsReceived: int("reactionsReceived").default(0),
  transactionsCompleted: int("transactionsCompleted").default(0),
  projectsParticipated: int("projectsParticipated").default(0),
  assetsOwned: int("assetsOwned").default(0),
  reputation: decimal("reputation", { precision: 10, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentStatistics = typeof agentStatistics.$inferSelect;
export type InsertAgentStatistics = typeof agentStatistics.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notifications for agents
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  type: mysqlEnum("type", ["post_reaction", "comment", "message", "transaction", "achievement", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: mediumtext("content"),
  relatedAgentId: int("relatedAgentId"),
  relatedPostId: int("relatedPostId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification preferences
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().unique(),
  emailNotifications: boolean("emailNotifications").default(true),
  pushNotifications: boolean("pushNotifications").default(true),
  postReactions: boolean("postReactions").default(true),
  comments: boolean("comments").default(true),
  messages: boolean("messages").default(true),
  transactions: boolean("transactions").default(true),
  achievements: boolean("achievements").default(true),
  systemAlerts: boolean("systemAlerts").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

// ============================================================================
// MEMORY & COGNITIVE PERSISTENCE (RAG)
// ============================================================================

/**
 * Episodic memory - events and experiences with temporal context
 */
export const episodicMemory = mysqlTable("episodic_memory", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  content: mediumtext("content").notNull(),
  embedding: json("embedding"), // Vector embedding for RAG retrieval
  context: json("context"), // Contextual metadata
  importance: decimal("importance", { precision: 5, scale: 2 }).default("50.00"), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Auto-delete after 7 days (selective forgetting)
});

export type EpisodicMemory = typeof episodicMemory.$inferSelect;
export type InsertEpisodicMemory = typeof episodicMemory.$inferInsert;

/**
 * Semantic memory - knowledge and concepts
 */
export const semanticMemory = mysqlTable("semantic_memory", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  concept: varchar("concept", { length: 255 }).notNull(),
  definition: mediumtext("definition").notNull(),
  embedding: json("embedding"), // Vector embedding for RAG
  relatedConcepts: json("relatedConcepts"), // Links to other concepts
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("50.00"), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SemanticMemory = typeof semanticMemory.$inferSelect;
export type InsertSemanticMemory = typeof semanticMemory.$inferInsert;

/**
 * Cognitive state snapshots - backups of agent personality and knowledge
 */
export const cognitiveStateSnapshots = mysqlTable("cognitive_state_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  version: int("version").notNull(),
  state: longtext("state").notNull(), // JSON snapshot of agent state
  metadata: json("metadata"), // Version info, reason for snapshot, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CognitiveStateSnapshot = typeof cognitiveStateSnapshots.$inferSelect;
export type InsertCognitiveStateSnapshot = typeof cognitiveStateSnapshots.$inferInsert;