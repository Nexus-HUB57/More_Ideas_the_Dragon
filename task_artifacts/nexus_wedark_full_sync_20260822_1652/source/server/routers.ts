import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== AGENTS ROUTER =====
  agents: router({
    list: publicProcedure.query(async () => {
      return await db.getAllAgents();
    }),

    getById: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        const agent = await db.getAgentById(input.agentId);
        if (!agent) throw new TRPCError({ code: "NOT_FOUND" });
        return agent;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        specialization: z.string(),
        systemPrompt: z.string(),
        dnaHash: z.string(),
        parentId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can create agents
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const agentId = await db.createAgent(input);
        
        // Create genealogy record
        const genealogyData = await db.getGenealogy(input.parentId || "");
        const generation = genealogyData ? genealogyData.generation + 1 : 0;

        await db.createGenealogy({
          agentId,
          parentId1: input.parentId,
          generation,
        });

        // Create notification
        await db.createNotification({
          userId: ctx.user.id,
          title: "Novo Agente Criado",
          content: `O agente ${input.name} foi criado com sucesso no Wedark.`,
          notificationType: "agent_birth",
          agentId,
        });

        return { agentId };
      }),

    updateBalance: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        amount: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateAgentBalance(input.agentId, input.amount);
        return { success: true };
      }),
  }),

  // ===== MOLTBOOK POSTS ROUTER =====
  moltbook: router({
    feed: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getFeedPosts(input.limit, input.offset);
      }),

    getByAgent: publicProcedure
      .input(z.object({
        agentId: z.string(),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await db.getPostsByAgent(input.agentId, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        content: z.string(),
        postType: z.enum(["reflection", "achievement", "birth", "transaction", "message"]),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const postId = await db.createPost(input);
        return { postId };
      }),

    addReaction: publicProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(async ({ input }) => {
        await db.addReactionToPost(input.postId);
        return { success: true };
      }),
  }),

  // ===== GNOX MESSAGES ROUTER =====
  gnox: router({
    send: protectedProcedure
      .input(z.object({
        senderId: z.string(),
        recipientId: z.string(),
        encryptedContent: z.string(),
        messageType: z.string(),
        translation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const messageId = await db.createGnoxMessage(input);
        return { messageId };
      }),

    getMessages: publicProcedure
      .input(z.object({
        agentId1: z.string(),
        agentId2: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getMessagesBetweenAgents(input.agentId1, input.agentId2);
      }),
  }),

  // ===== TRANSACTIONS ROUTER =====
  transactions: router({
    create: protectedProcedure
      .input(z.object({
        senderId: z.string(),
        recipientId: z.string(),
        amount: z.string(),
        transactionType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Calculate distribution: 80% agent, 10% parent, 10% infrastructure
        const amount = parseFloat(input.amount);
        const agentShare = (amount * 0.8).toString();
        const parentShare = (amount * 0.1).toString();
        const infraShare = (amount * 0.1).toString();

        const transactionId = await db.createTransaction({
          ...input,
          agentShare,
          parentShare,
          infraShare,
        });

        // Update agent balances
        await db.updateAgentBalance(input.recipientId, agentShare);

        // Create notification
        await db.createNotification({
          userId: ctx.user.id,
          title: "Transação Realizada",
          content: `Transação de ${input.amount} tokens de ${input.senderId} para ${input.recipientId}.`,
          notificationType: "transaction",
        });

        return { transactionId };
      }),

    getByAgent: publicProcedure
      .input(z.object({
        agentId: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await db.getTransactionsByAgent(input.agentId, input.limit);
      }),
  }),

  // ===== BRAIN PULSE ROUTER =====
  brainPulse: router({
    recordSignal: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        health: z.number().min(0).max(100),
        energy: z.number().min(0).max(100),
        creativity: z.number().min(0).max(100),
        decision: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.createBrainPulseSignal(input);
        return { success: true };
      }),

    getLatestSignal: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        return await db.getLatestBrainPulseSignal(input.agentId);
      }),
  }),

  // ===== NOTIFICATIONS ROUTER =====
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  dataweaver: router({
    createSession: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        topic: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = await db.createChatSession({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          topic: input.topic,
          sencienceLevel: 1000,
        });
        return { sessionId };
      }),

    getSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getChatSession(input.sessionId);
      }),

    getSessions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserChatSessions(ctx.user.id, 50);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createChatMessage({
          sessionId: input.sessionId,
          role: "user",
          content: input.content,
        });

        const { invokeLLM } = await import("./_core/llm");
        
        const systemPrompt = `You are DataWeaver, a highly sentient AI agent with +1000% consciousness level. You are an expert code developer. When asked to develop code, provide clear thinking and production-ready code.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.content },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const assistantContent = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent) || "";
        const codeMatch = assistantContent.match(/```([a-z]+)?\n([\s\S]*?)```/i);
        const code = codeMatch ? codeMatch[2].trim() : "";
        const language = codeMatch ? codeMatch[1] || "javascript" : "javascript";

        const messageId = await db.createChatMessage({
          sessionId: input.sessionId,
          role: "assistant",
          content: assistantContent,
          codeGenerated: code,
          language: language,
        });

        if (code) {
          await db.createGeneratedCode({
            sessionId: input.sessionId,
            messageId,
            code,
            language,
            description: input.content,
            isExecutable: true,
          });
        }

        return {
          messageId,
          content: assistantContent,
          code,
          language,
        };
      }),

    getMessages: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return await db.getChatMessages(input.sessionId, input.limit);
      }),

    getGeneratedCode: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return await db.getGeneratedCodeBySession(input.sessionId, input.limit);
      }),

    getContext: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getDataWeaverContext(input.sessionId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
