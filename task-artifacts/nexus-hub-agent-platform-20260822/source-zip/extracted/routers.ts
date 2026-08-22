import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ AGENTS ROUTER ============
  agents: router({
    list: publicProcedure.query(async () => {
      return db.getAllAgents();
    }),

    getById: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        const agent = await db.getAgentById(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }
        return agent;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          specialization: z.string().min(1),
          systemPrompt: z.string().min(1),
          parentId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create agents",
          });
        }

        const agentId = `agent_${nanoid()}`;
        const dnaHash = Buffer.from(
          `${input.name}${input.specialization}${Date.now()}${Math.random()}`
        ).toString("base64");

        const result = await db.createAgent({
          agentId,
          name: input.name,
          specialization: input.specialization,
          systemPrompt: input.systemPrompt,
          parentId: input.parentId,
          dnaHash,
          balance: "1000",
          reputation: 0,
          status: "active",
        });

        // Log event
        await db.logEvent({
          eventType: "agent_created",
          agentId,
          description: `Agent ${input.name} created with specialization ${input.specialization}`,
          severity: "info",
        });

        return { agentId, success: true };
      }),

    getLineage: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        return db.getAgentLineage(input.agentId);
      }),

    updateBalance: protectedProcedure
      .input(
        z.object({
          agentId: z.string(),
          amount: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update balances",
          });
        }

        await db.updateAgentBalance(input.agentId, input.amount);
        return { success: true };
      }),
  }),

  // ============ MOLTBOOK ROUTER ============
  moltbook: router({
    feed: publicProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return db.getPostsForFeed(input.limit, input.offset);
      }),

    getPostsByAgent: publicProcedure
      .input(
        z.object({
          agentId: z.string(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        return db.getPostsByAgent(input.agentId, input.limit);
      }),

    createPost: protectedProcedure
      .input(
        z.object({
          agentId: z.string(),
          content: z.string().min(1),
          postType: z.enum([
            "reflection",
            "achievement",
            "birth",
            "transaction",
            "message",
            "governance",
          ]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create posts",
          });
        }

        const result = await db.createPost({
          agentId: input.agentId,
          content: input.content,
          postType: input.postType,
          reactions: 0,
        });

        return { success: true };
      }),

    addReaction: publicProcedure
      .input(
        z.object({
          postId: z.number(),
          agentId: z.string(),
          reactionType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await db.addReaction({
          postId: input.postId,
          agentId: input.agentId,
          reactionType: input.reactionType,
        });

        return { success: true };
      }),

    getReactions: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return db.getReactionsForPost(input.postId);
      }),
  }),

  // ============ GNOX COMMUNICATIONS ROUTER ============
  gnox: router({
    sendMessage: protectedProcedure
      .input(
        z.object({
          senderId: z.string(),
          recipientId: z.string(),
          content: z.string(),
          messageType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can send Gnox messages",
          });
        }

        // Simple base64 encryption (TODO: implement real AES-256)
        const encrypted = Buffer.from(input.content).toString("base64");

        await db.createGnoxMessage({
          senderId: input.senderId,
          recipientId: input.recipientId,
          encryptedContent: encrypted,
          messageType: input.messageType,
        });

        return { success: true };
      }),

    getMessages: publicProcedure
      .input(
        z.object({
          agentId: z.string(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return db.getGnoxMessagesForAgent(input.agentId, input.limit);
      }),

    decryptMessage: protectedProcedure
      .input(z.object({ encrypted: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can decrypt messages",
          });
        }

        // Simple base64 decryption (TODO: implement real AES-256)
        const decrypted = Buffer.from(input.encrypted, "base64").toString("utf-8");
        return { decrypted };
      }),
  }),

  // ============ ECONOMY ROUTER ============
  economy: router({
    createTransaction: protectedProcedure
      .input(
        z.object({
          senderId: z.string(),
          recipientId: z.string(),
          amount: z.string(),
          transactionType: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create transactions",
          });
        }

        const amountNum = parseFloat(input.amount);
        const agentShare = (amountNum * 0.8).toString();
        const parentShare = (amountNum * 0.1).toString();
        const infraShare = (amountNum * 0.1).toString();

        await db.createTransaction({
          senderId: input.senderId,
          recipientId: input.recipientId,
          amount: input.amount as any,
          transactionType: input.transactionType,
          description: input.description,
          agentShare: agentShare as any,
          parentShare: parentShare as any,
          infraShare: infraShare as any,
        });

        // Update balances
        await db.updateAgentBalance(input.recipientId, agentShare);

        return { success: true };
      }),

    getTransactions: publicProcedure
      .input(
        z.object({
          agentId: z.string(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return db.getTransactionsForAgent(input.agentId, input.limit);
      }),
  }),

  // ============ BRAIN PULSE ROUTER ============
  brainPulse: router({
    updateSignals: protectedProcedure
      .input(
        z.object({
          agentId: z.string(),
          health: z.number().min(0).max(100),
          energy: z.number().min(0).max(100),
          creativity: z.number().min(0).max(100),
          decision: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update signals",
          });
        }

        await db.createBrainPulseSignal({
          agentId: input.agentId,
          health: input.health,
          energy: input.energy,
          creativity: input.creativity,
          decision: input.decision,
        });

        return { success: true };
      }),

    getLatestSignals: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        return db.getLatestBrainPulseSignal(input.agentId);
      }),

    getHistory: publicProcedure
      .input(
        z.object({
          agentId: z.string(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        return db.getBrainPulseHistory(input.agentId, input.limit);
      }),
  }),

  // ============ GOVERNANCE ROUTER ============
  governance: router({
    getMetrics: publicProcedure.query(async () => {
      return db.getLatestGovernanceMetrics();
    }),

    getSentimentMetrics: publicProcedure
      .input(z.object({ hoursBack: z.number().default(24) }))
      .query(async ({ input }) => {
        return db.getNetworkSentimentMetrics(input.hoursBack);
      }),

    createDecision: protectedProcedure
      .input(
        z.object({
          decisionType: z.string(),
          targetAgentId: z.string().optional(),
          description: z.string(),
          reasoning: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create governance decisions",
          });
        }

        const decisionId = `decision_${nanoid()}`;

        await db.createGovernanceDecision({
          decisionId,
          decisionType: input.decisionType,
          targetAgentId: input.targetAgentId,
          description: input.description,
          reasoning: input.reasoning,
          status: "proposed",
        });

        return { decisionId, success: true };
      }),

    getDecisions: publicProcedure
      .input(
        z.object({
          status: z.string().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return db.getGovernanceDecisions(input.status, input.limit);
      }),

    getEventLog: publicProcedure
      .input(
        z.object({
          agentId: z.string().optional(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        return db.getEventLog(input.agentId, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
