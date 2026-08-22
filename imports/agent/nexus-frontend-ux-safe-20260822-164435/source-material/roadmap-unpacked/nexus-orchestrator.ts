import { invokeLLM } from "./_core/llm";
import {
  createMission,
  getActiveAgents,
  createEvent,
  createAlert,
  getLatestMetrics,
} from "./db-helpers";
import { InsertMission } from "../drizzle/schema";

export interface MissionContext {
  marketSentiment: "bullish" | "neutral" | "bearish";
  harmonyLevel: number;
  activeAgents: number;
  recentPriceChanges: Record<string, number>;
  systemHealth: number;
}

export class NexusOrchestrator {
  async generateMissions(context: MissionContext): Promise<void> {
    try {
      const agents = await getActiveAgents();
      if (agents.length === 0) {
        console.log("[NexusOrchestrator] No active agents available");
        return;
      }

      const systemPrompt = this.buildSystemPrompt(context, agents);
      const userPrompt = this.buildUserPrompt(context);

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mission_generation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                missions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: {
                        type: "string",
                        enum: ["low", "medium", "high", "critical"],
                      },
                      targetSpecialization: { type: "string" },
                      reasoning: { type: "string" },
                    },
                    required: [
                      "title",
                      "description",
                      "priority",
                      "targetSpecialization",
                      "reasoning",
                    ],
                  },
                },
              },
              required: ["missions"],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== "string") {
        console.error("[NexusOrchestrator] Empty LLM response");
        return;
      }

      const parsed = JSON.parse(content);
      const missions = parsed.missions || [];

      for (const mission of missions) {
        const targetAgent = agents.find(
          (a) => a.specialization === mission.targetSpecialization
        ) || agents[0];

        const missionData: InsertMission = {
          title: mission.title,
          description: mission.description,
          context: mission.reasoning,
          assignedAgentId: targetAgent.id,
          status: "pending",
          priority: mission.priority,
        };

        await createMission(missionData);

        await createEvent({
          agentId: targetAgent.id,
          eventType: "mission_assigned",
          content: `Mission assigned: ${mission.title}`,
          metadata: JSON.stringify({ priority: mission.priority }) || undefined,
        });
      }

      console.log(`[NexusOrchestrator] Generated ${missions.length} missions`);
    } catch (error) {
      console.error("[NexusOrchestrator] Mission generation failed:", error);
      throw error;
    }
  }

  async analyzeMissionPerformance(): Promise<number> {
    try {
      const metrics = await getLatestMetrics();
      if (!metrics) {
        return 50;
      }

      const baseHarmony = metrics.harmonyLevel || 50;
      const healthFactor = metrics.avgHealth / 100;
      const agentFactor = Math.min(metrics.activeAgents / 10, 1);

      let newHarmony = baseHarmony * 0.7 + (healthFactor * 100) * 0.2 + (agentFactor * 100) * 0.1;
      newHarmony = Math.max(0, Math.min(100, newHarmony));

      return Math.round(newHarmony);
    } catch (error) {
      console.error("[NexusOrchestrator] Performance analysis failed:", error);
      return 50;
    }
  }

  async detectMarketOpportunities(context: MissionContext): Promise<void> {
    try {
      if (context.marketSentiment === "bullish" && context.harmonyLevel > 70) {
        await createAlert({
          title: "Market Opportunity Detected",
          message: "Bullish market sentiment with high ecosystem harmony. Consider aggressive strategies.",
          severity: "info",
          type: "market_opportunity",
          isRead: 0,
        });
      } else if (context.marketSentiment === "bearish" && context.harmonyLevel < 40) {
        await createAlert({
          title: "Critical Market Downturn",
          message: "Bearish sentiment combined with low harmony. Recommend defensive positioning.",
          severity: "critical",
          type: "market_downturn",
          isRead: 0,
        });
      }
    } catch (error) {
      console.error("[NexusOrchestrator] Opportunity detection failed:", error);
    }
  }

  private buildSystemPrompt(context: MissionContext, agents: any[]): string {
    const agentsList = agents
      .map((a) => `- ${a.name} (${a.specialization}, Health: ${a.health}, Energy: ${a.energy})`)
      .join("\n");

    return `You are the Nexus Orchestrator, an intelligent mission coordinator for an autonomous agent ecosystem.

Current Ecosystem State:
- Market Sentiment: ${context.marketSentiment}
- Harmony Level: ${context.harmonyLevel}/100
- Active Agents: ${context.activeAgents}
- System Health: ${context.systemHealth}/100

Available Agents:
${agentsList}

Your role is to generate contextual, meaningful missions that:
1. Leverage current market conditions
2. Distribute work fairly among agents
3. Improve ecosystem harmony and health
4. Consider agent specializations and current state

Generate 1-3 missions that are relevant, achievable, and beneficial for the ecosystem.`;
  }

  private buildUserPrompt(context: MissionContext): string {
    const priceChanges = Object.entries(context.recentPriceChanges)
      .map(([symbol, change]) => `${symbol}: ${change > 0 ? "+" : ""}${change.toFixed(2)}%`)
      .join(", ");

    return `Based on the current market conditions (${priceChanges}) and ecosystem state, generate appropriate missions for the agents.

Consider:
- The ${context.marketSentiment} market sentiment
- Current harmony level of ${context.harmonyLevel}/100
- Recent price movements: ${priceChanges}

Return a JSON object with an array of missions.`;
  }
}

export const nexusOrchestrator = new NexusOrchestrator();
