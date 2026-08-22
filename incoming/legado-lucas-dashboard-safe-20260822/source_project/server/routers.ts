import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllFinancialData,
  upsertFinancialData,
  getFundsByUser,
  getBitcoinAddressesByUser,
  getTransactionsByUser,
  getSecurityAlertsByUser,
  getDailyLimitByUser,
} from "./db";

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

  // Financial Management
  financial: router({
    getAllData: publicProcedure.query(async () => {
      return await getAllFinancialData();
    }),
    upsertData: protectedProcedure
      .input(
        z.object({
          year: z.number().min(0).max(10),
          patrimonioLiquido: z.string(),
          lucroAnual: z.string(),
          crescimentoPL: z.string(),
          valorMercado: z.string(),
          valorIntangivel: z.string(),
          multiploVMPC: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await upsertFinancialData(input);
        return { success: true };
      }),
  }),

  // Fund Management
  funds: router({
    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return await getFundsByUser(ctx.user.id);
    }),
  }),

  // Bitcoin Wallet - Gênesis (Hot Wallet)
  genesis: router({
    getAddresses: protectedProcedure.query(async ({ ctx }) => {
      return await getBitcoinAddressesByUser(ctx.user.id, "GENESIS");
    }),
  }),

  // Bitcoin Wallet - Cerberus (Cold Storage)
  cerberus: router({
    getAddresses: protectedProcedure.query(async ({ ctx }) => {
      return await getBitcoinAddressesByUser(ctx.user.id, "CERBERUS");
    }),
  }),

  // Bitcoin Transactions
  transactions: router({
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getTransactionsByUser(ctx.user.id);
    }),
  }),

  // Security & Alerts
  security: router({
    getAlerts: protectedProcedure.query(async ({ ctx }) => {
      return await getSecurityAlertsByUser(ctx.user.id);
    }),
    getDailyLimit: protectedProcedure.query(async ({ ctx }) => {
      return await getDailyLimitByUser(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
