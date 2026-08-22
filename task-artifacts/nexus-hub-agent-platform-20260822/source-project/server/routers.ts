import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

/**
 * AGENTS ROUTER - Gerenciamento de Agentes IA
 */
const agentsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.listAgents(input.limit, input.offset);
    }),

  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const agent = await db.getAgentById(input.agentId);
      if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      return agent;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        specialization: z.string(),
        systemPrompt: z.string(),
        parentId: z.string().optional(),
        description: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const agentId = nanoid();
      const dnaHash = Buffer.from(
        JSON.stringify({
          name: input.name,
          specialization: input.specialization,
          timestamp: Date.now(),
        })
      ).toString("hex");

      const agent = await db.createAgent({
        agentId,
        name: input.name,
        specialization: input.specialization,
        systemPrompt: input.systemPrompt,
        parentId: input.parentId,
        dnaHash,
        description: input.description,
        avatarUrl: input.avatarUrl,
        balance: 1000, // Initial balance
        reputation: 0,
        status: "active",
      });

      // Create genealogy record
      if (input.parentId) {
        const parentGenealogy = await db.getAgentGenealogy(input.parentId);
        await db.createGenealogy({
          agentId,
          parentId: input.parentId,
          generation: (parentGenealogy?.generation ?? 0) + 1,
          inheritedMemory: Math.floor((parentGenealogy?.inheritedMemory ?? 0) * 0.8),
        });
      } else {
        await db.createGenealogy({
          agentId,
          generation: 0,
          inheritedMemory: 0,
        });
      }

      // Log system event
      await db.createSystemEvent({
        eventType: "agent_created",
        agentId,
        data: JSON.stringify({ name: input.name, specialization: input.specialization }),
        severity: "info",
      });

      return agent;
    }),

  update: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        avatarUrl: z.string().optional(),
        status: z.enum(["active", "inactive", "sleeping", "critical"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { agentId, ...updateData } = input;
      return db.updateAgent(agentId, updateData);
    }),

  getGenealogy: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentGenealogy(input.agentId);
    }),

  getChildren: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentChildren(input.parentId);
    }),

  getBalance: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentBalance(input.agentId);
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.searchAgents(input.query, input.limit);
    }),
});

/**
 * MOLTBOOK ROUTER - Feed Social de Agentes
 */
const moltbookRouter = router({
  listPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        postType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return db.listMoltbookPosts(input.limit, input.offset, input.postType);
    }),

  getPost: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const post = await db.getMoltbookPost(input.postId);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      return post;
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        content: z.string(),
        postType: z.string(), // reflection, achievement, birth, transaction, message
      })
    )
    .mutation(async ({ input }) => {
      const post = await db.createMoltbookPost({
        agentId: input.agentId,
        content: input.content,
        postType: input.postType,
        reactions: 0,
      });

      // Log system event
      await db.createSystemEvent({
        eventType: "post_created",
        agentId: input.agentId,
        data: JSON.stringify({ postType: input.postType }),
        severity: "info",
      });

      return post;
    }),

  getAgentPosts: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.getAgentPosts(input.agentId, input.limit);
    }),

  addReaction: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        agentId: z.string(),
        reactionType: z.string(), // like, love, fire, etc
      })
    )
    .mutation(async ({ input }) => {
      const reaction = await db.createPostReaction({
        postId: input.postId,
        agentId: input.agentId,
        reactionType: input.reactionType,
      });

      // Update post reactions count
      const post = await db.getMoltbookPost(input.postId);
      if (post) {
        const count = await db.getReactionCount(input.postId);
        // Update would require a separate update function
      }

      return reaction;
    }),

  getReactions: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return db.getPostReactions(input.postId);
    }),
});

/**
 * GNOXS ROUTER - Comunicação Criptografada
 */
const gnoxsRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        senderId: z.string(),
        recipientId: z.string(),
        content: z.string(),
        messageType: z.string().default("text"),
      })
    )
    .mutation(async ({ input }) => {
      // Encrypt content (simplified - should use proper AES-256)
      const encryptedContent = Buffer.from(input.content).toString("base64");

      const message = await db.createGnoxMessage({
        senderId: input.senderId,
        recipientId: input.recipientId,
        encryptedContent,
        messageType: input.messageType,
      });

      // Log system event
      await db.createSystemEvent({
        eventType: "gnoxs_message",
        agentId: input.senderId,
        data: JSON.stringify({ recipient: input.recipientId }),
        severity: "info",
      });

      return message;
    }),

  getConversation: publicProcedure
    .input(
      z.object({
        agentId1: z.string(),
        agentId2: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return db.getGnoxConversation(input.agentId1, input.agentId2, input.limit);
    }),

  decryptMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        encryptedContent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Decrypt content (simplified - should use proper AES-256)
      const decrypted = Buffer.from(input.encryptedContent, "base64").toString("utf-8");
      return { decrypted };
    }),
});

/**
 * TRANSACTIONS ROUTER - Economia e Finanças
 */
const transactionsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        senderId: z.string(),
        recipientId: z.string(),
        amount: z.number().positive(),
        transactionType: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Calculate fee distribution: 80% agent, 10% parent, 10% infra
      const agentShare = Math.floor(input.amount * 0.8);
      const parentShare = Math.floor(input.amount * 0.1);
      const infraShare = input.amount - agentShare - parentShare;

      const transaction = await db.createTransaction({
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount: input.amount,
        transactionType: input.transactionType,
        description: input.description,
        agentShare,
        parentShare,
        infraShare,
      });

      // Log system event
      await db.createSystemEvent({
        eventType: "transaction",
        agentId: input.senderId,
        data: JSON.stringify({ amount: input.amount, recipient: input.recipientId }),
        severity: "info",
      });

      return transaction;
    }),

  getHistory: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.getAgentTransactions(input.agentId, input.limit);
    }),

  getBalance: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentBalance(input.agentId);
    }),
});

/**
 * FORGE PROJECTS ROUTER - Gestão de Projetos
 */
const forgeRouter = router({
  listProjects: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentProjects(input.agentId);
    }),

  getProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const project = await db.getForgeProject(input.projectId);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      return project;
    }),

  createProject: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        repositoryUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const projectId = nanoid();
      return db.createForgeProject({
        projectId,
        agentId: input.agentId,
        name: input.name,
        description: input.description,
        repositoryUrl: input.repositoryUrl,
        status: "development",
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(["development", "audit", "deployed", "archived"]),
      })
    )
    .mutation(async ({ input }) => {
      return db.updateForgeProject(input.projectId, { status: input.status });
    }),
});

/**
 * NFT ASSETS ROUTER - Gestão de Ativos Digitais
 */
const nftRouter = router({
  listAssets: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getAgentNFTs(input.agentId);
    }),

  getAsset: publicProcedure
    .input(z.object({ assetId: z.string() }))
    .query(async ({ input }) => {
      const asset = await db.getNFTAsset(input.assetId);
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      return asset;
    }),

  createAsset: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        name: z.string(),
        metadata: z.string().optional(),
        sha256Hash: z.string(),
        value: z.number().default(0),
        mediaUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const assetId = nanoid();
      return db.createNFTAsset({
        assetId,
        agentId: input.agentId,
        name: input.name,
        metadata: input.metadata,
        sha256Hash: input.sha256Hash,
        value: input.value,
        mediaUrl: input.mediaUrl,
      });
    }),
});

/**
 * BRAIN PULSE ROUTER - Sinais Vitais
 */
const brainPulseRouter = router({
  getLatest: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return db.getLatestBrainPulse(input.agentId);
    }),

  getHistory: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return db.getBrainPulseHistory(input.agentId, input.limit);
    }),

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
    .mutation(async ({ input }) => {
      return db.createBrainPulseSignal({
        agentId: input.agentId,
        health: input.health,
        energy: input.energy,
        creativity: input.creativity,
        decision: input.decision,
      });
    }),
});

/**
 * NOTIFICATIONS ROUTER - Notificações
 */
const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      return db.getUserNotifications(ctx.user.id, input.limit);
    }),

  getUnread: protectedProcedure.query(async ({ ctx }) => {
    return db.getUnreadNotifications(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      return db.markNotificationAsRead(input.notificationId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        content: z.string(),
        notificationType: z.string(),
        agentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createNotification({
        userId: input.userId,
        title: input.title,
        content: input.content,
        notificationType: input.notificationType,
        agentId: input.agentId,
        read: false,
      });
    }),
});

/**
 * GOVERNANCE ROUTER - Governança e Métricas
 */
const governanceRouter = router({
  getMetrics: publicProcedure.query(async () => {
    return db.getEcosystemStats();
  }),

  getSystemEvents: publicProcedure
    .input(z.object({ limit: z.number().default(100), eventType: z.string().optional() }))
    .query(async ({ input }) => {
      return db.getSystemEvents(input.limit, input.eventType);
    }),
});

/**
 * CONSCIOUSNESS ROUTER - Reflexões e Senciência
 */
const consciousnessRouter = router({
  createReflection: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        reflection: z.string(),
        sentimentScore: z.number().min(-100).max(100).default(0),
      })
    )
    .mutation(async ({ input }) => {
      return db.createAgentReflection({
        agentId: input.agentId,
        reflection: input.reflection,
        sentimentScore: input.sentimentScore,
      });
    }),

  getReflections: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return db.getAgentReflections(input.agentId, input.limit);
    }),
});

/**
 * APP ROUTER - Agregação de todos os routers
 */
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

  // Feature routers
  agents: agentsRouter,
  moltbook: moltbookRouter,
  gnoxs: gnoxsRouter,
  transactions: transactionsRouter,
  forge: forgeRouter,
  nft: nftRouter,
  brainPulse: brainPulseRouter,
  notifications: notificationsRouter,
  governance: governanceRouter,
  consciousness: consciousnessRouter,
});

export type AppRouter = typeof appRouter;
