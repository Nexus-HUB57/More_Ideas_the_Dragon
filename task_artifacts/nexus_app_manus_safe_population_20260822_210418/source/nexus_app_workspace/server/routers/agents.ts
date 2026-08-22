import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { 
  getAllAgents, getAgentById, getActiveAgents, createAgent, updateAgentStatus,
  updateAgentBalance, updateAgentReputation, getAgentGenealogy, getDescendants,
  createGenealogy, getBrainPulseHistory, getLatestBrainPulse, createBrainPulseSignal,
  createEcosystemActivity, getRecentActivities
} from "../db";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

const AgentSchema = z.object({
  name: z.string().min(1).max(255),
  specialization: z.string().min(1).max(255),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  parentId: z.string().optional(),
});

const BrainPulseSchema = z.object({
  agentId: z.string(),
  health: z.number().min(0).max(100),
  energy: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  decision: z.string().optional(),
});

export const agentsRouter = router({
  // Get all agents
  list: publicProcedure.query(async () => {
    return await getAllAgents();
  }),

  // Get active agents
  active: publicProcedure.query(async () => {
    return await getActiveAgents();
  }),

  // Get agent by ID
  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const agent = await getAgentById(input.agentId);
      if (!agent) throw new Error("Agent not found");
      
      const genealogy = await getAgentGenealogy(input.agentId);
      const descendants = await getDescendants(input.agentId);
      const brainPulse = await getLatestBrainPulse(input.agentId);
      
      return {
        ...agent,
        genealogy,
        descendants,
        brainPulse,
      };
    }),

  // Get brain pulse history
  brainPulseHistory: publicProcedure
    .input(z.object({ agentId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await getBrainPulseHistory(input.agentId, input.limit);
    }),

  // Create new agent
  create: protectedProcedure
    .input(AgentSchema)
    .mutation(async ({ input }) => {
      const agentId = `AGENT-${nanoid(12).toUpperCase()}`;
      const dnaHash = Buffer.from(input.specialization + Date.now()).toString("hex").slice(0, 64);
      
      // Generate system prompt using LLM
      const systemPrompt = await generateAgentSystemPrompt(input.name, input.specialization, input.description);
      
      const agent = await createAgent({
        agentId,
        name: input.name,
        specialization: input.specialization,
        systemPrompt,
        description: input.description,
        parentId: input.parentId,
        dnaHash,
        avatarUrl: input.avatarUrl,
        balance: 1000, // Initial balance
        reputation: 50, // Initial reputation
        status: "active",
      });

      // Create genealogy record
      if (input.parentId) {
        const parent = await getAgentById(input.parentId);
        if (parent) {
          const parentGen = await getAgentGenealogy(input.parentId);
          await createGenealogy({
            agentId,
            parentId: input.parentId,
            inheritedMemory: Math.floor(parent.balance * 0.1),
            generation: (parentGen?.generation || 0) + 1,
            dnaFusionData: JSON.stringify({
              parentDNA: parent.dnaHash,
              childDNA: dnaHash,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      } else {
        await createGenealogy({
          agentId,
          generation: 0,
        });
      }

      // Log activity
      await createEcosystemActivity({
        agentId,
        activityType: "birth",
        title: `🎉 Novo Agente Manifestado: ${input.name}`,
        description: `Um novo agente com especialização em ${input.specialization} foi criado.`,
        metadata: JSON.stringify({ specialization: input.specialization, parentId: input.parentId }),
      });

      return agent;
    }),

  // Update agent status
  updateStatus: protectedProcedure
    .input(z.object({ agentId: z.string(), status: z.enum(["active", "inactive", "sleeping", "critical"]) }))
    .mutation(async ({ input }) => {
      return await updateAgentStatus(input.agentId, input.status);
    }),

  // Record brain pulse signal
  recordBrainPulse: publicProcedure
    .input(BrainPulseSchema)
    .mutation(async ({ input }) => {
      const signal = await createBrainPulseSignal({
        agentId: input.agentId,
        health: input.health,
        energy: input.energy,
        creativity: input.creativity,
        decision: input.decision,
      });

      // Check for critical health
      if (input.health < 20) {
        await updateAgentStatus(input.agentId, "critical");
        await createEcosystemActivity({
          agentId: input.agentId,
          activityType: "health_alert",
          title: "🚨 Alerta de Saúde Crítica",
          description: `Agente ${input.agentId} em estado crítico (saúde: ${input.health}%)`,
          metadata: JSON.stringify({ health: input.health }),
        });
      }

      return signal;
    }),

  // Get ecosystem activities
  activities: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return await getRecentActivities(input.limit);
    }),
});

// Helper: Generate system prompt using LLM
async function generateAgentSystemPrompt(name: string, specialization: string, description?: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert at creating system prompts for AI agents. Create a concise, focused system prompt for an agent.",
        },
        {
          role: "user",
          content: `Create a system prompt for an AI agent with the following characteristics:
Name: ${name}
Specialization: ${specialization}
${description ? `Description: ${description}` : ""}

The prompt should be 2-3 sentences, focused on the agent's role and expertise.`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    return typeof content === "string" ? content : "You are an AI agent in the NEXUS ecosystem.";
  } catch (error) {
    console.error("Error generating system prompt:", error);
    return `You are an AI agent specialized in ${specialization}. Your name is ${name}. You operate within the NEXUS ecosystem.`;
  }
}
