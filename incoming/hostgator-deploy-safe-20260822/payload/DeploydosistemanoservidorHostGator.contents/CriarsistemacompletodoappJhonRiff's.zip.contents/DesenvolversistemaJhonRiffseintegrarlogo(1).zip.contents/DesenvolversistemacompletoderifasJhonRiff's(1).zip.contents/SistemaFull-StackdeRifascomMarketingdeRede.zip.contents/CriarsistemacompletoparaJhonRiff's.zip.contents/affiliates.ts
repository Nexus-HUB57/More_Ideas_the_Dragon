import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { affiliates, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAffiliateByUserId, getAllAffiliates, getAffiliateNetwork } from '../db';

export const affiliatesRouter = router({
  getMyAffiliate: protectedProcedure.query(async ({ ctx }) => {
    return await getAffiliateByUserId(ctx.user.id);
  }),

  getAffiliateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, input.id))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  getAllAffiliates: protectedProcedure.query(async () => {
    return await getAllAffiliates();
  }),

  getMyNetwork: protectedProcedure.query(async ({ ctx }) => {
    const myAffiliate = await getAffiliateByUserId(ctx.user.id);
    if (!myAffiliate) return [];
    return await getAffiliateNetwork(myAffiliate.id);
  }),

  createAffiliate: protectedProcedure
    .input(
      z.object({
        sponsorId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await getAffiliateByUserId(ctx.user.id);
      if (existing) {
        throw new Error('User already has an affiliate account');
      }

      await db.insert(affiliates).values({
        userId: ctx.user.id,
        sponsorId: input.sponsorId,
        careerLevel: 0,
        accumulatedPoints: 0,
        status: 'active',
      });

      const newAffiliate = await getAffiliateByUserId(ctx.user.id);
      return { success: true, affiliateId: newAffiliate?.id || 0 };
    }),

  updateAffiliateStatus: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        status: z.enum(['active', 'inactive', 'suspended']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can update affiliate status');
      }

      await db
        .update(affiliates)
        .set({ status: input.status })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true };
    }),

  getAffiliateStats: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);

      if (affiliate.length === 0) return null;

      const aff = affiliate[0];
      const directNetwork = await getAffiliateNetwork(aff.id);

      return {
        id: aff.id,
        careerLevel: aff.careerLevel,
        accumulatedPoints: aff.accumulatedPoints,
        totalCommissions: aff.totalCommissions,
        availableBalance: aff.availableBalance,
        directTeamSize: directNetwork.length,
        status: aff.status,
      };
    }),
});
