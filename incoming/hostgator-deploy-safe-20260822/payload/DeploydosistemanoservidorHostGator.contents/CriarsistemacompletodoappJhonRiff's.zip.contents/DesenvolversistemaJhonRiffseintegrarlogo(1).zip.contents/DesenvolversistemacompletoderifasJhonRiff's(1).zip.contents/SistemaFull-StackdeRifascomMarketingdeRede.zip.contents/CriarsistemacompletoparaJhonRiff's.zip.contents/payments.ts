import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { payments, commissions, affiliates } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getAffiliateByUserId, getAffiliatesPayments } from '../db';

export const paymentsRouter = router({
  requestPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        paymentMethod: z.enum(['bank_transfer', 'pix', 'wallet']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const myAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (!myAffiliate) {
        throw new Error('User is not an affiliate');
      }

      if (myAffiliate.availableBalance < input.amount) {
        throw new Error('Insufficient balance');
      }

      await db.insert(payments).values({
        affiliateId: myAffiliate.id,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: 'pending',
      });

      return { success: true };
    }),

  processPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        status: z.enum(['processing', 'completed', 'failed']),
        transactionRef: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can process payments');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.transactionRef) {
        updateData.transactionRef = input.transactionRef;
      }

      if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }

      await db
        .update(payments)
        .set(updateData)
        .where(eq(payments.id, input.paymentId));

      if (input.status === 'completed') {
        const paymentResult = await db
          .select()
          .from(payments)
          .where(eq(payments.id, input.paymentId))
          .limit(1);

        if (paymentResult.length > 0) {
          const payment = paymentResult[0];
          const affiliate = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, payment.affiliateId))
            .limit(1);

          if (affiliate.length > 0) {
            await db
              .update(affiliates)
              .set({
                availableBalance: affiliate[0].availableBalance - payment.amount,
              })
              .where(eq(affiliates.id, payment.affiliateId));
          }
        }
      }

      return { success: true };
    }),

  getMyPayments: protectedProcedure.query(async ({ ctx }) => {
    const myAffiliate = await getAffiliateByUserId(ctx.user.id);
    if (!myAffiliate) return [];
    return await getAffiliatesPayments(myAffiliate.id);
  }),

  getAllPayments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view all payments');
    }

    const db = await getDb();
    if (!db) return [];
    return await db.select().from(payments);
  }),

  getPaymentStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const allPayments = await db.select().from(payments);
    const totalPayments = allPayments.length;
    const completedPayments = allPayments.filter((p) => p.status === 'completed').length;
    const totalPaid = allPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = allPayments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      completedPayments,
      pendingPayments: totalPayments - completedPayments,
      totalPaid,
      pendingAmount,
      averagePayment: completedPayments > 0 ? Math.floor(totalPaid / completedPayments) : 0,
    };
  }),
});
