import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import {
  createMission,
  getMissionById,
  getAllMissions,
  updateMission,
  createAgent,
  getAgentById,
  getAllAgents,
  updateAgent,
  createTransaction,
  getTransactionsByAgent,
  saveCommandHistory,
  getCommandHistoryRecords,
} from "./db";
import type { CommandHistory, InsertCommandHistory } from "../drizzle/schema";

interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

interface ProcessedCommand {
  type: string;
  parameters: Record<string, unknown>;
}

interface CommandHistoryRecord extends CommandHistory {}

/**
 * GnoxTerminal - Natural Language Command Processor
 * Processes user commands in natural language and executes them via LLM interpretation
 */
export class GnoxTerminal {
  private commandRegistry: Map<string, (params: Record<string, unknown>) => Promise<CommandResult>>;
  private commandHistory: CommandHistoryRecord[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.commandRegistry = new Map();
    this.registerCommands();
  }

  /**
   * Register all available commands
   */
  private registerCommands(): void {
    // Mission commands
    this.commandRegistry.set("create_mission", this.createMissionHandler.bind(this));
    this.commandRegistry.set("list_missions", this.listMissionsHandler.bind(this));
    this.commandRegistry.set("complete_mission", this.completeMissionHandler.bind(this));
    this.commandRegistry.set("fail_mission", this.failMissionHandler.bind(this));

    // Agent commands
    this.commandRegistry.set("list_agents", this.listAgentsHandler.bind(this));
    this.commandRegistry.set("get_agent_info", this.getAgentInfoHandler.bind(this));
    this.commandRegistry.set("get_agent_report", this.getAgentReportHandler.bind(this));

    // Orchestration commands
    this.commandRegistry.set("orchestrate", this.orchestrateHandler.bind(this));
    this.commandRegistry.set("get_orchestration_stats", this.getOrchestrationStatsHandler.bind(this));

    // Reward commands
    this.commandRegistry.set("get_reward_stats", this.getRewardStatsHandler.bind(this));
    this.commandRegistry.set("get_transaction_history", this.getTransactionHistoryHandler.bind(this));

    // Metrics commands
    this.commandRegistry.set("get_dashboard", this.getDashboardHandler.bind(this));
    this.commandRegistry.set("get_mission_metrics", this.getMissionMetricsHandler.bind(this));

    // System commands
    this.commandRegistry.set("help", this.helpHandler.bind(this));
    this.commandRegistry.set("status", this.statusHandler.bind(this));
  }

  /**
   * Process natural language command via LLM
   */
  async processCommand(input: string, userId?: string): Promise<CommandHistoryRecord> {
    const commandId = nanoid();
    const timestamp = new Date();

    try {
      // Step 1: Interpret command via LLM
      const interpreted = await this.interpretCommand(input);

      // Step 2: Validate command exists
      if (!this.commandRegistry.has(interpreted.type)) {
        const record = await this.saveHistory({
          id: commandId,
          command: input,
          result: JSON.stringify({ error: `Unknown command: ${interpreted.type}` }),
          status: "error",
          userId,
          createdAt: timestamp,
        });
        return record || this.createLocalHistoryRecord(commandId, input, "error", userId);
      }

      // Step 3: Execute command
      const handler = this.commandRegistry.get(interpreted.type);
      if (!handler) {
        throw new Error(`Handler not found for command: ${interpreted.type}`);
      }

      const result = await handler(interpreted.parameters);

      // Step 4: Save to history
      const record = await this.saveHistory({
        id: commandId,
        command: input,
        result: JSON.stringify(result),
        status: result.success ? "success" : "error",
        userId,
        createdAt: timestamp,
      });

      return record || this.createLocalHistoryRecord(commandId, input, result.success ? "success" : "error", userId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const record = await this.saveHistory({
        id: commandId,
        command: input,
        result: JSON.stringify({ error: errorMessage }),
        status: "error",
        userId,
        createdAt: timestamp,
      });
      return record || this.createLocalHistoryRecord(commandId, input, "error", userId);
    }
  }

  /**
   * Interpret natural language command using LLM with JSON Schema
   */
  private async interpretCommand(input: string): Promise<ProcessedCommand> {
    const availableCommands = Array.from(this.commandRegistry.keys());
    const systemPrompt = `You are a command interpreter for the Gnox Terminal. Convert natural language commands into structured JSON commands.

Available commands: ${availableCommands.join(", ")}

Respond with a JSON object containing:
- type: the command name
- parameters: an object with command parameters`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "command",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "The command type",
              },
              parameters: {
                type: "object",
                description: "Command parameters",
                additionalProperties: true,
              },
            },
            required: ["type", "parameters"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      throw new Error("No response from LLM");
    }

