import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { getAffiliateByUserId, getAffiliateById } from "../db";
import { commissions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const commissionsRouter = router({
  /**
   * Obter comissões do afiliado
   */
  getMyCommissions: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["pendente", "pago"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return [];
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(commissions).where(eq(commissions.affiliateId, affiliate.id));

      if (input.status) {
        query = query.where(eq(commissions.status, input.status));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),

  /**
   * Obter comissões pendentes do afiliado
   */
  getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return [];
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(commissions)
      .where(and(eq(commissions.affiliateId, affiliate.id), eq(commissions.status, "pendente")));

    return result;
  }),

  /**
   * Obter comissões de um afiliado específico (admin)
   */
  getByAffiliateId: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().int(),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["pendente", "pago"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(commissions).where(eq(commissions.affiliateId, input.affiliateId));

      if (input.status) {
        query = query.where(eq(commissions.status, input.status));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),

  /**
   * Obter estatísticas de comissões do afiliado
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return null;
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obter todas as comissões
    const allCommissions = await db
      .select()
      .from(commissions)
      .where(eq(commissions.affiliateId, affiliate.id));

    // Calcular totais
    let totalPending = 0;
    let totalPaid = 0;
    let totalByLevel: { [key: number]: number } = {};

    for (const commission of allCommissions) {
      const amount = typeof commission.amount === "string" ? parseFloat(commission.amount) : commission.amount;

      if (commission.status === "pendente") {
        totalPending += amount;
      } else if (commission.status === "pago") {
        totalPaid += amount;
      }

      if (!totalByLevel[commission.level]) {
        totalByLevel[commission.level] = 0;
      }
      totalByLevel[commission.level] += amount;
    }

    return {
      totalPending,
      totalPaid,
      totalByLevel,
      totalCommissions: allCommissions.length,
    };
  }),

  /**
   * Marcar comissão como paga (admin)
   */
  markAsPaid: protectedProcedure
    .input(z.object({ commissionId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(commissions)
        .set({ status: "pago", paidAt: new Date() })
        .where(eq(commissions.id, input.commissionId));

      return {
        success: true,
        message: "Commission marked as paid",
      };
    }),

  /**
   * Obter todas as comissões (admin)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["pendente", "pago"]).optional(),
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

      let query: any = db.select().from(commissions);

      if (input.status) {
        query = query.where(eq(commissions.status, input.status));
      }

      if (input.affiliateId) {
        query = query.where(eq(commissions.affiliateId, input.affiliateId));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),
});
