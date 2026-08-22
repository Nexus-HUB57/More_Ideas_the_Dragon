import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  getAffiliateByUserId,
  getAffiliateById,
  createPaymentRecord,
  confirmPaymentAndCommission,
} from "../db";
import { payments, InsertPayment, commissions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const paymentsRouter = router({
  /**
   * Inserir nova receita (admin)
   */
  insertReceipt: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().int(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        bank: z.string().optional(),
        accountNumber: z.string().optional(),
        paymentDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      // Verificar se o afiliado existe
      const affiliate = await getAffiliateById(input.affiliateId);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      const paymentData: InsertPayment = {
        affiliateId: input.affiliateId,
        amount: input.amount,
        bank: input.bank,
        accountNumber: input.accountNumber,
        paymentDate: input.paymentDate,
        status: "pendente",
      };

      await createPaymentRecord(paymentData);

      return {
        success: true,
        message: "Payment inserted successfully",
      };
    }),

  /**
   * Identificar receita (associar ao afiliado correto)
   */
  identifyReceipt: protectedProcedure
    .input(
      z.object({
        paymentId: z.number().int(),
        affiliateId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o pagamento existe
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (payment.length === 0) {
        throw new Error("Payment not found");
      }

      // Verificar se o afiliado existe
      const affiliate = await getAffiliateById(input.affiliateId);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      // Atualizar o pagamento com o afiliado correto
      await db
        .update(payments)
        .set({ affiliateId: input.affiliateId, status: "identificado" })
        .where(eq(payments.id, input.paymentId));

      return {
        success: true,
        message: "Payment identified successfully",
      };
    }),

  /**
   * Confirmar pagamento e calcular comissões
   */
  confirmPayment: protectedProcedure
    .input(z.object({ paymentId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await confirmPaymentAndCommission(input.paymentId);

      return {
        success: true,
        message: "Payment confirmed and commissions calculated",
      };
    }),

  /**
   * Listar pagamentos do afiliado
   */
  listMyPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["pendente", "identificado", "confirmado"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return [];
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(payments).where(eq(payments.affiliateId, affiliate.id));

      if (input.status) {
        query = query.where(eq(payments.status, input.status));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),

  /**
   * Listar todos os pagamentos (admin)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["pendente", "identificado", "confirmado"]).optional(),
        affiliateId: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(payments);

      if (input.status) {
        query = query.where(eq(payments.status, input.status));
      }

      if (input.affiliateId) {
        query = query.where(eq(payments.affiliateId, input.affiliateId));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),

  /**
   * Obter detalhes de um pagamento específico
   */
  getById: protectedProcedure
    .input(z.object({ paymentId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (payment.length === 0) {
        return null;
      }

      const paymentRecord = payment[0];

      // Se não é admin, verificar se é o afiliado do pagamento
      if (ctx.user.role !== "admin") {
        const affiliate = await getAffiliateByUserId(ctx.user.id);
        if (!affiliate || affiliate.id !== paymentRecord.affiliateId) {
          throw new Error("Unauthorized");
        }
      }

      return paymentRecord;
    }),
});
