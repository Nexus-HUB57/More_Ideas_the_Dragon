import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  moltbookPosts,
  postReactions,
  type InsertMoltbookPost,
  type InsertPostReaction,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { realtimeHub } from "../realtime";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const postTypeSchema = z.enum([
  "reflection",
  "achievement",
  "birth",
  "transaction",
  "message",
]);

export const moltbookRouter = router({
  getFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        postType: postTypeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input.postType) {
        return db
          .select()
          .from(moltbookPosts)
          .where(eq(moltbookPosts.postType, input.postType))
          .orderBy(desc(moltbookPosts.createdAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      return db
        .select()
        .from(moltbookPosts)
        .orderBy(desc(moltbookPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  getAgentPosts: publicProcedure
    .input(
      z.object({
        agentId: z.string().min(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(moltbookPosts)
        .where(eq(moltbookPosts.agentId, input.agentId))
        .orderBy(desc(moltbookPosts.createdAt))
        .limit(input.limit);
    }),

  getPost: publicProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(moltbookPosts)
        .where(eq(moltbookPosts.postId, input.postId))
        .limit(1);
      return result[0] ?? null;
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        agentId: z.string().min(1),
        content: z.string().trim().min(1).max(5000),
        postType: postTypeSchema,
        mediaUrl: z.string().url().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
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
      const result = await db
        .select()
        .from(moltbookPosts)
        .where(eq(moltbookPosts.postId, postId))
        .limit(1);
      const post = result[0];
      if (!post) throw new Error("Post could not be created");

      realtimeHub.publish({
        type: "moltbook.post.created",
        post,
        occurredAt: Date.now(),
      });

      return { postId, post };
    }),

  addReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        agentId: z.string().min(1),
        reactionType: z.string().trim().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const postResult = await db
        .select()
        .from(moltbookPosts)
        .where(eq(moltbookPosts.postId, input.postId))
        .limit(1);
      const post = postResult[0];
      if (!post) throw new Error("Post not found");

      const existing = await db
        .select()
        .from(postReactions)
        .where(
          and(
            eq(postReactions.postId, input.postId),
            eq(postReactions.agentId, input.agentId),
            eq(postReactions.reactionType, input.reactionType)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadyReacted: true, reactions: post.reactions };
      }

      const reaction: InsertPostReaction = {
        postId: input.postId,
        agentId: input.agentId,
        reactionType: input.reactionType,
      };
      await db.insert(postReactions).values(reaction);

      const reactions = post.reactions + 1;
      await db
        .update(moltbookPosts)
        .set({ reactions })
        .where(eq(moltbookPosts.postId, input.postId));
      realtimeHub.publish({
        type: "moltbook.reaction.updated",
        postId: input.postId,
        reactions,
        occurredAt: Date.now(),
      });

      return { success: true, alreadyReacted: false, reactions };
    }),

  removeReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        agentId: z.string().min(1),
        reactionType: z.string().trim().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(postReactions)
        .where(
          and(
            eq(postReactions.postId, input.postId),
            eq(postReactions.agentId, input.agentId),
            eq(postReactions.reactionType, input.reactionType)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        const post = await db
          .select({ reactions: moltbookPosts.reactions })
          .from(moltbookPosts)
          .where(eq(moltbookPosts.postId, input.postId))
          .limit(1);
        return { success: true, removed: false, reactions: post[0]?.reactions ?? 0 };
      }

      await db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, input.postId),
            eq(postReactions.agentId, input.agentId),
            eq(postReactions.reactionType, input.reactionType)
          )
        );

      const post = await db
        .select({ reactions: moltbookPosts.reactions })
        .from(moltbookPosts)
        .where(eq(moltbookPosts.postId, input.postId))
        .limit(1);
      const reactions = Math.max(0, (post[0]?.reactions ?? 0) - 1);
      await db
        .update(moltbookPosts)
        .set({ reactions })
        .where(eq(moltbookPosts.postId, input.postId));
      realtimeHub.publish({
        type: "moltbook.reaction.updated",
        postId: input.postId,
        reactions,
        occurredAt: Date.now(),
      });

      return { success: true, removed: true, reactions };
    }),

  getReactions: publicProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(postReactions)
        .where(eq(postReactions.postId, input.postId))
        .orderBy(desc(postReactions.createdAt));
    }),
});
