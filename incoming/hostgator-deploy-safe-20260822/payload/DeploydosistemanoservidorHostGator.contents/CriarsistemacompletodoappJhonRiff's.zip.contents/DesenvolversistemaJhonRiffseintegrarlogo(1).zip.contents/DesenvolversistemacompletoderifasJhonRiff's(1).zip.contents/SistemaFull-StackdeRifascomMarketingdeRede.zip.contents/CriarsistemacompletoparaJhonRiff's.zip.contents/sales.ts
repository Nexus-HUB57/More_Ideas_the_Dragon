import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { sales, commissions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { calculateUnilevelCommissions, addCareerPoints } from '../commissions';
import { getAffiliateByUserId, getAffiliatesSales, getAffiliatesCommissions } from '../db';

export const salesRouter = router({
  createSale: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        amount: z.number(),
        commission: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const myAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (!myAffiliate) {
        throw new Error('User is not an affiliate');
      }

      const result = await db.insert(sales).values({
        affiliateId: myAffiliate.id,
        productId: input.productId,
        amount: input.amount,
        commission: input.commission,
        status: 'pending',
      });

      return { success: true, saleId: result[0].insertId };
    }),

  confirmSale: protectedProcedure
    .input(z.object({ saleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can confirm sales');
      }

      const saleResult = await db
        .select()
        .from(sales)
        .where(eq(sales.id, input.saleId))
        .limit(1);

      if (saleResult.length === 0) {
        throw new Error('Sale not found');
      }

      const sale = saleResult[0];

      await db
        .update(sales)
        .set({ status: 'confirmed', confirmedAt: new Date() })
        .where(eq(sales.id, input.saleId));

      await calculateUnilevelCommissions(sale.id, sale.affiliateId, sale.amount);
      await addCareerPoints(sale.affiliateId, sale.amount);

      return { success: true };
    }),

  getMySales: protectedProcedure.query(async ({ ctx }) => {
    const myAffiliate = await getAffiliateByUserId(ctx.user.id);
    if (!myAffiliate) return [];
    return await getAffiliatesSales(myAffiliate.id);
  }),

  getMyCommissions: protectedProcedure.query(async ({ ctx }) => {
    const myAffiliate = await getAffiliateByUserId(ctx.user.id);
    if (!myAffiliate) return [];
    return await getAffiliatesCommissions(myAffiliate.id);
  }),

  getAllSales: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view all sales');
    }

    const db = await getDb();
    if (!db) return [];
    return await db.select().from(sales);
  }),

  getSalesStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const allSales = await db.select().from(sales);
    const totalSales = allSales.length;
    const confirmedSales = allSales.filter((s) => s.status === 'confirmed').length;
    const totalAmount = allSales.reduce((sum, s) => sum + s.amount, 0);
    const totalCommissions = allSales.reduce((sum, s) => sum + s.commission, 0);

    return {
      totalSales,
      confirmedSales,
      pendingSales: totalSales - confirmedSales,
      totalAmount,
      totalCommissions,
      averageSaleValue: totalSales > 0 ? Math.floor(totalAmount / totalSales) : 0,
    };
  }),
});
