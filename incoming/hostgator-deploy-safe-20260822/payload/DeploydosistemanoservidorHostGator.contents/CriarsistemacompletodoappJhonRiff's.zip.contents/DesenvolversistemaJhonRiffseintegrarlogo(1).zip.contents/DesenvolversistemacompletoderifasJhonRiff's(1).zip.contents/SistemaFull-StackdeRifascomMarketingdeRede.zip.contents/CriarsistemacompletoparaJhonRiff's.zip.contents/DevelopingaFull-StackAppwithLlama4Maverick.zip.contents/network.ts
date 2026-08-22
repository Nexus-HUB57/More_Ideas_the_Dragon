import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { getAffiliateByUserId, getAffiliateById, getNetworkDownline } from "../db";
import { network, affiliates } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const networkRouter = router({
  /**
   * Obter rede de indicações (downline) do afiliado
   */
  getMyDownline: protectedProcedure
    .input(
      z.object({
        level: z.number().int().min(1).max(4).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return [];
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(network).where(eq(network.sponsorId, affiliate.id));

      if (input.level) {
        query = query.where(eq(network.level, input.level));
      }

      const result = await query;

      // Enriquecer com informações do afiliado
      const enrichedResult = [];
      for (const record of result) {
        const downlineAffiliate = await getAffiliateById(record.affiliateId);
        enrichedResult.push({
          ...record,
          affiliate: downlineAffiliate,
        });
      }

      return enrichedResult;
    }),

  /**
   * Obter cadeia de patrocinadores (upline)
   */
  getMyUpline: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return [];
    }

    const upline = [];
    let currentSponsorId = affiliate.sponsorId;

    while (currentSponsorId) {
      const sponsor = await getAffiliateById(currentSponsorId);
      if (!sponsor) break;

      upline.push(sponsor);
      currentSponsorId = sponsor.sponsorId;
    }

    return upline;
  }),

  /**
   * Obter downline de um afiliado específico (admin)
   */
  getDownlineByAffiliateId: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().int(),
        level: z.number().int().min(1).max(4).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se o usuário é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(network).where(eq(network.sponsorId, input.affiliateId));

      if (input.level) {
        query = query.where(eq(network.level, input.level));
      }

      const result = await query;

      // Enriquecer com informações do afiliado
      const enrichedResult = [];
      for (const record of result) {
        const downlineAffiliate = await getAffiliateById(record.affiliateId);
        enrichedResult.push({
          ...record,
          affiliate: downlineAffiliate,
        });
      }

      return enrichedResult;
    }),

  /**
   * Obter estatísticas da rede
   */
  getNetworkStats: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      return null;
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Contar indicados por nível
    const downline = await db.select().from(network).where(eq(network.sponsorId, affiliate.id));

    const countByLevel: { [key: number]: number } = {};
    for (const record of downline) {
      if (!countByLevel[record.level]) {
        countByLevel[record.level] = 0;
      }
      countByLevel[record.level]++;
    }

    return {
      directDownlineCount: affiliate.directDownlineCount,
      totalDownlineCount: affiliate.totalDownlineCount,
      countByLevel,
    };
  }),

  /**
   * Obter estatísticas da rede de um afiliado (admin)
   */
  getNetworkStatsByAffiliateId: protectedProcedure
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

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Contar indicados por nível
      const downline = await db.select().from(network).where(eq(network.sponsorId, affiliate.id));

      const countByLevel: { [key: number]: number } = {};
      for (const record of downline) {
        if (!countByLevel[record.level]) {
          countByLevel[record.level] = 0;
        }
        countByLevel[record.level]++;
      }

      return {
        directDownlineCount: affiliate.directDownlineCount,
        totalDownlineCount: affiliate.totalDownlineCount,
        countByLevel,
      };
    }),

  /**
   * Obter árvore completa de rede (admin)
   */
  getNetworkTree: protectedProcedure
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

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Função recursiva para construir a árvore
      const buildTree = async (affiliateId: number, level: number = 0): Promise<any> => {
        const aff = await getAffiliateById(affiliateId);
        if (!aff) return null;

        const children = await db.select().from(network).where(eq(network.sponsorId, affiliateId));

        const childrenData = [];
        for (const child of children) {
          const childTree = await buildTree(child.affiliateId, level + 1);
          if (childTree) {
            childrenData.push(childTree);
          }
        }

        return {
          affiliate: aff,
          level,
          children: childrenData,
        };
      };

      return await buildTree(input.affiliateId);
    }),
});
