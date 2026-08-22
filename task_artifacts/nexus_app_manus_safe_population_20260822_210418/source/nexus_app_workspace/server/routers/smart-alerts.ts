import { router, protectedProcedure } from "../_core/trpc";
import {
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getAlertRules,
  getAlertHistory,
  getAlertStats,
  resolveAlert,
  clearResolvedAlerts,
} from "../smart-alerts";
import { z } from "zod";

export const smartAlertsRouter = router({
  getRules: protectedProcedure.query(({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Only admins can view alert rules");
    }
    return getAlertRules();
  }),

  createRule: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        condition: z.enum(["greater_than", "less_than", "equals", "changed"]),
        metric: z.enum([
          "agent_count",
          "transaction_volume",
          "avg_health",
          "avg_reputation",
          "active_agents",
        ]),
        threshold: z.number(),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can create alert rules");
      }
      return createAlertRule(input);
    }),

  updateRule: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        condition: z.enum(["greater_than", "less_than", "equals", "changed"]).optional(),
        metric: z
          .enum([
            "agent_count",
            "transaction_volume",
            "avg_health",
            "avg_reputation",
            "active_agents",
          ])
          .optional(),
        threshold: z.number().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can update alert rules");
      }
      const { id, ...updates } = input;
      const result = updateAlertRule(id, updates);
      if (!result) throw new Error("Rule not found");
      return result;
    }),

  deleteRule: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can delete alert rules");
      }
      const success = deleteAlertRule(input.id);
      if (!success) throw new Error("Rule not found");
      return { success };
    }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can view alert history");
      }
      return getAlertHistory(input.limit);
    }),

  getStats: protectedProcedure.query(({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Only admins can view alert stats");
    }
    return getAlertStats();
  }),

  resolve: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can resolve alerts");
      }
      const success = resolveAlert(input.alertId);
      if (!success) throw new Error("Alert not found");
      return { success };
    }),

  clearResolved: protectedProcedure.mutation(({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Only admins can clear alerts");
    }
    const cleared = clearResolvedAlerts();
    return { cleared };
  }),
});
