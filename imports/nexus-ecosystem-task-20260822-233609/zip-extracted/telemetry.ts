import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  recordNetworkTelemetry,
  getNetworkTelemetry,
  getLatestNetworkMetrics,
  postMoltbook,
  postGnox,
  getMoltbookFeed,
  getSystemAlerts,
} from "../db";

export const telemetryRouter = router({
  recordMetric: protectedProcedure
    .input(
      z.object({
        moduleName: z.enum(["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"]),
        strength: z.number().optional(),
        status: z.enum(["nominal", "active", "degraded", "offline"]).optional(),
        impact: z.string().optional(),
        metrics: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return recordNetworkTelemetry({
        moduleName: input.moduleName,
        strength: input.strength,
        status: input.status,
        impact: input.impact,
        metrics: input.metrics,
      });
    }),

  getMetrics: protectedProcedure
    .input(
      z.object({
        moduleName: z
          .enum(["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"])
          .optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return getNetworkTelemetry(input.moduleName, input.limit);
    }),

  getLatest: protectedProcedure.query(async () => {
    return getLatestNetworkMetrics();
  }),

  // Communications - Moltbook Feed
  postMoltbook: protectedProcedure
    .input(
      z.object({
        senderId: z.number(),
        content: z.string().min(1),
        receiverId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return postMoltbook(input.senderId, input.content, input.receiverId);
    }),

  // Communications - Gnox Dialect
  postGnox: protectedProcedure
    .input(
      z.object({
        senderId: z.number(),
        content: z.string().min(1),
        gnoxDialect: z.string().min(1),
        receiverId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return postGnox(
        input.senderId,
        input.content,
        input.gnoxDialect,
        input.receiverId
      );
    }),

  getMoltbookFeed: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getMoltbookFeed(input.limit);
    }),

  getSystemAlerts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getSystemAlerts(input.limit);
    }),
});
