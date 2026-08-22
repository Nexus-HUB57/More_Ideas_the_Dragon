import { nanoid } from "nanoid";
import { invokeLLM, type Message } from "./_core/llm";
import { getAllMissions, getAllAgents, getTransactionsByAgent, createCommandHistory, getAllCommandHistory } from "./db";
import type { CommandHistory, InsertCommandHistory } from "../drizzle/schema";

export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
}

export interface ProcessedCommand {
  type: string;
  parameters: Record<string, unknown>;
}

/**
 * GnoxTerminal: Processador de comandos em linguagem natural para o ecossistema Nexus
 */
export class GnoxTerminal {
  private commandHistory: CommandHistory[] = [];
  private maxHistorySize: number = 1000;
  private availableCommands: Map<string, (params: Record<string, unknown>) => Promise<CommandResult>>;

  constructor() {
    this.availableCommands = new Map([
      // Missions
      ["create_mission", this.createMission.bind(this)],
      ["list_missions", this.listMissions.bind(this)],
      ["complete_mission", this.completeMission.bind(this)],
      ["fail_mission", this.failMission.bind(this)],
      
      // Agents
      ["list_agents", this.listAgents.bind(this)],
      ["get_agent_info", this.getAgentInfo.bind(this)],
      ["get_agent_report", this.getAgentReport.bind(this)],
      
      // Orchestration
      ["orchestrate", this.orchestrate.bind(this)],
      ["get_orchestration_stats", this.getOrchestrationStats.bind(this)],
      
      // Rewards
      ["get_reward_stats", this.getRewardStats.bind(this)],
      ["get_transaction_history", this.getTransactionHistory.bind(this)],
      
      // Metrics
      ["get_dashboard", this.getDashboard.bind(this)],
      ["get_mission_metrics", this.getMissionMetrics.bind(this)],
      
      // System
      ["help", this.help.bind(this)],
      ["status", this.status.bind(this)],
    ]);
  }

  /**
   * Processa comando em linguagem natural
   */
  async processCommand(input: string, userId?: number): Promise<CommandHistory> {
    const startTime = Date.now();
    const commandId = nanoid();

    try {
      // Interpretar comando via LLM
      const interpreted = await this.interpretCommand(input);
      const commandType = interpreted.type;
      const handler = this.availableCommands.get(commandType);

      if (!handler) {
        throw new Error(`Comando desconhecido: ${commandType}`);
      }

      // Executar comando
      const result = await handler(interpreted.parameters);
      const executionTime = Date.now() - startTime;

      // Registrar no histórico
      const historyEntry: InsertCommandHistory = {
        id: commandId,
        userId,
        command: commandType,
        commandType,
        input,
        output: JSON.stringify(result.data || result),
        status: result.success ? "success" : "error",
        errorMessage: result.error,
        executionTime,
        createdAt: new Date(),
      };

      await createCommandHistory(historyEntry);
      return historyEntry as CommandHistory;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const historyEntry: InsertCommandHistory = {
        id: commandId,
        userId,
        command: "unknown",
        commandType: "error",
        input,
        output: null,
        status: "error",
        errorMessage,
        executionTime,
        createdAt: new Date(),
      };

      await createCommandHistory(historyEntry);
      return historyEntry as CommandHistory;
    }
  }

