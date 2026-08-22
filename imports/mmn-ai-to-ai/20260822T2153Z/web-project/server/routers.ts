import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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

  // ==================== Dashboard Router ====================
  dashboard: router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      // Get user data
      const user = ctx.user;
      
      // Get agent data
      const agent = await db.getAgentByUserId(userId);
      
      // Get recent commissions
      const commissions = await db.getCommissionsByUserId(userId);
      const totalCommissions = await db.getTotalCommissions(userId);
      
      // Get recent sales
      const affiliate = await db.getAffiliateByUserId(userId);
      const recentSales = affiliate ? await db.getRecentSalesByAffiliateId(affiliate.id, 5) : [];

      return {
        totalCommissions: user.totalCommissions || "0",
        availableBalance: user.availableBalance || "0",
        agentStatus: agent?.status || "inactive",
        agentEnergy: agent?.energy || 0,
        agentHealth: agent?.health || 0,
        recentSales: recentSales.map(sale => ({
          id: sale.id,
          amount: sale.amount,
          status: sale.status,
          createdAt: sale.createdAt,
        })),
      };
    }),

    getRecentSales: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const affiliate = await db.getAffiliateByUserId(userId);
      
      if (!affiliate) {
        return [];
      }

      const sales = await db.getRecentSalesByAffiliateId(affiliate.id, 10);
      return sales.map(sale => ({
        id: sale.id,
        amount: sale.amount,
        status: sale.status,
        createdAt: sale.createdAt,
      }));
    }),
  }),

  // ==================== Affiliate Router ====================
  affiliate: router({
    getNetworkTree: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      return db.getNetworkTree(userId);
    }),

    getAffiliateDetails: protectedProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ input, ctx }) => {
        const affiliate = await db.getAffiliateByUserId(input.affiliateId);
        if (!affiliate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        }
        return affiliate;
      }),
  }),

  // ==================== Agent Router ====================
  agent: router({
    getAgent: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      let agent = await db.getAgentByUserId(userId);
      
      // Create agent if doesn't exist
      if (!agent) {
        agent = await db.createAgentForUser(userId);
      }

      return agent || {
        id: 0,
        userId,
        name: `Agent-${userId}`,
        status: "inactive",
        energy: 100,
        health: 100,
        creativity: 80,
        reputation: 50,
        strategy: "balanced",
        lastActionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

    updateAgentStrategy: protectedProcedure
      .input(z.object({ strategy: z.enum(["balanced", "aggressive", "conservative"]) }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const agent = await db.getAgentByUserId(userId);
        
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }

        const updated = await db.updateAgentStrategy(agent.id, input.strategy);
        return updated?.[0] || agent;
      }),
  }),

  // ==================== Commissions Router ====================
  commissions: router({
    getCommissions: protectedProcedure
      .input(z.object({ period: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const commissions = await db.getCommissionsByUserId(userId, input?.period);
        
        return commissions.map(c => ({
          id: c.id,
          amount: c.amount,
          type: c.type,
          status: c.status,
          period: c.period,
          createdAt: c.createdAt,
        }));
      }),

    requestWithdrawal: protectedProcedure
      .input(z.object({ amount: z.string(), bankAccount: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const user = ctx.user;

        // Validate amount
        const amount = parseFloat(input.amount);
        const balance = parseFloat(user.availableBalance as any || "0");

        if (amount <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Amount must be greater than 0" });
        }

        if (amount > balance) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient balance" });
        }

        const result = await db.createWithdrawalRequest(userId, input.amount, input.bankAccount);
        
        if (!result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create withdrawal request" });
        }

        return { success: true };
      }),
  }),

  // ==================== Marketplace Router ====================
  marketplace: router({
    getProducts: protectedProcedure
      .input(z.object({ marketplace: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const products = await db.getProductsByMarketplace(input?.marketplace);
        return products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          marketplace: p.marketplace,
          imageUrl: p.imageUrl,
          commissionRate: p.commissionRate,
        }));
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const isFavorite = await db.toggleFavorite(userId, input.productId);
        return { isFavorite };
      }),

    getUserFavorites: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const favorites = await db.getUserFavorites(userId);
      return favorites.map(f => f.productId);
    }),
  }),

  // ==================== Profile Router ====================
  profile: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const affiliate = await db.getAffiliateByUserId(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        affiliateCode: user.affiliateCode,
        totalCommissions: user.totalCommissions,
        availableBalance: user.availableBalance,
        role: user.role,
        createdAt: user.createdAt,
      };
    }),

    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().optional(), email: z.string().email().optional() }))
      .mutation(async ({ input, ctx }) => {
        // This would require updating the user in the database
        // For now, return success
        return { success: true };
      }),
  }),

  // ==================== Notifications Router ====================
  notifications: router({
    getNotifications: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const notifications = await db.getNotificationsByUserId(userId, 20);
      
      return notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        content: n.content,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await db.markNotificationAsRead(input.notificationId);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
