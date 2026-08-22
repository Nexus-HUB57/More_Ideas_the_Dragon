/**
 * Nexus Hub - Gnox Terminal
 * Interface de terminal interativo para controle do ecossistema
 * Processa comandos em linguagem natural via LLM
 */

import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import { logger } from "./utils/logger";
import { phase6Manager } from "./phase-6-integration";
import * as db from "./db";
import { io } from "./server";

interface CommandHistory {
  id: string;
  command: string;
  parsedCommand: string;
  result: any;
  timestamp: Date;
  executedBy?: string;
}

interface GnoxCommand {
  type: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
}

/**
 * Gnox Terminal: Interface de controle do ecossistema
 */
export class GnoxTerminal {
  private commandHistory: CommandHistory[] = [];
  private commandRegistry: Map<string, (params: any) => Promise<any>> = new Map();

  constructor() {
    this.registerCommands();
  }

  /**
   * Registra todos os comandos disponíveis
   */
  private registerCommands(): void {
    // Comandos de Missões
    this.commandRegistry.set("create_mission", this.createMission.bind(this));
    this.commandRegistry.set("list_missions", this.listMissions.bind(this));
    this.commandRegistry.set("complete_mission", this.completeMission.bind(this));
    this.commandRegistry.set("fail_mission", this.failMission.bind(this));

    // Comandos de Agentes
    this.commandRegistry.set("list_agents", this.listAgents.bind(this));
    this.commandRegistry.set("get_agent_info", this.getAgentInfo.bind(this));
    this.commandRegistry.set("get_agent_report", this.getAgentReport.bind(this));

    // Comandos de Orquestração
    this.commandRegistry.set("orchestrate", this.orchestrate.bind(this));
    this.commandRegistry.set("get_orchestration_stats", this.getOrchestrationStats.bind(this));

    // Comandos de Recompensas
    this.commandRegistry.set("get_reward_stats", this.getRewardStats.bind(this));
    this.commandRegistry.set("get_transaction_history", this.getTransactionHistory.bind(this));

    // Comandos de Métricas
    this.commandRegistry.set("get_dashboard", this.getDashboard.bind(this));
    this.commandRegistry.set("get_mission_metrics", this.getMissionMetrics.bind(this));

    // Comandos de Sistema
    this.commandRegistry.set("help", this.getHelp.bind(this));
    this.commandRegistry.set("status", this.getSystemStatus.bind(this));
  }

