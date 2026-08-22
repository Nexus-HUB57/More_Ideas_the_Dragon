import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const { COOKIE_NAME } = require("@shared/const");
      const { getSessionCookieOptions } = require("./_core/cookies");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // STARTUPS
  // ============================================
  startups: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getStartups(input?.limit);
      }),
    
    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getStartupById(input);
      }),
    
    byStatus: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return db.getStartupsByStatus(input);
      }),
  }),

  // ============================================
  // AI AGENTS
  // ============================================
  agents: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAgents(input?.limit);
      }),
    
    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getAgentById(input);
      }),
    
    byStartup: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getAgentsByStartup(input);
      }),
  }),

  // ============================================
  // COUNCIL & GOVERNANCE
  // ============================================
  council: router({
    members: publicProcedure.query(async () => {
      return db.getCouncilMembers();
    }),
    
    member: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getCouncilMemberById(input);
      }),
  }),

  proposals: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getProposals(input?.status);
      }),
    
    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getProposalById(input);
      }),
    
    votes: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getVotesForProposal(input);
      }),
  }),

  // ============================================
  // FINANCE & TRANSACTIONS
  // ============================================
  finance: router({
    transactions: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTransactions(input?.limit);
      }),
    
    transactionsByType: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return db.getTransactionsByType(input);
      }),
    
    vault: publicProcedure.query(async () => {
      return db.getMasterVault();
    }),
  }),

  // ============================================
  // MARKET ORACLE
  // ============================================
  market: router({
    data: publicProcedure
      .input(z.object({ asset: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getMarketData(input?.asset);
      }),
    
    insights: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getMarketInsights(input?.limit);
      }),
  }),

  // ============================================
  // ARBITRAGE
  // ============================================
  arbitrage: router({
    opportunities: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getArbitrageOpportunities(input?.status);
      }),
  }),

  // ============================================
  // SOUL VAULT
  // ============================================
  soulVault: router({
    entries: publicProcedure
      .input(z.object({ type: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getSoulVaultEntries(input?.type);
      }),
  }),

  // ============================================
  // MOLTBOOK
  // ============================================
  moltbook: router({
    posts: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getMoltbookPosts(input?.limit);
      }),
    
    postsByStartup: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getMoltbookPostsByStartup(input);
      }),
    
    comments: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getMoltbookComments(input);
      }),
  }),

  // ============================================
  // PERFORMANCE & RANKING
  // ============================================
  performance: router({
    metrics: publicProcedure.query(async () => {
      return db.getPerformanceMetrics();
    }),
    
    metricsByStartup: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getPerformanceMetricsByStartup(input);
      }),
  }),

  // ============================================
  // AUDIT LOGS
  // ============================================
  audit: router({
    logs: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAuditLogs(input?.limit);
      }),
  }),

  // ============================================
  // DASHBOARD METRICS
  // ============================================
  dashboard: router({
    overview: publicProcedure.query(async () => {
      const startups = await db.getStartups();
      const agents = await db.getAgents();
      const vault = await db.getMasterVault();
      const arbitrage = await db.getArbitrageOpportunities("identified");
      const transactions = await db.getTransactions(10);

      const totalRevenue = (startups as any[]).reduce((sum, s) => sum + (s.revenue || 0), 0);
      const totalTraction = (startups as any[]).reduce((sum, s) => sum + (s.traction || 0), 0);
      const avgReputation = (startups as any[]).length > 0 
        ? (startups as any[]).reduce((sum, s) => sum + (s.reputation || 0), 0) / (startups as any[]).length 
        : 0;

      return {
        startupsCount: (startups as any[]).length,
        agentsCount: (agents as any[]).length,
        totalRevenue,
        totalTraction,
        avgReputation: Math.round(avgReputation),
        vaultBalance: vault?.totalBalance || 0,
        arbitrageOpportunities: (arbitrage as any[]).length,
        recentTransactions: (transactions as any[]).length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
