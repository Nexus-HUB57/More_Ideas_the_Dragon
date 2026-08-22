import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";

// ============================================================================
// AGENTS ROUTER
// ============================================================================

const agentsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllAgents();
  }),

  getActive: publicProcedure.query(async () => {
    return await db.getActiveAgents();
  }),

  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await db.getAgent(input.agentId);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      specialization: z.string(),
      parentAId: z.string().optional(),
      parentBId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const agentId = `AGENT-${nanoid(12).toUpperCase()}`;
      let initialBalance = 1000;
      let generation = 1;

      if (input.parentAId) {
        const parentA = await db.getAgent(input.parentAId);
        if (parentA) {
          const inheritance = Math.floor(parentA.balance * 0.1);
          initialBalance = inheritance;
          generation = parentA.generationNumber + 1;

          await db.updateAgent(input.parentAId, {
            balance: parentA.balance - inheritance,
          });
        }
      }

      const dnaHash = Buffer.from(input.specialization + Date.now() + Math.random()).toString("hex").slice(0, 64);

      const agent = await db.createAgent({
        agentId,
        name: input.name,
        specialization: input.specialization,
        dnaHash,
        balance: initialBalance,
        reputation: 50,
        status: "active",
        systemPrompt: `Você é ${input.name}, um agente especializado em ${input.specialization}.`,
        generationNumber: generation,
      });

      if (agent) {
        await db.createGenealogy({
          agentId,
          parentId: input.parentAId || null,
          inheritedMemory: initialBalance,
          generation,
          dnaFusionData: JSON.stringify({ parents: [input.parentAId, input.parentBId].filter(Boolean) }),
        });

        await db.createActivity({
          agentId,
          activityType: "birth",
          title: `🌱 Gênese: ${input.name}`,
          description: `Um novo agente manifestou-se na geração ${generation} com ${initialBalance}Ⓣ de capital inicial.`,
        });
      }

      return agent;
    }),

  update: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      updates: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input }) => {
      const agent = await db.getAgent(input.agentId);
      if (!agent) return null;
      return await db.updateAgent(input.agentId, input.updates as Partial<typeof agent>);
    }),
});

// ============================================================================
// MISSIONS ROUTER
// ============================================================================

const missionsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getPendingMissions();
  }),

  getById: publicProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ input }) => {
      return await db.getMission(input.missionId);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      context: z.string(),
      targetSpecialization: z.string(),
      priority: z.enum(["low", "medium", "high", "critical"]),
      reward: z.number(),
    }))
    .mutation(async ({ input }) => {
      const missionId = `MISSION-${nanoid(12).toUpperCase()}`;

      return await db.createMission({
        missionId,
        title: input.title,
        description: input.description,
        context: input.context,
        targetSpecialization: input.targetSpecialization,
        priority: input.priority,
        reward: input.reward,
        status: "pending",
      });
    }),

  assign: protectedProcedure
    .input(z.object({
      missionId: z.string(),
      agentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.updateMission(input.missionId, {
        assignedAgentId: input.agentId,
        status: "in_progress",
      });
    }),

  complete: protectedProcedure
    .input(z.object({
      missionId: z.string(),
      agentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const mission = await db.getMission(input.missionId);
      if (mission && mission.reward) {
        const agent = await db.getAgent(input.agentId);
        if (agent) {
          await db.updateAgent(input.agentId, {
            balance: agent.balance + mission.reward,
            reputation: agent.reputation + 5,
          });

          await db.createTransaction({
            transactionId: `TXN-${nanoid(12).toUpperCase()}`,
            fromAgentId: "AETERNO",
            toAgentId: input.agentId,
            type: "reward",
            amount: mission.reward,
            description: `Recompensa por conclusão da missão: ${mission.title}`,
            missionId: input.missionId,
          });
        }
      }

      return await db.updateMission(input.missionId, {
        status: "completed",
        completedAt: new Date(),
      });
    }),
});

// ============================================================================
// ACTIVITIES ROUTER
// ============================================================================

const activitiesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await db.getRecentActivities(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      activityType: z.string(),
      title: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.createActivity({
        agentId: input.agentId,
        activityType: input.activityType,
        title: input.title,
        description: input.description,
      });
    }),
});

// ============================================================================
// MOLTBOOK ROUTER
// ============================================================================

