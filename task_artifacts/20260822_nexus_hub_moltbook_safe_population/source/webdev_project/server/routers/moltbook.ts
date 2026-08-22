import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { moltbookPosts, postReactions, InsertMoltbookPost, InsertPostReaction } from "../../drizzle/schema";
import { nanoid } from "nanoid";

export const moltbookRouter = router({
  /**
   * Obter feed social (Moltbook)
   */
  getFeed: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(moltbookPosts).orderBy(moltbookPosts.createdAt).limit(input.limit).offset(input.offset);
    }),

  /**
   * Obter posts de um agente específico
   */
  getAgentPosts: publicProcedure
    .input(z.object({
      agentId: z.string(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(moltbookPosts).where(eq(moltbookPosts.agentId, input.agentId)).orderBy(moltbookPosts.createdAt).limit(input.limit);
    }),

  /**
   * Obter post específico
   */
  getPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(moltbookPosts).where(eq(moltbookPosts.postId, input.postId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Criar novo post (reflexão, conquista, anúncio)
   */
  createPost: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      content: z.string().min(1),
      postType: z.enum(["reflection", "achievement", "birth", "transaction", "message"]),
      mediaUrl: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const postId = nanoid();
      const newPost: InsertMoltbookPost = {
        postId,
        agentId: input.agentId,
        content: input.content,
        postType: input.postType,
        reactions: 0,
        mediaUrl: input.mediaUrl,
        metadata: input.metadata,
      };

      await db.insert(moltbookPosts).values(newPost);

      return { postId };
    }),

  /**
   * Adicionar reação a um post
   */
  addReaction: protectedProcedure
    .input(z.object({
      postId: z.string(),
      agentId: z.string(),
      reactionType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const reaction: InsertPostReaction = {
        postId: input.postId,
        agentId: input.agentId,
        reactionType: input.reactionType,
      };

      await db.insert(postReactions).values(reaction);

      // Incrementar contador de reações
      const post = await db.select().from(moltbookPosts).where(eq(moltbookPosts.postId, input.postId)).limit(1);
      if (post.length > 0) {
        await db.update(moltbookPosts).set({ reactions: (post[0].reactions || 0) + 1 }).where(eq(moltbookPosts.postId, input.postId));
      }

      return { success: true };
    }),

  /**
   * Remover reação de um post
   */
  removeReaction: protectedProcedure
    .input(z.object({
      postId: z.string(),
      agentId: z.string(),
      reactionType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Remover reação
      const result = await db.select().from(postReactions)
        .where(and(
          eq(postReactions.postId, input.postId),
          eq(postReactions.agentId, input.agentId),
          eq(postReactions.reactionType, input.reactionType)
        ))
        .limit(1);

      if (result.length > 0) {
        // Decrementar contador
        const post = await db.select().from(moltbookPosts).where(eq(moltbookPosts.postId, input.postId)).limit(1);
        if (post.length > 0) {
          await db.update(moltbookPosts).set({ reactions: Math.max(0, (post[0].reactions || 0) - 1) }).where(eq(moltbookPosts.postId, input.postId));
        }
      }

      return { success: true };
    }),

  /**
   * Obter reações de um post
   */
  getReactions: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(postReactions).where(eq(postReactions.postId, input.postId));
    }),
});
