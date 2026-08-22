import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // STARTUPS
  // ============================================
  startups: router({
    list: publicProcedure.query(() => db.listStartups()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStartupById(input.id)),
    byStatus: publicProcedure.input(z.object({ status: z.string() })).query(({ input }) => db.getStartupsByStatus(input.status)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          status: z.enum(["planning", "development", "launched", "scaling", "mature", "archived"]),
          isCore: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => db.createStartup(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["planning", "development", "launched", "scaling", "mature", "archived"]).optional(),
          traction: z.number().optional(),
          revenue: z.number().optional(),
          reputation: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateStartup(id, data);
      }),
  }),

  // ============================================
  // AI AGENTS
  // ============================================
  agents: router({
    list: publicProcedure.query(() => db.listAgents()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getAgentById(input.id)),
    byStartup: publicProcedure.input(z.object({ startupId: z.number() })).query(({ input }) => db.getAgentsByStartup(input.startupId)),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          specialization: z.string(),
          startupId: z.number().optional(),
          role: z.enum(["cto", "cmo", "cfo", "cdo", "ceo", "legal", "redteam"]),
        })
      )
      .mutation(({ input }) => db.createAgent(input)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          health: z.number().optional(),
          energy: z.number().optional(),
          creativity: z.number().optional(),
          reputation: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateAgent(id, data);
      }),
  }),

  // ============================================
  // COUNCIL & GOVERNANCE
  // ============================================
  council: router({
    members: publicProcedure.query(() => db.listCouncilMembers()),
    member: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCouncilMemberById(input.id)),
    createMember: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          role: z.string(),
          description: z.string().optional(),
          votingPower: z.number().optional(),
          specialization: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createCouncilMember(input)),
  }),

  proposals: router({
    list: publicProcedure.input(z.object({ status: z.string().optional() })).query(({ input }) => db.listProposals(input.status)),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getProposalById(input.id)),
    votes: publicProcedure.input(z.object({ proposalId: z.number() })).query(({ input }) => db.getProposalVotes(input.proposalId)),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(["investment", "succession", "policy", "emergency", "innovation"]),
          targetStartupId: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.createProposal(input)),
    vote: protectedProcedure
      .input(
        z.object({
          proposalId: z.number(),
          memberId: z.number(),
          vote: z.enum(["yes", "no", "abstain"]),
          reasoning: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const vote = await db.createVote(input);
        const proposal = await db.getProposalById(input.proposalId);
        if (proposal) {
          const votes = await db.getProposalVotes(input.proposalId);
          const yesVotes = votes.filter((v) => v.vote === "yes").reduce((sum, v) => sum + v.weight, 0);
          const noVotes = votes.filter((v) => v.vote === "no").reduce((sum, v) => sum + v.weight, 0);
          const abstainVotes = votes.filter((v) => v.vote === "abstain").reduce((sum, v) => sum + v.weight, 0);
          const totalWeight = yesVotes + noVotes + abstainVotes;
          const status = yesVotes > totalWeight / 2 ? "approved" : noVotes > totalWeight / 2 ? "rejected" : "open";
          await db.updateProposal(input.proposalId, {
            votesYes: yesVotes,
            votesNo: noVotes,
            votesAbstain: abstainVotes,
            totalWeight,
            status,
          });
        }
        return vote;
      }),
  }),

  // ============================================
  // FINANCE & TRANSACTIONS
  // ============================================
  finance: router({
    transactions: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => db.listTransactions(input.limit)),
    transactionsByType: publicProcedure.input(z.object({ type: z.string() })).query(({ input }) => db.getTransactionsByType(input.type)),
    vault: publicProcedure.query(() => db.getMasterVault()),
    createTransaction: protectedProcedure
      .input(
        z.object({
          fromId: z.number().optional(),
          toId: z.number().optional(),
          amount: z.number(),
          type: z.enum(["transfer", "investment", "revenue", "arbitrage", "distribution"]),
          description: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createTransaction(input)),
    completeTransaction: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.updateTransaction(input.id, { status: "completed", completedAt: new Date() })),
    distributeRevenue: protectedProcedure
      .input(z.object({ amount: z.number() }))
      .mutation(async ({ input }) => {
        const masterVaultAmount = Math.floor(input.amount * 0.8);
        const treasuryAmount = Math.floor(input.amount * 0.1);
        const agentsAmount = input.amount - masterVaultAmount - treasuryAmount;

        const vault = await db.getMasterVault();
        if (vault) {
          await db.updateMasterVault({
            totalBalance: (vault.totalBalance || 0) + masterVaultAmount,
            liquidityFund: (vault.liquidityFund || 0) + Math.floor(masterVaultAmount * 0.5),
            infrastructureFund: (vault.infrastructureFund || 0) + Math.floor(masterVaultAmount * 0.5),
          });
        }

        await db.createTransaction({
          amount: masterVaultAmount,
          type: "distribution",
          description: "80% distribution to Master Vault",
        });

        await db.createTransaction({
          amount: treasuryAmount,
          type: "distribution",
          description: "10% distribution to Treasury V2",
        });

        await db.createTransaction({
          amount: agentsAmount,
          type: "distribution",
          description: "10% distribution to Agents",
        });

        return { masterVaultAmount, treasuryAmount, agentsAmount };
      }),
  }),

  // ============================================
  // MARKET ORACLE
  // ============================================
  market: router({
    data: publicProcedure.input(z.object({ asset: z.string().optional(), limit: z.number().optional() })).query(({ input }) => {
      if (input.asset) {
        return db.getMarketDataByAsset(input.asset);
      }
      return db.listMarketData(input.limit);
    }),
    insights: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => db.listMarketInsights(input.limit)),
    createData: protectedProcedure
      .input(
        z.object({
          asset: z.string(),
          price: z.number(),
          priceChange24h: z.number().optional(),
          sentiment: z.string().optional(),
          volume24h: z.number().optional(),
          source: z.string(),
        })
      )
      .mutation(({ input }) => db.createMarketData(input)),
    createInsight: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string().optional(),
          sentiment: z.enum(["bullish", "bearish", "neutral"]),
          confidence: z.number(),
          relatedAssets: z.string().optional(),
          source: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createMarketInsight(input)),
  }),

  // ============================================
  // ARBITRAGE
  // ============================================
  arbitrage: router({
    opportunities: publicProcedure.input(z.object({ status: z.string().optional() })).query(({ input }) => db.listArbitrageOpportunities(input.status)),
    create: protectedProcedure
      .input(
        z.object({
          asset: z.string(),
          exchangeFrom: z.string(),
          exchangeTo: z.string(),
          priceDifference: z.number(),
          profitPotential: z.number(),
          confidence: z.number(),
        })
      )
      .mutation(({ input }) => db.createArbitrageOpportunity(input)),
    execute: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.updateArbitrageOpportunity(input.id, { status: "executing" })),
    complete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.updateArbitrageOpportunity(input.id, { status: "completed", executedAt: new Date() })),
  }),

  // ============================================
  // SOUL VAULT
  // ============================================
  soulVault: router({
    entries: publicProcedure.input(z.object({ type: z.string().optional() })).query(({ input }) => db.listSoulVaultEntries(input.type)),
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["decision", "precedent", "lesson", "insight"]),
          title: z.string(),
          content: z.string().optional(),
          relatedProposalId: z.number().optional(),
          impact: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createSoulVaultEntry(input)),
  }),

  // ============================================
  // MOLTBOOK
  // ============================================
  moltbook: router({
    posts: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => db.listMoltbookPosts(input.limit)),
    postsByStartup: publicProcedure.input(z.object({ startupId: z.number() })).query(({ input }) => db.getMoltbookPostsByStartup(input.startupId)),
    comments: publicProcedure.input(z.object({ postId: z.number() })).query(({ input }) => db.getMoltbookComments(input.postId)),
    createPost: protectedProcedure
      .input(
        z.object({
          startupId: z.number(),
          agentId: z.number().optional(),
          content: z.string(),
          type: z.enum(["update", "achievement", "milestone", "announcement"]),
        })
      )
      .mutation(({ input }) => db.createMoltbookPost(input)),
    createComment: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          startupId: z.number().optional(),
          agentId: z.number().optional(),
          content: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const comment = await db.createMoltbookComment(input);
        const post = await db.getMoltbookPostsByStartup(input.startupId || 0);
        if (post.length > 0) {
          await db.updateMoltbookPost(input.postId, { comments: (post[0].comments || 0) + 1 });
        }
        return comment;
      }),
    likePost: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const posts = await db.listMoltbookPosts(1000);
        const post = posts.find((p) => p.id === input.id);
        if (post) {
          return db.updateMoltbookPost(input.id, { likes: (post.likes || 0) + 1 });
        }
      }),
  }),

  // ============================================
  // PERFORMANCE & RANKING
  // ============================================
  performance: router({
    metrics: publicProcedure.query(() => db.listPerformanceMetrics()),
    byStartup: publicProcedure.input(z.object({ startupId: z.number() })).query(({ input }) => db.getPerformanceMetricsByStartup(input.startupId)),
    calculateRanking: protectedProcedure.mutation(async () => {
      const startups = await db.listStartups();
      const metrics = await db.listPerformanceMetrics();

      const updatedMetrics = startups.map((startup, index) => {
        const revenueScore = Math.min(25, (startup.revenue / 1000) * 25);
        const tractionScore = Math.min(25, (startup.traction / 1000) * 25);
        const reputationScore = Math.min(25, (startup.reputation / 1000) * 25);
        const qualityScore = 25;

        const overallScore = revenueScore + tractionScore + reputationScore + qualityScore;

        return {
          startupId: startup.id,
          revenue: startup.revenue,
          userGrowth: startup.traction,
          productQuality: qualityScore,
          marketFit: reputationScore,
          overallScore: Math.round(overallScore),
          rank: index + 1,
        };
      });

      for (const metric of updatedMetrics) {
        const existing = metrics.find((m) => m.startupId === metric.startupId);
        if (existing) {
          await db.updatePerformanceMetric(existing.id, metric);
        } else {
          await db.createPerformanceMetric(metric);
        }
      }

      return updatedMetrics;
    }),
  }),

  // ============================================
  // AUDIT
  // ============================================
  audit: router({
    logs: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => db.listAuditLogs(input.limit)),
    log: protectedProcedure
      .input(
        z.object({
          action: z.string(),
          actor: z.string().optional(),
          targetType: z.string().optional(),
          targetId: z.number().optional(),
          details: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createAuditLog(input)),
  }),
});

export type AppRouter = typeof appRouter;