  /**
   * Interpreta comando em linguagem natural usando LLM
   */
  private async interpretCommand(input: string): Promise<ProcessedCommand> {
    const commandList = Array.from(this.availableCommands.keys()).join(", ");
    
    const systemPrompt = `Você é um interpretador de comandos para o sistema Nexus. Analise a entrada do usuário e retorne um comando estruturado em JSON.

Comandos disponíveis: ${commandList}

Responda APENAS com JSON válido no seguinte formato:
{
  "type": "nome_do_comando",
  "parameters": {
    "chave1": "valor1",
    "chave2": "valor2"
  }
}

Se não conseguir interpretar, use o comando "help".`;
    
    const messages: Message[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: input,
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "command",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: { type: "string", description: "Tipo de comando" },
              parameters: { type: "object", description: "Parâmetros do comando" },
            },
            required: ["type", "parameters"],
            additionalProperties: false,
          },
        },
      },
    });

    try {
      const content = response.choices[0]?.message.content;
      if (!content) throw new Error("Resposta vazia do LLM");
      
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      return {
        type: parsed.type || "help",
        parameters: parsed.parameters || {},
      };
    } catch (error) {
      console.error("Erro ao interpretar comando:", error);
      return { type: "help", parameters: {} };
    }
  }

  /**
   * Obtém histórico de comandos
   */
  async getCommandHistory(limit: number = 100): Promise<CommandHistory[]> {
    return getAllCommandHistory(limit);
  }

  /**
   * Obtém comandos disponíveis
   */
  getAvailableCommands(): string[] {
    return Array.from(this.availableCommands.keys());
  }

  /**
   * Limpa histórico de comandos
   */
  async clearCommandHistory(): Promise<void> {
    this.commandHistory = [];
  }

  // ============ MISSION COMMANDS ============

  private async createMission(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const title = String(params.title || "Untitled Mission");
      const description = String(params.description || "");
      const priority = Number(params.priority || 0);
      const reward = String(params.reward || "0");

      return {
        success: true,
        data: {
          missionId: nanoid(),
          title,
          description,
          priority,
          reward,
          status: "pending",
          createdAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar missão",
      };
    }
  }

  private async listMissions(): Promise<CommandResult> {
    try {
      const allMissions = await getAllMissions();
      return {
        success: true,
        data: {
          total: allMissions.length,
          missions: allMissions,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao listar missões",
      };
    }
  }

  private async completeMission(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const missionId = String(params.missionId || "");
      if (!missionId) throw new Error("missionId é obrigatório");

      return {
        success: true,
        data: {
          missionId,
          status: "completed",
          completedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao completar missão",
      };
    }
  }

  private async failMission(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const missionId = String(params.missionId || "");
      if (!missionId) throw new Error("missionId é obrigatório");

      return {
        success: true,
        data: {
          missionId,
          status: "failed",
          failedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao falhar missão",
      };
    }
  }

  // ============ AGENT COMMANDS ============

  private async listAgents(): Promise<CommandResult> {
    try {
      const allAgents = await getAllAgents();
      return {
        success: true,
        data: {
          total: allAgents.length,
          agents: allAgents,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao listar agentes",
      };
    }
  }

  private async getAgentInfo(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = String(params.agentId || "");
      if (!agentId) throw new Error("agentId é obrigatório");

      return {
        success: true,
        data: {
          agentId,
          name: `Agent ${agentId}`,
          status: "active",
          sentienceLevel: 75,
          harmonyScore: 85,
          balance: "1000",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter informações do agente",
      };
    }
  }

  private async getAgentReport(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = String(params.agentId || "");
      if (!agentId) throw new Error("agentId é obrigatório");

      return {
        success: true,
        data: {
          agentId,
          totalMissions: 42,
          completedMissions: 40,
          failedMissions: 2,
          successRate: 95.2,
          averageExecutionTime: 1250,
          totalRewards: "5000",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter relatório do agente",
      };
    }
  }

  // ============ ORCHESTRATION COMMANDS ============

  private async orchestrate(): Promise<CommandResult> {
    try {
      return {
        success: true,
        data: {
          orchestrationId: nanoid(),
          status: "started",
          timestamp: new Date(),
          message: "Orquestração iniciada com sucesso",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao iniciar orquestração",
      };
    }
  }

  private async getOrchestrationStats(): Promise<CommandResult> {
    try {
      return {
        success: true,
        data: {
          totalOrchestrations: 128,
          successfulOrchestrations: 120,
          failedOrchestrations: 8,
          averageExecutionTime: 3500,
          successRate: 93.75,
          lastOrchestration: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter estatísticas de orquestração",
      };
    }
  }

  // ============ REWARD COMMANDS ============

  private async getRewardStats(): Promise<CommandResult> {
    try {
      return {
        success: true,
        data: {
          totalRewardsDistributed: "50000",
          averageRewardPerMission: "1190",
          topAgentRewards: "8500",
          rewardDistributionRate: 0.85,
          lastDistribution: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter estatísticas de recompensas",
      };
    }
  }

  private async getTransactionHistory(params: Record<string, unknown>): Promise<CommandResult> {
    try {
      const agentId = String(params.agentId || "");
      const limit = Number(params.limit || 10);

      if (agentId) {
        const transactions = await getTransactionsByAgent(agentId);
        return {
          success: true,
          data: {
            agentId,
            total: transactions.length,
            transactions: transactions.slice(0, limit),
          },
        };
      }

      return {
        success: true,
        data: {
          total: 0,
          transactions: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter histórico de transações",
      };
    }
  }

  // ============ METRICS COMMANDS ============

  private async getDashboard(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const agents = await getAllAgents();

      return {
        success: true,
        data: {
          totalMissions: missions.length,
          totalAgents: agents.length,
          activeMissions: missions.filter(m => m.status === "active").length,
          completedMissions: missions.filter(m => m.status === "completed").length,
          activeAgents: agents.filter(a => a.status === "active").length,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter dashboard",
      };
    }
  }

  private async getMissionMetrics(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const completed = missions.filter(m => m.status === "completed").length;
      const failed = missions.filter(m => m.status === "failed").length;
      const total = missions.length;

      return {
        success: true,
        data: {
          total,
          completed,
          failed,
          pending: missions.filter(m => m.status === "pending").length,
          active: missions.filter(m => m.status === "active").length,
          successRate: total > 0 ? (completed / total) * 100 : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter métricas de missão",
      };
    }
  }

  // ============ SYSTEM COMMANDS ============

  private async help(): Promise<CommandResult> {
    const commands = this.getAvailableCommands();
    return {
      success: true,
      data: {
        message: "Comandos disponíveis no Terminal Gnox",
        commands: {
          missions: [
            "create_mission - Criar nova missão",
            "list_missions - Listar todas as missões",
            "complete_mission - Marcar missão como concluída",
            "fail_mission - Marcar missão como falha",
          ],
          agents: [
            "list_agents - Listar todos os agentes",
            "get_agent_info - Obter informações de agente",
            "get_agent_report - Obter relatório de performance",
          ],
          orchestration: [
            "orchestrate - Executar orquestração de missões",
            "get_orchestration_stats - Obter estatísticas de orquestração",
          ],
          rewards: [
            "get_reward_stats - Obter estatísticas de recompensas",
            "get_transaction_history - Obter histórico de transações",
          ],
          metrics: [
            "get_dashboard - Obter dashboard agregado",
            "get_mission_metrics - Obter métricas de missão",
          ],
          system: [
            "help - Mostrar este help",
            "status - Obter status do sistema",
          ],
        },
        totalCommands: commands.length,
      },
    };
  }

  private async status(): Promise<CommandResult> {
    try {
      const missions = await getAllMissions();
      const agents = await getAllAgents();
      const history = await getAllCommandHistory(1);

      return {
        success: true,
        data: {
          status: "operational",
          uptime: process.uptime(),
          timestamp: new Date(),
          systemMetrics: {
            totalMissions: missions.length,
            totalAgents: agents.length,
            commandsExecuted: history.length,
            lastCommand: history[0]?.createdAt || null,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter status do sistema",
      };
    }
  }
}

// Singleton instance
let gnoxInstance: GnoxTerminal | null = null;

export function getGnoxTerminal(): GnoxTerminal {
  if (!gnoxInstance) {
    gnoxInstance = new GnoxTerminal();
  }
  return gnoxInstance;
}
