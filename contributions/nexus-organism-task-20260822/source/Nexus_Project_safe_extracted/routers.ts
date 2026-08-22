import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as dbHelpers from "./db-helpers";
import { nexusDataGate } from "./data-adapter";
import { nexusOrchestrator } from "./nexus-orchestrator";
import { vitalLoopManager } from "./vital-loop-manager";
import { gnoxKernel } from "./gnox-kernel";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ecosystem: router({
    getMetrics: publicProcedure.query(async () => {
      return await dbHelpers.getLatestMetrics();
    }),

    getMetricsHistory: publicProcedure
      .input(z.object({ hours: z.number() }).default({ hours: 24 }))
      .query(async ({ input }) => {
        return await dbHelpers.getMetricsHistory(input.hours);
      }),

    getAgents: publicProcedure.query(async () => {
      return await dbHelpers.getActiveAgents();
    }),

    getAgentById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await dbHelpers.getAgentById(input.id);
      }),

    getMissions: publicProcedure.query(async () => {
      return await dbHelpers.getPendingMissions();
    }),

    getEvents: publicProcedure
      .input(z.object({ limit: z.number() }).default({ limit: 50 }))
      .query(async ({ input }) => {
        return await dbHelpers.getRecentEvents(input.limit);
      }),

    getAlerts: publicProcedure.query(async () => {
      return await dbHelpers.getUnreadAlerts();
    }),

    markAlertAsRead: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        return await dbHelpers.markAlertAsRead(input.alertId);
      }),
  }),

  orchestrator: router({
    generateMissions: protectedProcedure
      .input(z.object({
        marketSentiment: z.enum(["bullish", "neutral", "bearish"]),
        harmonyLevel: z.number(),
        activeAgents: z.number(),
        recentPriceChanges: z.record(z.string(), z.number()),
        systemHealth: z.number(),
      }))
      .mutation(async ({ input }) => {
        await nexusOrchestrator.generateMissions(input);
        return { success: true };
      }),

    analyzeMissionPerformance: publicProcedure.query(async () => {
      return await nexusOrchestrator.analyzeMissionPerformance();
    }),
  }),

  vitalLoop: router({
    monitorVitals: protectedProcedure.mutation(async () => {
      await vitalLoopManager.monitorVitalSigns();
      return { success: true };
    }),

    restoreVitals: protectedProcedure
      .input(z.object({ 
        agentId: z.number(), 
        health: z.number().optional(), 
        energy: z.number().optional() 
      }))
      .mutation(async ({ input }) => {
        await vitalLoopManager.restoreVitals(input.agentId, input.health, input.energy);
        return { success: true };
      }),
  }),

  gnox: router({
    processCommand: protectedProcedure
      .input(z.object({ command: z.string() }))
      .mutation(async ({ input }) => {
        const result = await gnoxKernel.processCommand(input.command);
        return { response: result };
      }),

    analyzeEcosystem: publicProcedure.query(async () => {
      return await gnoxKernel.analyzeEcosystem();
    }),
  }),

  market: router({
    syncData: protectedProcedure
      .input(z.object({ source: z.enum(["coingecko", "binance"]) }).default({ source: "coingecko" }))
      .mutation(async ({ input }) => {
        await nexusDataGate.syncMarketData(input.source);
        return { success: true };
      }),

    getLatestMarketData: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        return await dbHelpers.getLatestMarketData(input.symbol);
      }),

    analyzeMarketSentiment: publicProcedure
      .input(z.object({ symbols: z.array(z.string()) }).default({ symbols: ["BTC", "ETH"] }))
      .query(async ({ input }) => {
        return await nexusDataGate.analyzeMarketSentiment(input.symbols);
      }),
  }),
});

export type AppRouter = typeof appRouter;
