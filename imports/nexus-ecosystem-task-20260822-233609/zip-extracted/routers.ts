import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { agentsRouter } from "./routers/agents";
import { startupsRouter } from "./routers/startups";
import { missionsRouter } from "./routers/missions";
import { telemetryRouter } from "./routers/telemetry";
import { fundingRouter } from "./routers/funding";

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

  agents: agentsRouter,
  startups: startupsRouter,
  missions: missionsRouter,
  telemetry: telemetryRouter,
  funding: fundingRouter,
});

export type AppRouter = typeof appRouter;