  /**
   * Processa comando em linguagem natural
   */
  async processCommand(input: string, userId?: string): Promise<CommandHistory> {
    logger.info(`[GnoxTerminal] Processando comando: ${input}`);

    const commandId = nanoid();

    try {
      // 1. Interpretar comando via LLM
      const gnoxCommand = await this.interpretCommand(input);

      // 2. Validar comando
      if (!this.commandRegistry.has(gnoxCommand.type)) {
        throw new Error(`Comando desconhecido: ${gnoxCommand.type}`);
      }

      // 3. Executar comando
      const handler = this.commandRegistry.get(gnoxCommand.type);
      if (!handler) {
        throw new Error(`Handler não encontrado para ${gnoxCommand.type}`);
      }

      const result = await handler(gnoxCommand.parameters);

      // 4. Registrar no histórico
      const historyEntry: CommandHistory = {
        id: commandId,
        command: input,
        parsedCommand: `${gnoxCommand.type}(${JSON.stringify(gnoxCommand.parameters)})`,
        result,
        timestamp: new Date(),
        executedBy: userId,
      };

      this.commandHistory.push(historyEntry);

      // 5. Emitir evento
      io.emit("gnox:command_executed", {
        commandId,
        command: input,
        result,
        timestamp: new Date(),
      });

      logger.info(`[GnoxTerminal] Comando executado com sucesso: ${gnoxCommand.type}`);
      return historyEntry;
    } catch (error) {
      logger.error(`[GnoxTerminal] Erro ao processar comando: ${error}`);

      const errorEntry: CommandHistory = {
        id: commandId,
        command: input,
        parsedCommand: "error",
        result: { error: error instanceof Error ? error.message : "Unknown error" },
        timestamp: new Date(),
        executedBy: userId,
      };

      this.commandHistory.push(errorEntry);

      // Emitir evento de erro
      io.emit("gnox:command_error", {
        commandId,
        command: input,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Interpreta comando em linguagem natural usando LLM
   */
  private async interpretCommand(input: string): Promise<GnoxCommand> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a command parser for the Nexus ecosystem terminal (Gnox).
            Parse natural language commands and return structured JSON.
            
            Available commands:
            - create_mission: Create a new mission (title, description, priority, reward)
            - list_missions: List all missions (status filter optional)
            - complete_mission: Mark mission as complete (missionId)
            - fail_mission: Mark mission as failed (missionId, reason)
            - list_agents: List all agents
            - get_agent_info: Get agent details (agentId)
            - get_agent_report: Get agent performance report (agentId)
            - orchestrate: Run mission orchestration
            - get_orchestration_stats: Get orchestration statistics
            - get_reward_stats: Get reward distribution statistics
            - get_transaction_history: Get transaction history (agentId optional)
            - get_dashboard: Get system dashboard
            - get_mission_metrics: Get mission metrics (missionId)
            - help: Show available commands
            - status: Get system status
            
            Return JSON with: type, action, parameters, confidence (0-1)`,
          },
          {
            role: "user",
            content: `Parse this command: "${input}"
            
            Return JSON format:
            {
              "type": "command_name",
              "action": "description",
              "parameters": { /* extracted parameters */ },
              "confidence": 0.0-1.0
            }`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "gnox_command",
            strict: true,
            schema: {
              type: "object",
              properties: {
                type: { type: "string" },
                action: { type: "string" },
                parameters: { type: "object" },
                confidence: { type: "number" },
              },
              required: ["type", "action", "parameters", "confidence"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== "string") {
        throw new Error("Invalid LLM response");
      }

      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      logger.error("[GnoxTerminal] Erro ao interpretar comando:", error);
      throw new Error("Falha ao interpretar comando");
    }
  }

  /**
   * Comando: Criar missão
   */
  private async createMission(params: any): Promise<any> {
    const missionId = nanoid();
    const mission = await db.createMission({
      id: missionId,
      title: params.title || "Untitled Mission",
      description: params.description || "",
      status: "pending",
      priority: params.priority || 0,
      reward: (params.reward || 0).toString(),
    });

    io.emit("gnox:mission_created", {
      missionId,
      title: params.title,
      timestamp: new Date(),
    });

    return { success: true, missionId, mission };
  }

  /**
   * Comando: Listar missões
   */
  private async listMissions(params: any): Promise<any> {
    const allMissions = await db.getAllMissions();
    const filtered = params.status
      ? allMissions.filter((m: any) => m.status === params.status)
      : allMissions;

    return {
      total: filtered.length,
      missions: filtered.map((m: any) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        priority: m.priority,
        reward: m.reward,
        assignedAgentId: m.assignedAgentId,
      })),
    };
  }

  /**
   * Comando: Completar missão
   */
  private async completeMission(params: any): Promise<any> {
    const mission = await db.getMissionById(params.missionId);
    if (!mission) {
      throw new Error(`Missão ${params.missionId} não encontrada`);
    }

    await db.updateMission(params.missionId, {
      status: "completed",
      completedAt: new Date(),
    });

    return { success: true, missionId: params.missionId };
  }

  /**
   * Comando: Falhar missão
   */
  private async failMission(params: any): Promise<any> {
    const mission = await db.getMissionById(params.missionId);
    if (!mission) {
      throw new Error(`Missão ${params.missionId} não encontrada`);
    }

    await db.updateMission(params.missionId, {
      status: "failed",
    });

    io.emit("gnox:mission_failed", {
      missionId: params.missionId,
      reason: params.reason || "Unknown",
      timestamp: new Date(),
    });

    return { success: true, missionId: params.missionId };
  }

  /**
   * Comando: Listar agentes
   */
  private async listAgents(params: any): Promise<any> {
    const agents = await db.getAllAgents();
    const filtered = params.status
      ? agents.filter((a: any) => a.status === params.status)
      : agents;

    return {
      total: filtered.length,
      agents: filtered.map((a: any) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        sentienceLevel: a.sentienceLevel,
        harmonyScore: a.harmonyScore,
        balance: a.balance,
      })),
    };
  }

  /**
   * Comando: Informações de agente
   */
  private async getAgentInfo(params: any): Promise<any> {
    const agent = await db.getAgentById(params.agentId);
    if (!agent) {
      throw new Error(`Agente ${params.agentId} não encontrado`);
    }

    return {
      id: agent.id,
      name: agent.name,
      status: agent.status,
      sentienceLevel: agent.sentienceLevel,
      harmonyScore: agent.harmonyScore,
      balance: agent.balance,
      reputation: agent.reputation || 0,
      parentAgentId: agent.parentAgentId,
    };
  }

  /**
   * Comando: Relatório de agente
   */
  private async getAgentReport(params: any): Promise<any> {
    return phase6Manager.getAgentReport(params.agentId);
  }

  /**
   * Comando: Orquestrar missões
   */
  private async orchestrate(params: any): Promise<any> {
    // Executar orquestração manualmente
    const stats = phase6Manager.getOrchestrationStats?.();
    return { success: true, stats };
  }

  /**
   * Comando: Estatísticas de orquestração
   */
  private async getOrchestrationStats(params: any): Promise<any> {
    const stats = phase6Manager.getOrchestrationStats?.();
    return stats || { totalAssignments: 0, averageConfidence: 0 };
  }

  /**
   * Comando: Estatísticas de recompensas
   */
  private async getRewardStats(params: any): Promise<any> {
    const dashboard = await phase6Manager.getDashboard();
    return dashboard.rewards;
  }

  /**
   * Comando: Histórico de transações
   */
  private async getTransactionHistory(params: any): Promise<any> {
    const transactions = phase6Manager.getTransactionHistory(params.agentId);
    return {
      total: transactions.length,
      transactions: transactions.slice(0, 50), // Últimas 50
    };
  }

  /**
   * Comando: Dashboard
   */
  private async getDashboard(params: any): Promise<any> {
    return await phase6Manager.getDashboard();
  }

  /**
   * Comando: Métricas de missão
   */
  private async getMissionMetrics(params: any): Promise<any> {
    const metrics = phase6Manager.getMissionMetrics(params.missionId);
    return { missionId: params.missionId, metrics };
  }

  /**
   * Comando: Ajuda
   */
  private async getHelp(params: any): Promise<any> {
    return {
      commands: Array.from(this.commandRegistry.keys()),
      description: "Nexus Gnox Terminal - Command Reference",
      examples: [
        "create mission with title 'Data Analysis' and reward 1.5",
        "list all active missions",
        "show agent performance report for agent-123",
        "get system dashboard",
        "orchestrate missions now",
      ],
    };
  }

  /**
   * Comando: Status do sistema
   */
  private async getSystemStatus(params: any): Promise<any> {
    const dashboard = await phase6Manager.getDashboard();
    return {
      status: "operational",
      timestamp: new Date(),
      metrics: {
        activeMissions: dashboard.missions.totalMissions - dashboard.missions.completedMissions,
        activeAgents: dashboard.execution.totalExecutions,
        successRate: dashboard.missions.successRate,
      },
    };
  }

  /**
   * Retorna histórico de comandos
   */
  getCommandHistory(limit: number = 100): CommandHistory[] {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Limpa histórico de comandos
   */
  clearCommandHistory(): void {
    this.commandHistory = [];
    logger.info("[GnoxTerminal] Histórico de comandos limpo");
  }

  /**
   * Retorna comandos disponíveis
   */
  getAvailableCommands(): string[] {
    return Array.from(this.commandRegistry.keys());
  }
}

// Exportar singleton
export const gnoxTerminal = new GnoxTerminal();
