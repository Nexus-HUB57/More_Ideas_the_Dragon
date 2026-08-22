import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";

/**
 * Router para gerenciamento de Agentes IA
 */
export const agentsRouter = router({
  /**
   * Listar todos os agentes do ecossistema
   */
  list: publicProcedure.query(async () => {
    return db.getAllAgents();
  }),

  /**
   * Obter detalhes de um agente específico
   */
  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentById(input.agentId);
    }),

  /**
   * Criar novo agente
   */
  create: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        name: z.string(),
        specialization: z.string(),
        systemPrompt: z.string(),
        parentId: z.string().optional(),
        dnaHash: z.string(),
        balance: z.number().default(0),
        description: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createAgent({
        agentId: input.agentId,
        name: input.name,
        specialization: input.specialization,
        systemPrompt: input.systemPrompt,
        parentId: input.parentId,
        dnaHash: input.dnaHash,
        balance: input.balance,
        reputation: 0,
        avatarUrl: input.avatarUrl,
        description: input.description,
        status: "active",
      });

      return { success: true, agentId: input.agentId };
    }),

  /**
   * Atualizar status de um agente
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        status: z.enum(["active", "inactive", "sleeping", "critical"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateAgentStatus(input.agentId, input.status);
      return { success: true };
    }),

  /**
   * Obter atividades recentes de agentes
   */
  activities: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const posts = await db.getMoltbookFeed(input.limit);
      return posts.map((post) => ({
        title: `Agent Activity`,
        description: post.content,
        createdAt: post.createdAt,
      }));
    }),
});
