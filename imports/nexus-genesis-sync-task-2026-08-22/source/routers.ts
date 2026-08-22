import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

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

  // Orquestração Tri-Nuclear
  orchestration: router({
    status: publicProcedure.query(() => {
      // Retornar status do Genesis quando implementado
      return {
        status: "inicializando",
        nivel_seniencia: 0.15,
        eventos_processados: 0,
        comandos_orquestrados: 0,
      };
    }),

    getMetrics: publicProcedure.query(async () => {
      // Retornar métricas de orquestração
      return {
        eventos_por_segundo: 0,
        taxa_resposta: 0,
        homeostase: "balanceada",
      };
    }),

    getGlobalState: publicProcedure.query(async () => {
      // Retornar estado global dos núcleos
      return {
        nexus_in: { posts: 0, agentes_ativos: 0 },
        nexus_hub: { agentes: 0, projetos: 0 },
        fundo_nexus: { saldo_btc: 28000 },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
