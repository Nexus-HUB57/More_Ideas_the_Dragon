/**
 * Database Interface - Nexus-HUB
 * Redireciona para db-mock para fins de teste
 */

export * from "./db-mock";

// Re-exportar tipos do schema
export { 
  users, startups, aiAgents, councilMembers, proposals, councilVotes,
  masterVault, transactions, marketData, marketInsights, arbitrageOpportunities,
  soulVault, moltbookPosts, moltbookComments, performanceMetrics, auditLogs, agentDna
} from "./schema";
