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