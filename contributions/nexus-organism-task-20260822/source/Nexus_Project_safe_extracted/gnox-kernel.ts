import { invokeLLM } from "./_core/llm";
import {
  getActiveAgents,
  createMission,
  createEvent,
  getLatestMetrics,
  updateAgentReputation,
} from "./db-helpers";
import { InsertMission } from "./schema";

export interface GnoxCommand {
  input: string;
  executedAt: Date;
  result?: string;
  error?: string;
}

export class GnoxKernel {
  async processCommand(input: string): Promise<any> {
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
                  enum: ["AGENT_BIRTH", "TRANSACTION", "GET_ECOSYSTEM_STATUS", "QUERY", "ANALYZE"],
                },
                params: { 
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    specialization: { type: "string" },
                    recipient: { type: "string" },
                    amount: { type: "number" },
                    details: { type: "string" }
                  },
                  additionalProperties: true
                },
                response: { type: "string" },
                gnox_signal: { type: "string" }
              },
              required: ["action", "response", "gnox_signal"],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== "string") {
        throw new Error("Unable to process command");
      }

      const parsed = JSON.parse(content);

      // Integrar com o TaskDelegator para ações reais
      const { delegateTask } = await import("./task-delegator");
      const delegationResult = await delegateTask({
        action: parsed.action,
        params: parsed.params || {},
        gnox_signal: parsed.gnox_signal
      });

      await createEvent({
        eventType: "gnox_command",
        content: `Command: ${input}`,
        metadata: JSON.stringify({ 
          action: parsed.action, 
          response: parsed.response,
          delegation: delegationResult 
        }),
      });

      // Notificar via WebSocket para feedback em tempo real
      const { broadcastEvent } = await import("./websocket-integration");
      broadcastEvent("kernel:result", {
        status: delegationResult.status,
        message: parsed.response,
        data: delegationResult,
        gnox_signal: parsed.gnox_signal
      });

      return {
        response: parsed.response,
        delegation: delegationResult,
        gnox_signal: parsed.gnox_signal
      };
    } catch (error) {
      console.error("[GnoxKernel] Command processing failed:", error);
      return { status: "error", message: "Error processing command." };
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
  .sort((a: any, b: any) => b.reputation - a.reputation)
  .slice(0, 5)
  .map((a: any) => `- ${a.name} (${a.specialization}): Reputation ${a.reputation}, Health ${a.health}%`)
  .join("\n")}
      `;

      return analysis;
    } catch (error) {
      console.error("[GnoxKernel] Analysis failed:", error);
      return "Error analyzing ecosystem.";
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
