import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  createSale,
  getSaleById,
  getUserSales,
  createCommission,
  getUserCommissions,
  getCareerLevels,
  getCareerLevelByLevel,
  createAffiliateLink,
  getAffiliateDownline,
  createLottery,
  getLotteries,
  getLotteryById,
  createLotteryTicket,
  getUserLotteryTickets,
  createPayment,
  getUserPayments,
  getTeamPerformance,
  createTeamPerformance,
  getUserByOpenId,
  upsertUser,
} from "./db";

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

  // ===== PRODUCTS ROUTER =====
  products: router({
    list: publicProcedure.query(async () => {
      return getProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),
  }),

  // ===== SALES ROUTER =====
  sales: router({
    create: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          customerId: z.number(),
          amount: z.string(),
          paymentMethod: z.string().optional(),
          paymentReference: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const sale = await createSale({
          affiliateId: ctx.user.id,
          productId: input.productId,
          customerId: input.customerId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
          status: "pending",
        });
        return sale;
      }),

    getUserSales: protectedProcedure.query(async ({ ctx }) => {
      return getUserSales(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSaleById(input.id);
      }),
  }),

  // ===== COMMISSIONS ROUTER =====
  commissions: router({
    getUserCommissions: protectedProcedure.query(async ({ ctx }) => {
      return getUserCommissions(ctx.user.id);
    }),

    calculateCommissions: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const sale = await getSaleById(input.saleId);
        if (!sale) throw new Error("Sale not found");

        // Get the affiliate who made the sale
        const affiliate = await getUserByOpenId(ctx.user.openId);
        if (!affiliate) throw new Error("Affiliate not found");

        // Get downline for commission calculation
        const downline = await getAffiliateDownline(affiliate.id);

        // Create commissions for each level
        const commissions = [];
        const baseAmount = parseFloat(sale.amount);

        // Direct commission (10%)
        const directCommission = await createCommission({
          recipientId: affiliate.id,
          saleId: sale.id,
          affiliateId: affiliate.id,
          commissionType: "direct",
          commissionRate: "10.00",
          baseAmount: sale.amount,
          commissionAmount: (baseAmount * 0.1).toString(),
          status: "pending",
        });
        commissions.push(directCommission);

        // Level 2, 3, 4 commissions
        for (const member of downline) {
          const level = member.level;
          if (level === 1) {
            // Level 2 commission (5%)
            const commission = await createCommission({
              recipientId: member.affiliateId,
              saleId: sale.id,
              affiliateId: affiliate.id,
              commissionType: "level2",
              commissionRate: "5.00",
              baseAmount: sale.amount,
              commissionAmount: (baseAmount * 0.05).toString(),
              status: "pending",
            });
            commissions.push(commission);
          } else if (level === 2) {
            // Level 3 commission (2.5%)
            const commission = await createCommission({
              recipientId: member.affiliateId,
              saleId: sale.id,
              affiliateId: affiliate.id,
              commissionType: "level3",
              commissionRate: "2.50",
              baseAmount: sale.amount,
              commissionAmount: (baseAmount * 0.025).toString(),
              status: "pending",
            });
            commissions.push(commission);
          } else if (level === 3) {
            // Level 4 commission (2.5%)
            const commission = await createCommission({
              recipientId: member.affiliateId,
              saleId: sale.id,
              affiliateId: affiliate.id,
              commissionType: "level4",
              commissionRate: "2.50",
              baseAmount: sale.amount,
              commissionAmount: (baseAmount * 0.025).toString(),
              status: "pending",
            });
            commissions.push(commission);
          }
        }

        return { success: true, commissionsCreated: commissions.length };
      }),
  }),

  // ===== CAREER LEVELS ROUTER =====
  careerLevels: router({
    list: publicProcedure.query(async () => {
      return getCareerLevels();
    }),

    getByLevel: publicProcedure
      .input(z.object({ level: z.number() }))
      .query(async ({ input }) => {
        return getCareerLevelByLevel(input.level);
      }),
  }),

  // ===== AFFILIATE NETWORK ROUTER =====
  affiliates: router({
    getDownline: protectedProcedure.query(async ({ ctx }) => {
      return getAffiliateDownline(ctx.user.id);
    }),

    createLink: protectedProcedure
      .input(z.object({ referrerId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return createAffiliateLink({
          affiliateId: ctx.user.id,
          referrerId: input.referrerId,
          level: 1,
        });
      }),
  }),

  // ===== LOTTERIES ROUTER =====
  lotteries: router({
    list: publicProcedure.query(async () => {
      return getLotteries();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLotteryById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          drawDate: z.date(),
          totalTickets: z.number(),
          ticketPrice: z.string(),
          prizePool: z.string(),
          salesGoalRequired: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createLottery({
          name: input.name,
          description: input.description,
          drawDate: input.drawDate,
          totalTickets: input.totalTickets,
          ticketPrice: input.ticketPrice,
          prizePool: input.prizePool,
          salesGoalRequired: input.salesGoalRequired,
          createdBy: ctx.user.id,
          status: "active",
        });
      }),
  }),

  // ===== LOTTERY TICKETS ROUTER =====
  lotteryTickets: router({
    getUserTickets: protectedProcedure.query(async ({ ctx }) => {
      return getUserLotteryTickets(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          lotteryId: z.number(),
          ticketNumber: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createLotteryTicket({
          lotteryId: input.lotteryId,
          ticketNumber: input.ticketNumber,
          ownerId: ctx.user.id,
        });
      }),
  }),

  // ===== PAYMENTS ROUTER =====
  payments: router({
    getUserPayments: protectedProcedure.query(async ({ ctx }) => {
      return getUserPayments(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["commission", "bonus", "withdrawal", "deposit"]),
          amount: z.string(),
          description: z.string().optional(),
          relatedSaleId: z.number().optional(),
          relatedCommissionId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createPayment({
          userId: ctx.user.id,
          type: input.type,
          amount: input.amount,
          description: input.description,
          relatedSaleId: input.relatedSaleId,
          relatedCommissionId: input.relatedCommissionId,
          status: "pending",
        });
      }),
  }),

  // ===== TEAM PERFORMANCE ROUTER =====
  teamPerformance: router({
    getByMonth: protectedProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input, ctx }) => {
        return getTeamPerformance(ctx.user.id, input.month);
      }),

    create: protectedProcedure
      .input(
        z.object({
          month: z.string(),
          directTeamSize: z.number(),
          totalTeamSize: z.number(),
          teamSalesTotal: z.string(),
          teamCommissionsEarned: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createTeamPerformance({
          affiliateId: ctx.user.id,
          month: input.month,
          directTeamSize: input.directTeamSize,
          totalTeamSize: input.totalTeamSize,
          teamSalesTotal: input.teamSalesTotal,
          teamCommissionsEarned: input.teamCommissionsEarned,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
