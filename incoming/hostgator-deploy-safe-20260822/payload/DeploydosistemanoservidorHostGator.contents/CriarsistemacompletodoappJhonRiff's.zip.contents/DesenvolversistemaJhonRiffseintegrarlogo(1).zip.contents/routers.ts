import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getActiveProducts,
  getProductById,
  getUserSales,
  getUserCommissions,
  getActiveLotteries,
  getLotteryById,
  getUserLotteryTickets,
  getUserPayments,
  getCareerLevels,
  createSale,
  confirmSale,
  calculateAndCreateCommissions,
  getUserById,
  getAffiliateDownline,
  getAffiliateUpline,
  logAuditEvent,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: publicProcedure.query(async () => {
      return getActiveProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),
  }),

  // ============ SALES ============
  sales: router({
    getUserSales: protectedProcedure.query(async ({ ctx }) => {
      return getUserSales(ctx.user.id);
    }),

    createSale: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          customerId: z.number().optional(),
          amount: z.string(),
          paymentMethod: z.string().optional(),
          paymentReference: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sale = await createSale({
          affiliateId: ctx.user.id,
          productId: input.productId,
          customerId: input.customerId || ctx.user.id,
          amount: input.amount,
          status: "pending",
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
          commissionsCalculated: false,
        });

        await logAuditEvent(
          ctx.user.id,
          "CREATE_SALE",
          "sales",
          undefined,
          `Sale created: ${input.amount}`
        );

        return sale;
      }),

    confirmSale: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const sale = await confirmSale(input.saleId);

        // Calculate commissions
        if (!sale.commissionsCalculated) {
          await calculateAndCreateCommissions(input.saleId);
        }

        await logAuditEvent(
          ctx.user.id,
          "CONFIRM_SALE",
          "sales",
          input.saleId,
          `Sale confirmed and commissions calculated`
        );

        return sale;
      }),
  }),

  // ============ COMMISSIONS ============
  commissions: router({
    getUserCommissions: protectedProcedure.query(async ({ ctx }) => {
      return getUserCommissions(ctx.user.id);
    }),
  }),

  // ============ NETWORK ============
  network: router({
    getDownline: protectedProcedure
      .input(z.object({ level: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return getAffiliateDownline(ctx.user.id, input.level);
      }),

    getUpline: protectedProcedure.query(async ({ ctx }) => {
      return getAffiliateUpline(ctx.user.id);
    }),
  }),

  // ============ LOTTERIES ============
  lotteries: router({
    list: publicProcedure.query(async () => {
      return getActiveLotteries();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLotteryById(input.id);
      }),

    getUserTickets: protectedProcedure.query(async ({ ctx }) => {
      return getUserLotteryTickets(ctx.user.id);
    }),
  }),

  // ============ PAYMENTS ============
  payments: router({
    getUserPayments: protectedProcedure.query(async ({ ctx }) => {
      return getUserPayments(ctx.user.id);
    }),
  }),

  // ============ CAREER LEVELS ============
  careerLevels: router({
    list: publicProcedure.query(async () => {
      return getCareerLevels();
    }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const sales = await getUserSales(ctx.user.id);
      const commissions = await getUserCommissions(ctx.user.id);
      const downline = await getAffiliateDownline(ctx.user.id);
      const upline = await getAffiliateUpline(ctx.user.id);

      const totalSales = sales.reduce(
        (sum, sale) =>
          sum +
          (typeof sale.amount === "string"
            ? parseFloat(sale.amount)
            : sale.amount),
        0
      );

      const totalCommissions = commissions.reduce(
        (sum, commission) =>
          sum +
          (typeof commission.commissionAmount === "string"
            ? parseFloat(commission.commissionAmount)
            : commission.commissionAmount),
        0
      );

      return {
        user,
        totalSales,
        totalCommissions,
        downlineCount: downline.length,
        upline,
        careerLevel: user?.careerLevel || 0,
        careerPoints: user?.careerPoints || 0,
        totalBalance: user?.totalBalance || "0.00",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
