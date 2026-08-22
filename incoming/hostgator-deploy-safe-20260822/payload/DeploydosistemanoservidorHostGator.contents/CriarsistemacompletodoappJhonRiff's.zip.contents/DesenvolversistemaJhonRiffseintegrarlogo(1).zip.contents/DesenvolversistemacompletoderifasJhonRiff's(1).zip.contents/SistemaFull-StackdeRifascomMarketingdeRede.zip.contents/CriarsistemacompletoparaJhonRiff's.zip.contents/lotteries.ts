import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { lotteries } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAffiliateByUserId, getAffiliateLotteries } from '../db';

function generateLuckyNumber(): string {
  const num = Math.floor(Math.random() * 1000000);
  return num.toString().padStart(6, '0');
}

export const lotteriesRouter = router({
  generateLuckyNumber: protectedProcedure
    .input(z.object({ period: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const myAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (!myAffiliate) {
        throw new Error('User is not an affiliate');
      }

      const luckyNumber = generateLuckyNumber();

      await db.insert(lotteries).values({
        affiliateId: myAffiliate.id,
        luckyNumber,
        period: input.period,
        status: 'active',
      });

      return { success: true, luckyNumber };
    }),

  getMyLotteries: protectedProcedure.query(async ({ ctx }) => {
    const myAffiliate = await getAffiliateByUserId(ctx.user.id);
    if (!myAffiliate) return [];
    return await getAffiliateLotteries(myAffiliate.id);
  }),

  getAllLotteries: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view all lotteries');
    }

    const db = await getDb();
    if (!db) return [];
    return await db.select().from(lotteries);
  }),

  drawLottery: protectedProcedure
    .input(
      z.object({
        period: z.string(),
        winningNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can draw lotteries');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const lotteriesInPeriod = await db
        .select()
        .from(lotteries)
        .where(eq(lotteries.period, input.period));

      for (const lottery of lotteriesInPeriod) {
        const newStatus = lottery.luckyNumber === input.winningNumber ? 'won' : 'drawn';
        await db
          .update(lotteries)
          .set({
            status: newStatus,
            drawDate: new Date(),
          })
          .where(eq(lotteries.id, lottery.id));
      }

      return { success: true };
    }),

  getLotteryStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const allLotteries = await db.select().from(lotteries);
    const totalLotteries = allLotteries.length;
    const activeLotteries = allLotteries.filter((l) => l.status === 'active').length;
    const wonLotteries = allLotteries.filter((l) => l.status === 'won').length;

    return {
      totalLotteries,
      activeLotteries,
      drawnLotteries: allLotteries.filter((l) => l.status === 'drawn').length,
      wonLotteries,
      expiredLotteries: allLotteries.filter((l) => l.status === 'expired').length,
    };
  }),
});
