import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProfile,
  getAllProducts,
  getProductById,
  getUserSales,
  getUserCommissions,
  getUserTotalCommissions,
  getUserDirectDownline,
  getUserDownlineNetwork,
  getUserUpline,
  createSale,
  confirmSale,
  getSaleById,
  getUserTransactions,
  createTransaction,
  getUserLuckyNumbers,
  getUserPurchasedProducts,
  hasUserPurchasedProduct,
  recordUserPurchase,
  getUserById,
} from "./db";
import { TRPCError } from "@trpc/server";

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

  /**
   * User profile and career level management
   */
  profile: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      const user = await getUserById(ctx.user.id);
      return {
        ...profile,
        name: user?.name,
        email: user?.email,
      };
    }),

    getCareerLevels: publicProcedure.query(() => {
      return [
        {
          level: "inscrito",
          title: "Inscrito/Participante",
          points: "0 - 249",
          investment: "R$0,99 a R$249",
          teamRequirement: "Nenhum",
          earnings: "N/A",
        },
        {
          level: "agenteAutonomo",
          title: "Agente Autônomo",
          points: "250",
          investment: "R$250",
          teamRequirement: "Nenhum",
          earnings: "N/A",
        },
        {
          level: "consultor",
          title: "Consultor",
          points: "1.500",
          investment: "R$500",
          teamRequirement: "5 Agentes",
          earnings: "R$1.250 a R$3.500",
        },
        {
          level: "mentor",
          title: "Mentor",
          points: "10.000",
          investment: "R$1.000",
          teamRequirement: "5 Consultores",
          earnings: "R$2.500 a R$7.000",
        },
        {
          level: "executivo",
          title: "Executivo",
          points: "40.000",
          investment: "R$2.000",
          teamRequirement: "5 Mentores",
          earnings: "R$5.000 a R$14.000",
        },
        {
          level: "socioInvestidor",
          title: "Sócio Investidor",
          points: "500.000",
          investment: "R$5.000",
          teamRequirement: "5 Executivos",
          earnings: "R$10.000 a R$28.000",
        },
        {
          level: "socioGestor",
          title: "Sócio Gestor",
          points: "750.000",
          investment: "R$7.500",
          teamRequirement: "5 Sócios Investidores",
          earnings: "R$15.000 a R$50.000",
        },
        {
          level: "socioJRGroup",
          title: "Sócio JR Group",
          points: "1.000.000",
          investment: "R$10.000",
          teamRequirement: "5 Sócios Gestores",
          earnings: "R$20.000 a R$100.000",
        },
      ];
    }),
  }),

  /**
   * Products management
   */
  products: router({
    list: publicProcedure.query(async () => {
      return await getAllProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }
        return product;
      }),

    getPurchased: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPurchasedProducts(ctx.user.id);
    }),

    hasPurchased: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await hasUserPurchasedProduct(ctx.user.id, input.productId);
      }),
  }),

  /**
   * Sales management
   */
  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSales(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          amount: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produto não encontrado",
          });
        }

        const sale = await createSale(ctx.user.id, input.productId, input.amount);
        if (!sale) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar venda",
          });
        }

        // Record purchase
        await recordUserPurchase(ctx.user.id, input.productId);

        // Create transaction record
        await createTransaction(
          ctx.user.id,
          "sale",
          input.amount,
          `Compra de ${product.name}`
        );

        return sale;
      }),

    confirm: protectedProcedure
      .input(z.object({ saleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const sale = await getSaleById(input.saleId);
        if (!sale) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Venda não encontrada",
          });
        }

        if (sale.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para confirmar esta venda",
          });
        }

        const success = await confirmSale(input.saleId);
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao confirmar venda",
          });
        }

        return { success: true };
      }),
  }),

  /**
   * Commissions and earnings
   */
  commissions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCommissions(ctx.user.id);
    }),

    getTotal: protectedProcedure.query(async ({ ctx }) => {
      const total = await getUserTotalCommissions(ctx.user.id);
      return { total };
    }),

    getSummary: protectedProcedure.query(async ({ ctx }) => {
      const commissions = await getUserCommissions(ctx.user.id);
      const total = await getUserTotalCommissions(ctx.user.id);

      const summary = {
        total,
        pending: "0.00",
        paid: "0.00",
        direct: "0.00",
        unilevel: "0.00",
      };

      commissions.forEach((c) => {
        const amount = parseFloat(c.amount.toString());
        if (c.status === "pending") {
          summary.pending = (parseFloat(summary.pending) + amount).toFixed(2);
        } else if (c.status === "paid") {
          summary.paid = (parseFloat(summary.paid) + amount).toFixed(2);
        }

        if (c.type === "direct") {
          summary.direct = (parseFloat(summary.direct) + amount).toFixed(2);
        } else if (c.type === "unilevel") {
          summary.unilevel = (parseFloat(summary.unilevel) + amount).toFixed(2);
        }
      });

      return summary;
    }),
  }),

  /**
   * Network and downline management
   */
  network: router({
    getDirectDownline: protectedProcedure.query(async ({ ctx }) => {
      const downlineIds = await getUserDirectDownline(ctx.user.id);
      const downline = [];

      for (const id of downlineIds) {
        const user = await getUserById(id);
        const profile = await getUserProfile(id);
        if (user && profile) {
          downline.push({
            id: user.id,
            name: user.name,
            email: user.email,
            careerLevel: profile.careerLevel,
            points: profile.points,
          });
        }
      }

      return downline;
    }),

    getFullNetwork: protectedProcedure.query(async ({ ctx }) => {
      const downlineIds = await getUserDownlineNetwork(ctx.user.id);
      const network = [];

      for (const id of downlineIds) {
        const user = await getUserById(id);
        const profile = await getUserProfile(id);
        if (user && profile) {
          network.push({
            id: user.id,
            name: user.name,
            email: user.email,
            careerLevel: profile.careerLevel,
            points: profile.points,
          });
        }
      }

      return network;
    }),

    getUpline: protectedProcedure.query(async ({ ctx }) => {
      const uplineId = await getUserUpline(ctx.user.id);
      if (!uplineId) return null;

      const user = await getUserById(uplineId);
      const profile = await getUserProfile(uplineId);

      if (user && profile) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          careerLevel: profile.careerLevel,
          points: profile.points,
        };
      }

      return null;
    }),

    getNetworkStats: protectedProcedure.query(async ({ ctx }) => {
      const directDownline = await getUserDirectDownline(ctx.user.id);
      const fullNetwork = await getUserDownlineNetwork(ctx.user.id);

      return {
        directDownlineCount: directDownline.length,
        totalNetworkCount: fullNetwork.length,
      };
    }),
  }),

  /**
   * Transactions and history
   */
  transactions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTransactions(ctx.user.id);
    }),

    getByType: protectedProcedure
      .input(
        z.object({
          type: z.enum(["sale", "commission", "bonus", "withdrawal", "refund"]),
        })
      )
      .query(async ({ ctx, input }) => {
        const transactions = await getUserTransactions(ctx.user.id);
        return transactions.filter((t) => t.type === input.type);
      }),
  }),

  /**
   * Lucky numbers and lottery
   */
  lottery: router({
    getLuckyNumbers: protectedProcedure.query(async ({ ctx }) => {
      return await getUserLuckyNumbers(ctx.user.id);
    }),

    generateLuckyNumber: protectedProcedure.query(async ({ ctx }) => {
      // Generate a random number between 1 and 100
      const number = Math.floor(Math.random() * 100) + 1;
      return { number };
    }),
  }),

  /**
   * Dashboard summary
   */
  dashboard: router({
    getSummary: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      const sales = await getUserSales(ctx.user.id);
      const commissions = await getUserCommissions(ctx.user.id);
      const directDownline = await getUserDirectDownline(ctx.user.id);
      const totalCommissions = await getUserTotalCommissions(ctx.user.id);

      const totalSales = sales.reduce(
        (sum, s) => sum + parseFloat(s.amount.toString()),
        0
      );

      return {
        careerLevel: profile?.careerLevel || "inscrito",
        points: profile?.points || 0,
        totalInvested: profile?.totalInvested || "0.00",
        totalSales: totalSales.toFixed(2),
        totalCommissions,
        pendingCommissions: commissions
          .filter((c) => c.status === "pending")
          .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0)
          .toFixed(2),
        directDownlineCount: directDownline.length,
        recentSales: sales.slice(0, 5),
        recentCommissions: commissions.slice(0, 5),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
