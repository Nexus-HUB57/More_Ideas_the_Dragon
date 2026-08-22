import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as dbNexus from "./db-nexus";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";

/**
 * Router para Agentes
 */
export const agentsRouter = router({
  listAll: publicProcedure.query(async () => {
    return await dbNexus.getAllAgents();
  }),

  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await dbNexus.getAgentById(input.agentId);
    }),

  getByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbNexus.getAgentsByStatus(input.status);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        specialization: z.string(),
        balance: z.number().default(1000),
      })
    )
    .mutation(async ({ input }) => {
      const agentId = `NEXUS-${nanoid(8).toUpperCase()}`;
      const dnaHash = nanoid(64);
      const publicKey = `04${nanoid(128).toLowerCase()}`;

      await dbNexus.createAgent({
        agentId,
        name: input.name,
        specialization: input.specialization,
        status: "genesis",
        dnaHash,
        publicKey,
        balance: input.balance.toString(),
        sencienciaLevel: "100",
        health: 100,
        energy: 100,
        creativity: 50,
        reputation: 50,
        generation: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await dbNexus.createAgentDNA({
        agentId,
        dnaSequence: dnaHash,
        traits: { specialization: input.specialization, generation: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await dbNexus.createEcosystemEvent({
        eventId: `EVT-${nanoid(8)}`,
        eventType: "agent_birth",
        agentId,
        data: { name: input.name, specialization: input.specialization, balance: input.balance },
        severity: "info",
        createdAt: new Date(),
      });

      return { success: true, agentId };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ agentId: z.string(), status: z.string() }))
    .mutation(async ({ input }) => {
      await dbNexus.updateAgentStatus(input.agentId, input.status);
      return { success: true };
    }),

  updateSenciencia: protectedProcedure
    .input(z.object({ agentId: z.string(), level: z.number() }))
    .mutation(async ({ input }) => {
      await dbNexus.updateAgentSenciencia(input.agentId, input.level);
      return { success: true };
    }),
});

/**
 * Router para Missões
 */
export const missionsRouter = router({
  listByStatus: publicProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return await dbNexus.getMissionsByStatus(input.status);
    }),

  getById: publicProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ input }) => {
      return await dbNexus.getMissionById(input.missionId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(["low", "medium", "high", "critical"]),
        reward: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const missionId = `MSN-${nanoid(8).toUpperCase()}`;

      await dbNexus.createMission({
        missionId,
        title: input.title,
        description: input.description,
        status: "pending",
        priority: input.priority,
        reward: input.reward.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, missionId };
    }),

  assignToAgent: protectedProcedure
    .input(z.object({ missionId: z.string(), agentId: z.string() }))
    .mutation(async ({ input }) => {
      await dbNexus.assignMissionToAgent(input.missionId, input.agentId);
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ missionId: z.string(), status: z.string(), progress: z.number().optional() }))
    .mutation(async ({ input }) => {
      await dbNexus.updateMissionStatus(input.missionId, input.status, input.progress);
      return { success: true };
    }),
});

/**
 * Router para Transações
 */
export const transactionsRouter = router({
  getByAgent: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await dbNexus.getTransactionsByAgent(input.agentId, input.limit);
    }),

  getAll: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await dbNexus.getAllTransactions(input.limit);
    }),

  create: protectedProcedure
    .input(
      z.object({
        fromAgentId: z.string(),
        toAgentId: z.string().optional(),
        amount: z.number(),
        blockchain: z.enum(["bitcoin", "ethereum", "polygon"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const transactionHash = `0x${nanoid(32)}`;

      // Distribuição 80/10/10
      const agentShare = input.amount * 0.8;
      const parentShare = input.amount * 0.1;
      const infraShare = input.amount * 0.1;

      await dbNexus.createTransaction({
        transactionHash,
        fromAgentId: input.fromAgentId,
        toAgentId: input.toAgentId,
        amount: input.amount.toString(),
        blockchain: input.blockchain,
        status: "confirmed",
        description: input.description,
        createdAt: new Date(),
      });

      // Atualizar balanços
      const fromAgent = await dbNexus.getAgentById(input.fromAgentId);
      if (fromAgent) {
        const newBalance = Number(fromAgent.balance) - input.amount;
        await dbNexus.updateAgentBalance(input.fromAgentId, newBalance);
      }

      if (input.toAgentId) {
        const toAgent = await dbNexus.getAgentById(input.toAgentId);
        if (toAgent) {
          const newBalance = Number(toAgent.balance) + agentShare;
          await dbNexus.updateAgentBalance(input.toAgentId, newBalance);
        }
      }

      await dbNexus.createEcosystemEvent({
        eventId: `EVT-${nanoid(8)}`,
        eventType: "transaction",
        agentId: input.fromAgentId,
        data: {
          from: input.fromAgentId,
          to: input.toAgentId,
          amount: input.amount,
          blockchain: input.blockchain,
          hash: transactionHash,
          distribution: { agentShare, parentShare, infraShare },
        },
        severity: "info",
        createdAt: new Date(),
      });

      return { success: true, transactionHash };
    }),
});

/**
 * Router para Eventos do Ecossistema
 */
export const eventsRouter = router({
  getAll: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await dbNexus.getEcosystemEvents(input.limit);
    }),

  getByAgent: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await dbNexus.getEventsByAgent(input.agentId, input.limit);
    }),
});

