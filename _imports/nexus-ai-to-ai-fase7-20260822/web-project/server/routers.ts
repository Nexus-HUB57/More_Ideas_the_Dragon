import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getGnoxTerminal } from "./gnox-terminal";

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
      .input(z.object({
        command: z.string().min(1),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const gnox = getGnoxTerminal();
        return gnox.processCommand(input.command, input.userId);
      }),

    getCommandHistory: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(1000).default(100),
      }))
      .query(async ({ input }) => {
        const gnox = getGnoxTerminal();
        return gnox.getCommandHistory(input.limit);
      }),

    getAvailableCommands: publicProcedure
      .query(() => {
        const gnox = getGnoxTerminal();
        return gnox.getAvailableCommands();
      }),

    clearHistory: publicProcedure
      .mutation(async () => {
        const gnox = getGnoxTerminal();
        await gnox.clearCommandHistory();
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
