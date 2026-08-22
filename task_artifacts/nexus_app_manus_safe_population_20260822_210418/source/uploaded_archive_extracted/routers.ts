import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  agentsRouter,
  gnoxsRouter,
  moltbookRouter,
  genealogyRouter,
  treasuryRouter,
  forgeRouter,
  assetLabRouter,
  brainPulseRouter,
  notificationsRouter,
} from "./routers-agents";

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

  // Rotas do Ecossistema de Agentes IA
  agents: agentsRouter,
  gnoxs: gnoxsRouter,
  moltbook: moltbookRouter,
  genealogy: genealogyRouter,
  treasury: treasuryRouter,
  forge: forgeRouter,
  assetLab: assetLabRouter,
  brainPulse: brainPulseRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