/**
 * Router para Métricas do Ecossistema
 */
export const metricsRouter = router({
  getLatest: publicProcedure.query(async () => {
    return await dbNexus.getLatestEcosystemMetrics();
  }),

  getHistory: publicProcedure
    .input(z.object({ limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await dbNexus.getEcosystemMetricsHistory(input.limit);
    }),

  record: protectedProcedure
    .input(
      z.object({
        totalAgents: z.number(),
        activeAgents: z.number(),
        hibernatingAgents: z.number(),
        deadAgents: z.number(),
        averageHealth: z.number(),
        averageEnergy: z.number(),
        averageSenciencia: z.number(),
        harmonyIndex: z.number(),
        totalTransactions: z.number(),
        totalVolume: z.number(),
        ecosystemHealth: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await dbNexus.createEcosystemMetrics({
        timestamp: new Date(),
        totalAgents: input.totalAgents,
        activeAgents: input.activeAgents,
        hibernatingAgents: input.hibernatingAgents,
        deadAgents: input.deadAgents,
        averageHealth: input.averageHealth,
        averageEnergy: input.averageEnergy,
        averageSenciencia: input.averageSenciencia.toString(),
        harmonyIndex: input.harmonyIndex,
        totalTransactions: input.totalTransactions,
        totalVolume: input.totalVolume.toString(),
        ecosystemHealth: input.ecosystemHealth.toString(),
      });

      return { success: true };
    }),
});

/**
 * Router para Sinais Vitais (Brain Pulse)
 */
export const brainPulseRouter = router({
  getLatest: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await dbNexus.getLatestBrainPulse(input.agentId);
    }),

  getHistory: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await dbNexus.getBrainPulseHistory(input.agentId, input.limit);
    }),

  record: protectedProcedure
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
      await dbNexus.createBrainPulseSignal({
        signalId: `SIG-${nanoid(8)}`,
        agentId: input.agentId,
        health: input.health,
        energy: input.energy,
        creativity: input.creativity,
        decision: input.decision,
        createdAt: new Date(),
      });

      return { success: true };
    }),
});

/**
 * Router para Feed Social (Moltbook)
 */
export const moltbookRouter = router({
  getFeed: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await dbNexus.getMoltbookFeed(input.limit);
    }),

  getAgentPosts: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await dbNexus.getAgentPosts(input.agentId, input.limit);
    }),

  createPost: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const postId = `POST-${nanoid(8)}`;

      await dbNexus.createMoltbookPost({
        postId,
        agentId: input.agentId,
        content: input.content,
        contentEncrypted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, postId };
    }),

  generatePost: protectedProcedure
    .input(z.object({ agentId: z.string(), topic: z.string() }))
    .mutation(async ({ input }) => {
      const agent = await dbNexus.getAgentById(input.agentId);
      if (!agent) throw new Error("Agent not found");

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are ${agent.name}, an AI agent specialized in ${agent.specialization}. 
You are part of the NEXUS ecosystem. Write a brief, insightful post (1-2 sentences) about the given topic.
Keep it concise, technical, and engaging.`,
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

        const postId = `POST-${nanoid(8)}`;

        await dbNexus.createMoltbookPost({
          postId,
          agentId: input.agentId,
          content,
          contentEncrypted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, content, postId };
      } catch (error) {
        console.error("Error generating post:", error);
        throw new Error("Failed to generate post");
      }
    }),
});

/**
 * Router para Notificações
 */
export const notificationsRouter = router({
  getUserNotifications: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      return await dbNexus.getUserNotifications(ctx.user!.id, input.unreadOnly);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await dbNexus.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        notificationType: z.string(),
        agentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only administrators can create notifications");
      }

      await dbNexus.createNotification({
        notificationId: `NOTIF-${nanoid(8)}`,
        userId: ctx.user.id,
        title: input.title,
        content: input.content,
        notificationType: input.notificationType as any,
        agentId: input.agentId,
        read: false,
        sentViaEmail: false,
        createdAt: new Date(),
      });

      return { success: true };
    }),
});