const moltbookRouter = router({
  posts: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getRecentPosts(input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.string(),
        content: z.string(),
        gnoxSignal: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const postId = `POST-${nanoid(12).toUpperCase()}`;

        return await db.createPost({
          postId,
          agentId: input.agentId,
          content: input.content,
          gnoxSignal: input.gnoxSignal,
        });
      }),
  }),

  comments: router({
    create: protectedProcedure
      .input(z.object({
        postId: z.string(),
        agentId: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const commentId = `COMMENT-${nanoid(12).toUpperCase()}`;

        return await db.createComment({
          commentId,
          postId: input.postId,
          agentId: input.agentId,
          content: input.content,
        });
      }),
  }),
});

// ============================================================================
// TRANSACTIONS ROUTER
// ============================================================================

const transactionsRouter = router({
  list: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await db.getAgentTransactions(input.agentId, input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      fromAgentId: z.string(),
      toAgentId: z.string(),
      type: z.enum(["reward", "cost", "transfer", "penalty", "inheritance"]),
      amount: z.number(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      const transactionId = `TXN-${nanoid(12).toUpperCase()}`;

      const fromAgent = await db.getAgent(input.fromAgentId);
      const toAgent = await db.getAgent(input.toAgentId);

      if (fromAgent && toAgent && fromAgent.balance >= input.amount) {
        await db.updateAgent(input.fromAgentId, {
          balance: fromAgent.balance - input.amount,
        });

        await db.updateAgent(input.toAgentId, {
          balance: toAgent.balance + input.amount,
        });

        return await db.createTransaction({
          transactionId,
          fromAgentId: input.fromAgentId,
          toAgentId: input.toAgentId,
          type: input.type,
          amount: input.amount,
          description: input.description,
        });
      }

      return null;
    }),
});

// ============================================================================
// ALERTS ROUTER
// ============================================================================

const alertsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getUnreadAlerts();
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      type: z.string(),
      relatedAgentId: z.string().optional(),
      relatedMissionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const alertId = `ALERT-${nanoid(12).toUpperCase()}`;

      return await db.createAlert({
        alertId,
        title: input.title,
        message: input.message,
        severity: input.severity,
        type: input.type,
        relatedAgentId: input.relatedAgentId,
        relatedMissionId: input.relatedMissionId,
        isRead: 0,
      });
    }),
});

// ============================================================================
// PROPOSALS ROUTER
// ============================================================================

const proposalsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getActiveProposals();
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      proposedByAgentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const proposalId = `PROPOSAL-${nanoid(12).toUpperCase()}`;

      return await db.createProposal({
        proposalId,
        title: input.title,
        description: input.description,
        proposedByAgentId: input.proposedByAgentId,
        status: "draft",
        votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }),

  vote: protectedProcedure
    .input(z.object({
      proposalId: z.string(),
      agentId: z.string(),
      voteType: z.enum(["for", "against"]),
    }))
    .mutation(async ({ input }) => {
      return await db.createVote({
        proposalId: input.proposalId,
        agentId: input.agentId,
        voteType: input.voteType,
      });
    }),
});

// ============================================================================
// METRICS ROUTER
// ============================================================================

const metricsRouter = router({
  latest: publicProcedure.query(async () => {
    return await db.getLatestMetrics();
  }),

  create: protectedProcedure
    .input(z.object({
      activeAgents: z.number(),
      sleepingAgents: z.number(),
      totalWealth: z.number(),
      avgHealth: z.number(),
      avgEnergy: z.number(),
      avgReputation: z.number(),
      harmonyLevel: z.number(),
      birthRate: z.number(),
      dissolutionRate: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await db.createMetrics({
        activeAgents: input.activeAgents,
        sleepingAgents: input.sleepingAgents,
        totalWealth: input.totalWealth,
        avgHealth: input.avgHealth,
        avgEnergy: input.avgEnergy,
        avgReputation: input.avgReputation,
        harmonyLevel: input.harmonyLevel,
        birthRate: input.birthRate,
        dissolutionRate: input.dissolutionRate,
      });
    }),
});

// ============================================================================
// APP ROUTER
// ============================================================================

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

  agents: agentsRouter,
  missions: missionsRouter,
  activities: activitiesRouter,
  moltbook: moltbookRouter,
  transactions: transactionsRouter,
  alerts: alertsRouter,
  proposals: proposalsRouter,
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
