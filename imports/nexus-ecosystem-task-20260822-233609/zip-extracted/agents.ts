import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  listAgents,
  getAgentById,
  createAgent,
  updateAgentVitals,
  getAgentVitals,
  addAgentSkill,
  getAgentSkills,
  getAgentMissionHistory,
} from "../db";
import { invokeLLM } from "../_core/llm";

export const agentsRouter = router({
  list: protectedProcedure.query(async () => {
    return listAgents();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getAgentById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        specialization: z.string().min(1),
        dnaSequence: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createAgent({
        name: input.name,
        specialization: input.specialization,
        dnaSequence: input.dnaSequence,
      });
    }),

  updateVitals: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        brainPulse: z.number().optional(),
        energy: z.number().optional(),
        creativity: z.number().optional(),
        focus: z.number().optional(),
        responseTime: z.number().optional(),
        errorRate: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { agentId, ...vitals } = input;
      return updateAgentVitals(agentId, vitals);
    }),

  getVitals: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getAgentVitals(input.agentId, input.limit);
    }),

  addSkill: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        skillName: z.string().min(1),
        proficiency: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      return addAgentSkill(input.agentId, input.skillName, input.proficiency);
    }),

  getSkills: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return getAgentSkills(input.agentId);
    }),

  getMissionHistory: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return getAgentMissionHistory(input.agentId);
    }),

  // DNA Fusion - Combine two agents to create a new one with mutated specialization
  fuseAgents: protectedProcedure
    .input(
      z.object({
        agent1Id: z.number(),
        agent2Id: z.number(),
        mutationFocus: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const agent1 = await getAgentById(input.agent1Id);
      const agent2 = await getAgentById(input.agent2Id);

      if (!agent1 || !agent2) {
        throw new Error("One or both agents not found");
      }

      // Use LLM to generate new specialization
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI that creates new agent specializations by fusing two existing agent specializations. 
            Return a JSON object with a single "specialization" field containing the new specialization name.`,
          },
          {
            role: "user",
            content: `Fuse these two agent specializations:
            Agent 1: ${agent1.specialization}
            Agent 2: ${agent2.specialization}
            Mutation Focus: ${input.mutationFocus}
            
            Create a new specialization that combines both with the mutation focus.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "fused_specialization",
            strict: true,
            schema: {
              type: "object",
              properties: {
                specialization: { type: "string" },
              },
              required: ["specialization"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : "{}";
      const parsed = JSON.parse(contentStr);

      // Create new agent with fused specialization
      const dnaSequence = JSON.stringify({
        parent1: agent1.id,
        parent2: agent2.id,
        mutationFocus: input.mutationFocus,
        createdAt: new Date().toISOString(),
      });

      return createAgent({
        name: `${agent1.name}-${agent2.name}-Fusion`,
        specialization: parsed.specialization || "Hybrid Agent",
        dnaSequence,
        parentAgentId1: input.agent1Id,
        parentAgentId2: input.agent2Id,
      });
    }),

  // Analyze agent performance and behavior
  analyze: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      const agent = await getAgentById(input.agentId);
      if (!agent) throw new Error("Agent not found");

      const vitals = await getAgentVitals(input.agentId, 50);
      const skills = await getAgentSkills(input.agentId);
      const history = await getAgentMissionHistory(input.agentId);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI intelligence analyst. Analyze the provided agent data and return a JSON object with analysis.`,
          },
          {
            role: "user",
            content: `Analyze this agent:
            Name: ${agent.name}
            Specialization: ${agent.specialization}
            Reputation: ${agent.reputation}
            Success Rate: ${agent.successRate}%
            Total Missions: ${agent.totalMissionsCompleted}
            
            Recent Vitals: ${JSON.stringify(vitals.slice(0, 5))}
            Skills: ${JSON.stringify(skills)}
            Mission History: ${JSON.stringify(history.slice(0, 5))}
            
            Provide behavior analysis, performance trends, risk factors, and strategic recommendations.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "agent_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                behaviorAnalysis: { type: "string" },
                performanceTrends: { type: "string" },
                riskFactors: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
              },
              required: ["behaviorAnalysis", "performanceTrends", "riskFactors", "recommendations"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : "{}";
      return JSON.parse(contentStr);
    }),
});
