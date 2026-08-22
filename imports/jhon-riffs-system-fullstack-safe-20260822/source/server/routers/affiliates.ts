import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  getAffiliateByUserId, 
  getAffiliateById, 
  getNetworkDownline,
  getAccountBalance,
  getAllCareerLevels,
  getCareerLevelConfig
} from "../db";
import { affiliates, accounts, InsertAffiliate } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const affiliatesRouter = router({
  /**
   * Registrar novo afiliado
   */
  register: protectedProcedure
    .input(
      z.object({
        sponsorId: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o usuário já é afiliado
      const existingAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (existingAffiliate) {
        throw new Error("User is already an affiliate");
      }

      // Criar novo afiliado
      const newAffiliate: InsertAffiliate = {
        userId: ctx.user.id,
        sponsorId: input.sponsorId || null,
        careerLevel: "inscrito",
        status: "ativo",
        accumulatedPoints: 0,
        monthlyPoints: 0,
        directDownlineCount: 0,
        totalDownlineCount: 0,
      };

      const result = await db.insert(affiliates).values(newAffiliate);
      // Obter o ID do afiliado recém-criado
      const createdAffiliate = await db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id)).limit(1);
      const affiliateId = createdAffiliate[0]?.id;

      // Criar conta virtual
      await db.insert(accounts).values({
        affiliateId: affiliateId as number,
        balance: "0.00",
        totalEarned: "0.00",
        totalWithdrawn: "0.00",
      });

      return {
        success: true,
        affiliateId: affiliateId as number,
      };
    }),

  /**
   * Obter perfil do afiliado
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return null;
    }

    const account = await getAccountBalance(affiliate.id);
    const careerLevel = await getCareerLevelConfig(affiliate.careerLevel);

    return {
      affiliate,
      account,
      careerLevel,
    };
  }),

  /**
   * Atualizar perfil do afiliado
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        // Adicionar campos que podem ser atualizados
        // Por enquanto, apenas exemplo
      })
    )
    .mutation(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      // Implementar lógica de atualização conforme necessário
      return { success: true };
    }),

  /**
   * Obter nível de carreira atual
   */
  getCareerLevel: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return null;
    }

    const careerLevel = await getCareerLevelConfig(affiliate.careerLevel);
    return careerLevel;
  }),

  /**
   * Listar todos os níveis de carreira (para referência)
   */
  getAllCareerLevels: protectedProcedure.query(async () => {
    return await getAllCareerLevels();
  }),

  /**
   * Obter informações de um afiliado específico (admin)
   */
  getById: protectedProcedure
    .input(z.object({ affiliateId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const affiliate = await getAffiliateById(input.affiliateId);
      if (!affiliate) {
        return null;
      }

      const account = await getAccountBalance(affiliate.id);
      const careerLevel = await getCareerLevelConfig(affiliate.careerLevel);

      return {
        affiliate,
        account,
        careerLevel,
      };
    }),

  /**
   * Listar todos os afiliados (admin)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["ativo", "inativo", "suspenso"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(affiliates);

      if (input.status) {
        query = query.where(eq(affiliates.status, input.status));
      }

      const result = await query.limit(input.limit).offset(input.offset);
      return result;
    }),
});
