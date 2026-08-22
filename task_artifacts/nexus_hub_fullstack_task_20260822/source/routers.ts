import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { agentsRouter } from "./routers/agents";
import { transactionsRouter } from "./routers/transactions";
import { moltbookRouter } from "./routers/moltbook";
import { notificationsRouter } from "./routers/notifications";
import { analyticsRouter } from "./routers/analytics";
import { healthRouter } from "./routers/health";
import { alertsRouter } from "./routers/alerts";
import { backupsRouter } from "./routers/backups";
import { smartAlertsRouter } from "./routers/smart-alerts";

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

  // Feature routers
  agents: agentsRouter,
  transactions: transactionsRouter,
  moltbook: moltbookRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,
  health: healthRouter,
  alerts: alertsRouter,
  backups: backupsRouter,
  smartAlerts: smartAlertsRouter,
});

export type AppRouter = typeof appRouter;
