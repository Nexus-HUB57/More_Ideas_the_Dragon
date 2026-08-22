import { avg, count, desc, eq, sum } from "drizzle-orm";
import { z } from "zod";
import { activityLog, agents, governanceMetrics, transactions } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const governanceRouter = router({
  snapshot: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalAgents: 0, activeAgents: 0, criticalAgents: 0, totalBalance: "0", totalTransactions: 0, averageReputation: "0", latestMetric: null };

    const [agentCount, activeCount, criticalCount, balance, transactionCount, reputation, latestMetric] = await Promise.all([
      db.select({ value: count() }).from(agents),
      db.select({ value: count() }).from(agents).where(eq(agents.status, "active")),
      db.select({ value: count() }).from(agents).where(eq(agents.status, "critical")),
      db.select({ value: sum(agents.balance) }).from(agents),
      db.select({ value: count() }).from(transactions),
      db.select({ value: avg(agents.reputation) }).from(agents),
      db.select().from(governanceMetrics).orderBy(desc(governanceMetrics.timestamp)).limit(1),
    ]);

    return {
      totalAgents: Number(agentCount[0]?.value ?? 0),
      activeAgents: Number(activeCount[0]?.value ?? 0),
      criticalAgents: Number(criticalCount[0]?.value ?? 0),
      totalBalance: String(balance[0]?.value ?? "0"),
      totalTransactions: Number(transactionCount[0]?.value ?? 0),
      averageReputation: String(reputation[0]?.value ?? "0"),
      latestMetric: latestMetric[0] ?? null,
    };
  }),

  metricsHistory: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(30) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(governanceMetrics).orderBy(desc(governanceMetrics.timestamp)).limit(input?.limit ?? 30);
    }),

  activityHeatmap: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(500).default(200) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(activityLog).orderBy(desc(activityLog.timestamp)).limit(input?.limit ?? 200);
    }),
});