    return JSON.parse(content) as ProcessedCommand;
  }

  /**
   * Mission command handlers
   */
  private async createMissionHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const mission = await createMission({
        id: nanoid(),
        title: (params.title as string) || "Untitled Mission",
        description: (params.description as string) || "",
        status: "pending",
        priority: (params.priority as number) || 0,
        reward: (params.reward as string) || "0",
        assignedAgentId: (params.assignedAgentId as string) || undefined,
      });

      return {
        success: true,
        data: mission,
        message: `Mission created: ${mission?.title}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create mission",
      };
    }
  }

  private async listMissionsHandler(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      return {
        success: true,
        data: {
          total: missions.length,
          missions,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list missions",
      };
    }
  }

  private async completeMissionHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const missionId = params.missionId as string;
      const mission = await updateMission(missionId, {
        status: "completed",
        completedAt: new Date(),
      });

      return {
        success: true,
        data: mission,
        message: `Mission completed: ${mission?.title}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete mission",
      };
    }
  }

  private async failMissionHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const missionId = params.missionId as string;
      const mission = await updateMission(missionId, {
        status: "failed",
      });

      return {
        success: true,
        data: mission,
        message: `Mission failed: ${mission?.title}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fail mission",
      };
    }
  }

  /**
   * Agent command handlers
   */
  private async listAgentsHandler(): Promise<CommandResult> {
    try {
      const agents = await getAllAgents();
      return {
        success: true,
        data: {
          total: agents.length,
          agents,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list agents",
      };
    }
  }

  private async getAgentInfoHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = params.agentId as string;
      const agent = await getAgentById(agentId);

      if (!agent) {
        return {
          success: false,
          error: `Agent not found: ${agentId}`,
        };
      }

      return {
        success: true,
        data: agent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get agent info",
      };
    }
  }

  private async getAgentReportHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = params.agentId as string;
      const agent = await getAgentById(agentId);

      if (!agent) {
        return {
          success: false,
          error: `Agent not found: ${agentId}`,
        };
      }

      const transactions = await getTransactionsByAgent(agentId);

      return {
        success: true,
        data: {
          agent,
          totalTransactions: transactions.length,
          totalRewards: transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get agent report",
      };
    }
  }

  /**
   * Orchestration command handlers
   */
  private async orchestrateHandler(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const agents = await getAllAgents();

      return {
        success: true,
        data: {
          message: "Orchestration initiated",
          missionsCount: missions.length,
          agentsCount: agents.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to orchestrate",
      };
    }
  }

  private async getOrchestrationStatsHandler(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const completedCount = missions.filter((m) => m.status === "completed").length;
      const failedCount = missions.filter((m) => m.status === "failed").length;
      const activeCount = missions.filter((m) => m.status === "active").length;

      return {
        success: true,
        data: {
          totalMissions: missions.length,
          completed: completedCount,
          failed: failedCount,
          active: activeCount,
          successRate: missions.length > 0 ? ((completedCount / missions.length) * 100).toFixed(2) : "0",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get orchestration stats",
      };
    }
  }

  /**
   * Reward command handlers
   */
  private async getRewardStatsHandler(): Promise<CommandResult> {
    try {
      const agents = await getAllAgents();
      const totalBalance = agents.reduce((sum, a) => sum + parseFloat(a.balance), 0);

      return {
        success: true,
        data: {
          totalAgents: agents.length,
          totalBalance,
          averageBalance: agents.length > 0 ? (totalBalance / agents.length).toFixed(2) : "0",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get reward stats",
      };
    }
  }

  private async getTransactionHistoryHandler(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = params.agentId as string;
      const transactions = await getTransactionsByAgent(agentId);

      return {
        success: true,
        data: {
          agentId,
          total: transactions.length,
          transactions,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get transaction history",
      };
    }
  }

  /**
   * Metrics command handlers
   */
  private async getDashboardHandler(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const agents = await getAllAgents();

      return {
        success: true,
        data: {
          missions: missions.length,
          agents: agents.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get dashboard",
      };
    }
  }

  private async getMissionMetricsHandler(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();

      return {
        success: true,
        data: {
          total: missions.length,
          byStatus: {
            pending: missions.filter((m) => m.status === "pending").length,
            active: missions.filter((m) => m.status === "active").length,
            completed: missions.filter((m) => m.status === "completed").length,
            failed: missions.filter((m) => m.status === "failed").length,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get mission metrics",
      };
    }
  }

  /**
   * System command handlers
   */
  private async helpHandler(): Promise<CommandResult> {
    const commands = Array.from(this.commandRegistry.keys());
    return {
      success: true,
      data: {
        availableCommands: commands,
        commandCount: commands.length,
      },
    };
  }

  private async statusHandler(): Promise<CommandResult> {
    return {
      success: true,
      data: {
        status: "operational",
        uptime: process.uptime(),
        commandsExecuted: this.commandHistory.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get command history
   */
  async getCommandHistory(limit: number = 100): Promise<CommandHistoryRecord[]> {
    const records = await getCommandHistoryRecords(limit);
    return records || this.commandHistory.slice(-limit);
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): string[] {
    return Array.from(this.commandRegistry.keys());
  }

  /**
   * Clear command history
   */
  async clearCommandHistory(): Promise<void> {
    this.commandHistory = [];
  }

  /**
   * Save command history to database
   */
  private async saveHistory(record: InsertCommandHistory): Promise<CommandHistoryRecord | null> {
    return await saveCommandHistory(record);
  }

  /**
   * Create local history record for fallback
   */
  private createLocalHistoryRecord(
    id: string,
    command: string,
    status: "success" | "error" | "pending",
    userId?: string
  ): CommandHistoryRecord {
    return {
      id,
      command,
      result: "" as string | null,
      status,
      userId: userId || null,
      createdAt: new Date(),
    };
  }
}

// Export singleton instance
export const gnoxTerminal = new GnoxTerminal();
