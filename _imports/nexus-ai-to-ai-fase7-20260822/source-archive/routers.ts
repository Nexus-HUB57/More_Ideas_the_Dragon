import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

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

  gnox: router({
    executeCommand: publicProcedure
      .input(
        z.object({
          command: z.string().min(1),
          userId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { gnoxTerminal } = await import("./gnox-terminal");
        return gnoxTerminal.processCommand(input.command, input.userId);
      }),

    getCommandHistory: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(1000).default(100),
        })
      )
      .query(async ({ input }) => {
        const { gnoxTerminal } = await import("./gnox-terminal");
        return gnoxTerminal.getCommandHistory(input.limit);
      }),

    getAvailableCommands: publicProcedure.query(async () => {
      const { gnoxTerminal } = await import("./gnox-terminal");
      return gnoxTerminal.getAvailableCommands();
    }),

    clearHistory: publicProcedure.mutation(async () => {
      const { gnoxTerminal } = await import("./gnox-terminal");
      await gnoxTerminal.clearCommandHistory();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
