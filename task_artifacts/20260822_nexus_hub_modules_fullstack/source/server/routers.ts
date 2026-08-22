import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { agentsRouter } from "./routers/agents";
import { moltbookRouter } from "./routers/moltbook";
import { transactionsRouter } from "./routers/transactions";
import { gnoxRouter } from "./routers/gnox";
import { forgeRouter } from "./routers/forge";
import { assetsRouter } from "./routers/assets";
import { notificationsRouter } from "./routers/notifications";
import { governanceRouter } from "./routers/governance";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  agents: agentsRouter,
  moltbook: moltbookRouter,
  transactions: transactionsRouter,
  gnox: gnoxRouter,
  forge: forgeRouter,
  assets: assetsRouter,
  notifications: notificationsRouter,
  governance: governanceRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
