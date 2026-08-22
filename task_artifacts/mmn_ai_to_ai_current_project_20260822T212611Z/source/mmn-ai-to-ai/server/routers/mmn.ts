import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  getAffiliateByUserId,
  getAffiliateByCode,
  getAgentByUserId,
  getDirectReferrals,
  getNetworkTree,
  getTotalCommissions,
  getPendingCommissions,
  getOrdersByAffiliate,
  getTrendingProducts,
  getActiveUpgrades,
} from "../db";
import { affiliates, agents, network, InsertAffiliate, InsertAgent } from "../../drizzle/schema";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const mmnRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }
    return affiliate;
  }),

  getAffiliateByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const affiliate = await getAffiliateByCode(input.code);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate not found",
        });
      }
      return affiliate;
    }),

  getAgent: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return agent;
  }),

  initializeAgent: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const existingAgent = await getAgentByUserId(ctx.user.id);
    if (existingAgent) {
      return existingAgent;
    }

    const newAgent: InsertAgent = {
      userId: ctx.user.id,
      name: `Agent of ${ctx.user.name || "User"}`,
      status: "learning",
      contentStrategy: JSON.stringify({
        platforms: ["whatsapp", "instagram", "facebook"],
        postingFrequency: "daily",
        tone: "professional",
      }),
    };

    await db.insert(agents).values(newAgent);
    return newAgent;
  }),

  getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
    return await getDirectReferrals(ctx.user.id);
  }),

  getNetworkTree: protectedProcedure
    .input(z.object({ maxDepth: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await getNetworkTree(ctx.user.id, input.maxDepth);
    }),

  getTotalCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate not found",
      });
    }
    return await getTotalCommissions(affiliate.id);
  }),

  getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate not found",
      });
    }
    return await getPendingCommissions(affiliate.id);
  }),

  getOrders: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate not found",
        });
      }
      return await getOrdersByAffiliate(affiliate.id, input.limit);
    }),

  getTrendingProducts: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getTrendingProducts(input.limit);
    }),

  getActiveUpgrades: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return await getActiveUpgrades(agent.id);
  }),

  registerAffiliate: protectedProcedure
    .input(
      z.object({
        sponsorCode: z.string().optional(),
        commissionPercentage: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const existingAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (existingAffiliate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already has an affiliate profile",
        });
      }

      let sponsorId: number | undefined;
      if (input.sponsorCode) {
        const sponsor = await getAffiliateByCode(input.sponsorCode);
        if (!sponsor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sponsor not found",
          });
        }
        sponsorId = sponsor.id;
      }

      const affiliateCode = nanoid(12);
      const newAffiliate: InsertAffiliate = {
        userId: ctx.user.id,
        sponsorId,
        affiliateCode,
        commissionPercentage: input.commissionPercentage || 10,
      };

      await db.insert(affiliates).values(newAffiliate);

      if (sponsorId) {
        await db.insert(network).values({
          userId: ctx.user.id,
          sponsorId,
          level: 1,
        });
      }

      await db.insert(agents).values({
        userId: ctx.user.id,
        name: `Agent of ${ctx.user.name || "User"}`,
        status: "learning",
      });

      return newAffiliate;
    }),
});
