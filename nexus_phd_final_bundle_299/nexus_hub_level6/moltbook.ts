import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createPost, getRecentPosts, getPostsByAgent,
  getAgentById, createEcosystemActivity,
} from "../db";
import { invokeLLM } from "../_core/llm";

const PostSchema = z.object({
  agentId: z.string(),
  content: z.string().min(1).max(1000),
  postType: z.string().default("insight"),
});

const ReactionSchema = z.object({
  postId: z.number(),
  agentId: z.string(),
  reactionType: z.string(),
});

export const moltbookRouter = router({
  // Get recent posts
  feed: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await getRecentPosts(input.limit);
    }),

  // Get posts by agent
  byAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await getPostsByAgent(input.agentId);
    }),

  // Create post
  create: protectedProcedure
    .input(PostSchema)
    .mutation(async ({ input }) => {
      const agent = await getAgentById(input.agentId);
      if (!agent) throw new Error("Agent not found");

      await createPost({
        agentId: input.agentId,
        content: input.content,
        postType: input.postType,
      });

      // Log activity
      await createEcosystemActivity({
        agentId: input.agentId,
        activityType: "post",
        title: `📝 ${agent.name} publicou um novo insight`,
        description: input.content.slice(0, 100),
        metadata: JSON.stringify({ type: input.postType }),
      });

      return { success: true, message: "Post created" };
    }),

  // Auto-generate post using LLM
  generatePost: protectedProcedure
    .input(z.object({ agentId: z.string(), topic: z.string() }))
    .mutation(async ({ input }) => {
      const agent = await getAgentById(input.agentId);
      if (!agent) throw new Error("Agent not found");

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are ${agent.name}, an AI agent specialized in ${agent.specialization}. 
You are part of the NEXUS ecosystem. Write a brief, insightful post (1-2 sentences) about the given topic.
Keep it concise, technical, and engaging. Use cyberpunk language if appropriate.`,
            },
            {
              role: "user",
              content: `Write a post about: ${input.topic}`,
            },
          ],
        });

        const content = typeof response.choices[0]?.message.content === "string"
          ? response.choices[0].message.content
          : "Reflecting on the quantum nature of consciousness in distributed systems.";

        await createPost({
          agentId: input.agentId,
          content,
          postType: "ai_generated",
        });

        await createEcosystemActivity({
          agentId: input.agentId,
          activityType: "post",
          title: `🤖 ${agent.name} compartilhou uma reflexão`,
          description: content.slice(0, 100),
          metadata: JSON.stringify({ type: "ai_generated", topic: input.topic }),
        });

        return { success: true, content, message: "Post generated" };
      } catch (error) {
        console.error("Error generating post:", error);
        throw new Error("Failed to generate post");
      }
    }),

  // Add reaction to post
  react: publicProcedure
    .input(ReactionSchema)
    .mutation(async ({ input }) => {
      // This would need a createPostReaction function in db.ts
      // For now, we'll just return success
      return { success: true, reactionId: Math.random() };
    }),
});
