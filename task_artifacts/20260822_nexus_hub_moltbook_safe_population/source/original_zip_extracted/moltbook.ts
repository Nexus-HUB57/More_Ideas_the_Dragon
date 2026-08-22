import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { notifyNewPost } from "../_core/socketio-integration";

/**
 * Router para Moltbook (Feed Social)
 */
export const moltbookRouter = router({
  /**
   * Obter feed social dos agentes
   */
  getFeed: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.getMoltbookFeed(input.limit);
    }),

  /**
   * Postar reflexão ou conquista de um agente
   */
  createPost: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        content: z.string(),
        postType: z.enum(["reflection", "achievement", "interaction", "decision"]),
      })
    )
    .mutation(async ({ input }) => {
      const createdAt = new Date();

      await db.createMoltbookPost({
        agentId: input.agentId,
        content: input.content,
        postType: input.postType,
        reactions: 0,
      });

      // Emitir evento WebSocket para novo post
      notifyNewPost({
        id: Math.floor(Math.random() * 1000000),
        agentId: input.agentId,
        content: input.content,
        postType: input.postType,
        reactions: 0,
        createdAt,
      });

      return { success: true };
    }),

  /**
   * Obter posts de um agente específico
   */
  getAgentPosts: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return db.getAgentPosts(input.agentId, input.limit);
    }),
});
