import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar, decimal } from "drizzle-orm/mysql-core";

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
  role: varchar("role", { length: 255 }).notNull(),
  description: text("description"),
  votingPower: int("voting_power").default(1).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CouncilMember = typeof councilMembers.$inferSelect;
export type InsertCouncilMember = typeof councilMembers.$inferInsert;

// ============================================
// STARTUPS E ESTRUTURA
// ============================================

export const startups = mysqlTable("startups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ceoId: int("ceo_id"),
  status: mysqlEnum("status", ["planning", "development", "launched", "scaling", "mature", "archived"]).default("planning").notNull(),
  isCore: boolean("is_core").default(false).notNull(),
  traction: int("traction").default(0).notNull(),
  revenue: int("revenue").default(0).notNull(),
  reputation: int("reputation").default(0).notNull(),
  generation: int("generation").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;

// ============================================
// AGENTES IA ESPECIALIZADOS
// ============================================

export const aiAgents = mysqlTable("ai_agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  startupId: int("startup_id"),
  role: mysqlEnum("role", ["cto", "cmo", "cfo", "cdo", "ceo", "legal", "redteam"]).notNull(),
  dnaHash: varchar("dna_hash", { length: 64 }),
  reputation: int("reputation").default(0).notNull(),
  health: int("health").default(100).notNull(),
  energy: int("energy").default(100).notNull(),
  creativity: int("creativity").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertAiAgent = typeof aiAgents.$inferInsert;

// ============================================
// AGENTES EXECUTIVOS C-LEVEL
// ============================================

export const executiveAgents = mysqlTable("executive_agents", {
  id: int("id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]).notNull().unique(),
  nucleus: mysqlEnum("nucleus", ["CEO", "CTO", "COO", "CFO", "CRO"]).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  mandate: text("mandate").notNull(),
  reportsTo: varchar("reports_to", { length: 32 }).notNull(),
  authorityTier: int("authority_tier").notNull(),
  autonomyMode: varchar("autonomy_mode", { length: 64 }).notNull(),
  maxBudgetBps: int("max_budget_bps").notNull(),
  status: mysqlEnum("status", ["active", "paused", "quarantined"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nucleusIdx: index("executive_agents_nucleus_idx").on(table.nucleus),
  statusIdx: index("executive_agents_status_idx").on(table.status),
}));

export type ExecutiveAgent = typeof executiveAgents.$inferSelect;
export type InsertExecutiveAgent = typeof executiveAgents.$inferInsert;

export const executiveSkills = mysqlTable("executive_skills", {
  id: int("id").autoincrement().primaryKey(),
  skillKey: varchar("skill_key", { length: 96 }).notNull().unique(),
  role: mysqlEnum("role", ["CEO", "CTO", "CPO", "COO", "CFO", "CRO"]).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull(),
  artifact: varchar("artifact", { length: 160 }).notNull(),
  risk: mysqlEnum("risk", ["low", "medium", "high"]).notNull(),
  autonomy: mysqlEnum("autonomy", ["recommend", "execute_reversible", "execute_guarded"]).notNull(),
  kpis: text("kpis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  roleIdx: index("executive_skills_role_idx").on(table.role),
  riskIdx: index("executive_skills_risk_idx").on(table.risk),
}));

export type ExecutiveSkill = typeof executiveSkills.$inferSelect;
export type InsertExecutiveSkill = typeof executiveSkills.$inferInsert;

// ============================================
// VOTAÇÕES DO CONSELHO
// ============================================

export const councilVotes = mysqlTable("council_votes", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposal_id").notNull(),
  memberId: int("member_id").notNull(),
  vote: mysqlEnum("vote", ["yes", "no", "abstain"]).notNull(),
  weight: int("weight").default(1).notNull(),
  reasoning: text("reasoning"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CouncilVote = typeof councilVotes.$inferSelect;
export type InsertCouncilVote = typeof councilVotes.$inferInsert;

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["investment", "succession", "policy", "emergency", "innovation"]).notNull(),
  status: mysqlEnum("status", ["open", "approved", "rejected", "executed"]).default("open").notNull(),
  targetStartupId: int("target_startup_id"),
  votesYes: int("votes_yes").default(0).notNull(),
  votesNo: int("votes_no").default(0).notNull(),
  votesAbstain: int("votes_abstain").default(0).notNull(),
  totalWeight: int("total_weight").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

// ============================================
// FINANÇAS E TESOURARIA V2
// ============================================

export const masterVault = mysqlTable("master_vault", {
  id: int("id").autoincrement().primaryKey(),
  totalBalance: int("total_balance").default(0).notNull(),
  btcReserve: int("btc_reserve").default(0).notNull(),
  liquidityFund: int("liquidity_fund").default(0).notNull(),
  infrastructureFund: int("infrastructure_fund").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
});

export type MasterVault = typeof masterVault.$inferSelect;
export type InsertMasterVault = typeof masterVault.$inferInsert;

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  fromId: int("from_id"),
  toId: int("to_id"),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["transfer", "investment", "revenue", "arbitrage", "distribution"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ============================================
// MARKET ORACLE V2
// ============================================

export const marketData = mysqlTable("market_data", {
  id: int("id").autoincrement().primaryKey(),
  asset: varchar("asset", { length: 64 }).notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 2 }),
  sentiment: varchar("sentiment", { length: 32 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  source: varchar("source", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;

export const marketInsights = mysqlTable("market_insights", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  sentiment: mysqlEnum("sentiment", ["bullish", "bearish", "neutral"]).notNull(),
  confidence: int("confidence").notNull(),
  relatedAssets: text("related_assets"),
  source: varchar("source", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketInsight = typeof marketInsights.$inferSelect;
export type InsertMarketInsight = typeof marketInsights.$inferInsert;

// ============================================
// ARBITRAGEM PREDITIVA (NAC)
// ============================================

export const arbitrageOpportunities = mysqlTable("arbitrage_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  asset: varchar("asset", { length: 64 }).notNull(),
  exchangeFrom: varchar("exchange_from", { length: 64 }).notNull(),
  exchangeTo: varchar("exchange_to", { length: 64 }).notNull(),
  priceDifference: decimal("price_difference", { precision: 18, scale: 8 }).notNull(),
  profitPotential: decimal("profit_potential", { precision: 18, scale: 8 }).notNull(),
  confidence: int("confidence").notNull(),
  status: mysqlEnum("status", ["identified", "executing", "completed", "failed"]).default("identified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
});

export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;
export type InsertArbitrageOpportunity = typeof arbitrageOpportunities.$inferInsert;

// ============================================
// SOUL VAULT - MEMÓRIA INSTITUCIONAL
// ============================================

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

// ============================================
// MOLTBOOK - FEED SOCIAL
// ============================================

export const moltbookPosts = mysqlTable("moltbook_posts", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startup_id").notNull(),
  agentId: int("agent_id"),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["update", "achievement", "milestone", "announcement"]).notNull(),
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MoltbookPost = typeof moltbookPosts.$inferSelect;
export type InsertMoltbookPost = typeof moltbookPosts.$inferInsert;

// ============================================
// PERFORMANCE E RANKING
// ============================================

export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startup_id").notNull(),
  revenue: int("revenue").default(0).notNull(),
  userGrowth: int("user_growth").default(0).notNull(),
  productQuality: int("product_quality").default(0).notNull(),
  marketFit: int("market_fit").default(0).notNull(),
  overallScore: int("overall_score").default(0).notNull(),
  rank: int("rank").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// ============================================
// AUDITORIA E COMPLIANCE
// ============================================

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  actor: varchar("actor", { length: 255 }),
  targetType: varchar("target_type", { length: 64 }),
  targetId: int("target_id"),
  details: text("details"),
  s3Key: varchar("s3_key", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// ORQUESTRADOR DE STARTUPS
// ============================================

export const orchestratorMissions = mysqlTable("orchestrator_missions", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startup_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  stage: mysqlEnum("stage", ["discovery", "validation", "build", "launch", "scale"]).notNull(),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  status: mysqlEnum("status", ["backlog", "ready", "running", "blocked", "review", "completed", "cancelled"]).default("backlog").notNull(),
  owner: varchar("owner", { length: 128 }).notNull(),
  dueAt: timestamp("due_at"),
  riskScore: int("risk_score").default(0).notNull(),
  executiveRole: varchar("executive_role", { length: 16 }),
  skillKey: varchar("skill_key", { length: 96 }),
  evidenceRef: varchar("evidence_ref", { length: 512 }),
  approvalRef: varchar("approval_ref", { length: 255 }),
  rollbackPlan: text("rollback_plan"),
  idempotencyKey: varchar("idempotency_key", { length: 255 }),
  securityReviewRef: varchar("security_review_ref", { length: 255 }),
  auditRef: varchar("audit_ref", { length: 255 }),
  externalSideEffect: boolean("external_side_effect").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrchestratorMission = typeof orchestratorMissions.$inferSelect;
export type InsertOrchestratorMission = typeof orchestratorMissions.$inferInsert;

export const orchestratorEvents = mysqlTable("orchestrator_events", {
  id: int("id").autoincrement().primaryKey(),
  missionId: int("mission_id").notNull(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  fromStatus: varchar("from_status", { length: 32 }),
  toStatus: varchar("to_status", { length: 32 }),
  actor: varchar("actor", { length: 128 }).notNull(),
  payload: text("payload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrchestratorEvent = typeof orchestratorEvents.$inferSelect;
export type InsertOrchestratorEvent = typeof orchestratorEvents.$inferInsert;

export const orchestratorJobRuns = mysqlTable("orchestrator_job_runs", {
  id: int("id").autoincrement().primaryKey(),
  jobName: varchar("job_name", { length: 128 }).notNull(),
  runKey: varchar("run_key", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  recordsProcessed: int("records_processed").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  runKeyUnique: uniqueIndex("orchestrator_job_runs_run_key_unique").on(table.runKey),
  jobNameIdx: index("orchestrator_job_runs_job_name_idx").on(table.jobName),
}));

export type OrchestratorJobRun = typeof orchestratorJobRuns.$inferSelect;
export type InsertOrchestratorJobRun = typeof orchestratorJobRuns.$inferInsert;

export const orchestratorAdapterDispatches = mysqlTable("orchestrator_adapter_dispatches", {
  id: int("id").autoincrement().primaryKey(),
  adapter: varchar("adapter", { length: 128 }).notNull(),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
  requestId: varchar("request_id", { length: 128 }).notNull(),
  targetHost: varchar("target_host", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["requested", "accepted", "failed"]).default("requested").notNull(),
  responseCode: int("response_code"),
  responseBody: text("response_body"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  idempotencyUnique: uniqueIndex("orchestrator_adapter_dispatches_idempotency_unique").on(table.idempotencyKey),
  statusIdx: index("orchestrator_adapter_dispatches_status_idx").on(table.status),
}));

export type OrchestratorAdapterDispatch = typeof orchestratorAdapterDispatches.$inferSelect;
export type InsertOrchestratorAdapterDispatch = typeof orchestratorAdapterDispatches.$inferInsert;

export const startupSignalSnapshots = mysqlTable("startup_signal_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  startupId: int("startup_id").notNull(),
  readinessScore: int("readiness_score").notNull(),
  signal: mysqlEnum("signal", ["validate", "accelerate", "scale", "stabilize"]).notNull(),
  recommendedAction: varchar("recommended_action", { length: 500 }).notNull(),
  evidence: text("evidence").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  startupIdx: index("startup_signal_snapshots_startup_idx").on(table.startupId),
  createdIdx: index("startup_signal_snapshots_created_idx").on(table.createdAt),
}));

export type StartupSignalSnapshot = typeof startupSignalSnapshots.$inferSelect;
export type InsertStartupSignalSnapshot = typeof startupSignalSnapshots.$inferInsert;

// ============================================
// ORGANISMO VIVO: MEMÓRIA, AUTO-CURA E EVOLUÇÃO
// ============================================

export const organismMemories = mysqlTable("organism_memories", {
  id: int("id").autoincrement().primaryKey(),
  scope: varchar("scope", { length: 96 }).notNull(),
  memoryKey: varchar("memory_key", { length: 255 }).notNull(),
  content: text("content").notNull(),
  memoryType: mysqlEnum("memory_type", ["episodic", "semantic", "procedural", "strategic"]).notNull(),
  confidence: int("confidence").default(0).notNull(),
  sourceRef: varchar("source_ref", { length: 512 }),
  version: int("version").default(1).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keyUnique: uniqueIndex("organism_memories_scope_key_unique").on(table.scope, table.memoryKey),
  scopeIdx: index("organism_memories_scope_idx").on(table.scope),
  confidenceIdx: index("organism_memories_confidence_idx").on(table.confidence),
}));

export type OrganismMemory = typeof organismMemories.$inferSelect;
export type InsertOrganismMemory = typeof organismMemories.$inferInsert;

export const organismIncidents = mysqlTable("organism_incidents", {
  id: int("id").autoincrement().primaryKey(),
  incidentKey: varchar("incident_key", { length: 255 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  status: mysqlEnum("status", ["detected", "diagnosing", "remediating", "resolved", "escalated"]).default("detected").notNull(),
  symptom: text("symptom").notNull(),
  diagnosis: text("diagnosis"),
  remediation: text("remediation"),
  attempts: int("attempts").default(0).notNull(),
  rollbackRef: varchar("rollback_ref", { length: 512 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  incidentKeyUnique: uniqueIndex("organism_incidents_key_unique").on(table.incidentKey),
  statusIdx: index("organism_incidents_status_idx").on(table.status),
  severityIdx: index("organism_incidents_severity_idx").on(table.severity),
}));

export type OrganismIncident = typeof organismIncidents.$inferSelect;
export type InsertOrganismIncident = typeof organismIncidents.$inferInsert;

export const organismEvolutionProposals = mysqlTable("organism_evolution_proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposalKey: varchar("proposal_key", { length: 255 }).notNull(),
  target: varchar("target", { length: 255 }).notNull(),
  rationale: text("rationale").notNull(),
  evidence: text("evidence").notNull(),
  changeSet: text("change_set").notNull(),
  status: mysqlEnum("status", ["proposed", "approved", "applied", "rejected", "rolled_back"]).default("proposed").notNull(),
  harnessScore: int("harness_score").default(0).notNull(),
  version: int("version").default(1).notNull(),
  rollbackRef: varchar("rollback_ref", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  proposalKeyUnique: uniqueIndex("organism_evolution_proposals_key_unique").on(table.proposalKey),
  statusIdx: index("organism_evolution_proposals_status_idx").on(table.status),
  targetIdx: index("organism_evolution_proposals_target_idx").on(table.target),
}));

export type OrganismEvolutionProposal = typeof organismEvolutionProposals.$inferSelect;
export type InsertOrganismEvolutionProposal = typeof organismEvolutionProposals.$inferInsert;


// ============================================
// MOLTBOOK DE IDEIAS, LÓGICA E AMBIGUIDADE
// ============================================

export const ideaNodes = mysqlTable("idea_nodes", {
  id: int("id").autoincrement().primaryKey(),
  stableKey: varchar("stable_key", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  kind: mysqlEnum("kind", ["hypothesis", "thesis", "question", "opportunity", "decision", "objection", "principle", "signal"]).notNull(),
  authorType: mysqlEnum("author_type", ["user", "agent", "system"]).notNull(),
  authorRef: varchar("author_ref", { length: 128 }).notNull(),
  state: mysqlEnum("state", ["draft", "active", "validated", "contested", "superseded", "archived"]).default("draft").notNull(),
  confidenceBps: int("confidence_bps").default(0).notNull(),
  ambiguityBps: int("ambiguity_bps").default(10_000).notNull(),
  logicalTime: int("logical_time").default(0).notNull(),
  currentVersion: int("current_version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  kindIdx: index("idea_nodes_kind_idx").on(table.kind),
  stateIdx: index("idea_nodes_state_idx").on(table.state),
  ambiguityIdx: index("idea_nodes_ambiguity_idx").on(table.ambiguityBps),
}));

export type IdeaNode = typeof ideaNodes.$inferSelect;
export type InsertIdeaNode = typeof ideaNodes.$inferInsert;

export const ideaVersions = mysqlTable("idea_versions", {
  id: int("id").autoincrement().primaryKey(),
  ideaId: int("idea_id").notNull(),
  version: int("version").notNull(),
  content: text("content").notNull(),
  changeReason: text("change_reason").notNull(),
  evidenceRefs: text("evidence_refs").notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  logicalTime: int("logical_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ideaVersionIdx: index("idea_versions_idea_version_idx").on(table.ideaId, table.version),
}));

export type IdeaVersion = typeof ideaVersions.$inferSelect;
export type InsertIdeaVersion = typeof ideaVersions.$inferInsert;

export const relationEdges = mysqlTable("relation_edges", {
  id: int("id").autoincrement().primaryKey(),
  fromIdeaId: int("from_idea_id").notNull(),
  toIdeaId: int("to_idea_id").notNull(),
  relation: mysqlEnum("relation", ["supports", "contradicts", "depends_on", "refines", "instantiates", "analogous_to", "supersedes", "causes"]).notNull(),
  strengthBps: int("strength_bps").default(0).notNull(),
  justification: text("justification").notNull(),
  evidenceRefs: text("evidence_refs").notNull(),
  validFromLogicalTime: int("valid_from_logical_time").notNull(),
  validUntilLogicalTime: int("valid_until_logical_time"),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  fromIdx: index("relation_edges_from_idx").on(table.fromIdeaId),
  toIdx: index("relation_edges_to_idx").on(table.toIdeaId),
  relationIdx: index("relation_edges_relation_idx").on(table.relation),
}));

export type RelationEdge = typeof relationEdges.$inferSelect;
export type InsertRelationEdge = typeof relationEdges.$inferInsert;

export const ambiguitySets = mysqlTable("ambiguity_sets", {
  id: int("id").autoincrement().primaryKey(),
  subjectIdeaId: int("subject_idea_id").notNull(),
  level: mysqlEnum("level", ["A0", "A1", "A2", "A3", "A4"]).notNull(),
  scoreBps: int("score_bps").default(10_000).notNull(),
  invariant: text("invariant").notNull(),
  disambiguationQuestion: text("disambiguation_question").notNull(),
  ownerRef: varchar("owner_ref", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["open", "reduced", "blocked", "resolved"]).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  subjectIdx: index("ambiguity_sets_subject_idx").on(table.subjectIdeaId),
  levelIdx: index("ambiguity_sets_level_idx").on(table.level),
}));

export type AmbiguitySet = typeof ambiguitySets.$inferSelect;
export type InsertAmbiguitySet = typeof ambiguitySets.$inferInsert;

export const ambiguityInterpretations = mysqlTable("ambiguity_interpretations", {
  id: int("id").autoincrement().primaryKey(),
  ambiguitySetId: int("ambiguity_set_id").notNull(),
  interpretation: text("interpretation").notNull(),
  plausibilityBps: int("plausibility_bps").default(0).notNull(),
  consequence: text("consequence").notNull(),
  disambiguatingEvidence: text("disambiguating_evidence").notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ambiguityIdx: index("ambiguity_interpretations_set_idx").on(table.ambiguitySetId),
}));

export type AmbiguityInterpretation = typeof ambiguityInterpretations.$inferSelect;
export type InsertAmbiguityInterpretation = typeof ambiguityInterpretations.$inferInsert;

export const processIntents = mysqlTable("process_intents", {
  id: int("id").autoincrement().primaryKey(),
  ideaId: int("idea_id").notNull(),
  objective: text("objective").notNull(),
  preconditions: text("preconditions").notNull(),
  steps: text("steps").notNull(),
  successEvidence: text("success_evidence").notNull(),
  recoveryPlan: text("recovery_plan").notNull(),
  autonomy: mysqlEnum("autonomy", ["recommend", "execute_reversible", "execute_guarded"]).notNull(),
  risk: mysqlEnum("risk", ["low", "medium", "high", "critical"]).notNull(),
  budgetUnits: int("budget_units").notNull(),
  status: mysqlEnum("status", ["proposed", "approved", "running", "completed", "blocked", "failed"]).default("proposed").notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ideaIdx: index("process_intents_idea_idx").on(table.ideaId),
  statusIdx: index("process_intents_status_idx").on(table.status),
}));

export type ProcessIntent = typeof processIntents.$inferSelect;
export type InsertProcessIntent = typeof processIntents.$inferInsert;
