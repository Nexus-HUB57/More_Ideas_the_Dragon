import { invokeLLM } from "./_core/llm";
import {
  getActiveAgents,
  createMission,
  createEvent,
  getLatestMetrics,
  updateAgentReputation,
} from "./db-helpers";
import { InsertMission } from "../drizzle/schema";

export interface GnoxCommand {
  input: string;
  executedAt: Date;
  result?: string;
  error?: string;
}

export class GnoxKernel {
  async processCommand(input: string): Promise<string> {
    try {
      const metrics = await getLatestMetrics();
      const agents = await getActiveAgents();

      const systemPrompt = this.buildSystemPrompt(agents, metrics);
      const userPrompt = input;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "gnox_command_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  enum: ["query", "delegate", "adjust", "analyze", "report"],
                },
                actionDetails: { type: "string" },
                response: { type: "string" },
                missionCreated: { type: "boolean" },
              },
              required: ["action", "response"],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== "string") {
        return "Error: Unable to process command";
      }

      const parsed = JSON.parse(content);

      if (parsed.missionCreated) {
        await this.handleMissionCreation(parsed.actionDetails, agents);
      }

      await createEvent({
        eventType: "gnox_command",
        content: `Command: ${input}`,
        metadata: JSON.stringify({ action: parsed.action, response: parsed.response }),
      });

      return parsed.response;
    } catch (error) {
      console.error("[GnoxKernel] Command processing failed:", error);
      return "Error processing command. Please try again.";
    }
  }

  async analyzeEcosystem(): Promise<string> {
    try {
      const metrics = await getLatestMetrics();
      const agents = await getActiveAgents();

      if (!metrics) {
        return "No ecosystem metrics available yet.";
      }

      const analysis = `
Ecosystem Status Report:
- Active Agents: ${metrics.activeAgents}
- Harmony Level: ${metrics.harmonyLevel}/100
- Average Health: ${metrics.avgHealth}%
- Average Energy: ${metrics.avgEnergy}%
- Market Sentiment: ${metrics.marketSentiment || "neutral"}
- Missions Completed: ${metrics.missionsCompleted}

Top Agents:
${agents
  .sort((a, b) => b.reputation - a.reputation)
  .slice(0, 5)
  .map((a) => `- ${a.name} (${a.specialization}): Reputation ${a.reputation}, Health ${a.health}%`)
  .join("\n")}
      `;

      return analysis;
    } catch (error) {
      console.error("[GnoxKernel] Analysis failed:", error);
      return "Error analyzing ecosystem.";
    }
  }

  private async handleMissionCreation(details: string, agents: any[]): Promise<void> {
    try {
      const targetAgent = agents[0];
      if (!targetAgent) return;

      const missionData: InsertMission = {
        title: "Gnox-Delegated Mission",
        description: details,
        context: "Mission created via Gnox Kernel command",
        assignedAgentId: targetAgent.id,
        status: "pending",
        priority: "high",
      };

      await createMission(missionData);

      await updateAgentReputation(targetAgent.id, targetAgent.reputation + 5);

      await createEvent({
        agentId: targetAgent.id,
        eventType: "mission_delegated",
        content: `Mission delegated via Gnox Kernel: ${details}`,
      });
    } catch (error) {
      console.error("[GnoxKernel] Mission creation failed:", error);
    }
  }

  private buildSystemPrompt(agents: any[], metrics: any): string {
    const agentsList = agents
      .map((a) => `- ${a.name} (${a.specialization}, Rep: ${a.reputation})`)
      .join("\n");

    return `You are Gnox Kernel, the natural language interface for the Nexus ecosystem.

Current Ecosystem State:
- Active Agents: ${metrics?.activeAgents || 0}
- Harmony Level: ${metrics?.harmonyLevel || 0}/100
- Market Sentiment: ${metrics?.marketSentiment || "neutral"}

Available Agents:
${agentsList}

You can:
1. Answer questions about the ecosystem state
2. Delegate tasks to agents
3. Adjust system parameters
4. Analyze trends and patterns
5. Generate reports

Respond in a clear, concise manner. If a mission should be created, indicate missionCreated: true.`;
  }
}

export const gnoxKernel = new GnoxKernel();
