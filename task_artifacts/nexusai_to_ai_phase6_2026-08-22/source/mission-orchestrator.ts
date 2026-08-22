/**
 * Nexus Hub - Mission Orchestrator
 * Sistema inteligente de orquestração de missões autônomas
 * Distribui tarefas para agentes baseado em capacidades, disponibilidade e histórico
 */

import { nanoid } from "nanoid";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { logger } from "./utils/logger";
import { io } from "./server";

interface MissionAssignment {
  missionId: string;
  agentId: string;
  assignedAt: Date;
  estimatedCompletionTime: number; // em minutos
  confidenceScore: number;
  reasoning: string;
}

interface AgentCapability {
  agentId: string;
  name: string;
  status: string;
  sentienceLevel: number;
  harmonyScore: number;
  balance: number;
  reputation: number;
  specializations: string[];
  activeTaskCount: number;
  successRate: number;
  averageCompletionTime: number;
}

interface MissionEvaluation {
  missionId: string;
  title: string;
  priority: number;
  requiredSpecializations: string[];
  estimatedDifficulty: number;
  estimatedReward: number;
  urgency: number;
}

/**
 * Mission Orchestrator: Distribui missões para agentes de forma otimizada
 */
export class MissionOrchestrator {
  private assignmentHistory: MissionAssignment[] = [];

  /**
   * Processa todas as missões abertas e distribui para agentes adequados
   */
  async orchestrateMissions(): Promise<MissionAssignment[]> {
    logger.info("[MissionOrchestrator] Iniciando orquestração de missões...");

    try {
      // 1. Buscar todas as missões abertas
      const openMissions = await db.getAllMissions();
      const unassignedMissions = openMissions.filter(m => !m.assignedAgentId && m.status === "pending");

      if (unassignedMissions.length === 0) {
        logger.info("[MissionOrchestrator] Nenhuma missão aberta para orquestração.");
        return [];
      }

      logger.info(`[MissionOrchestrator] ${unassignedMissions.length} missões abertas encontradas.`);

      // 2. Buscar todos os agentes ativos
      const allAgents = await db.getAllAgents();
      const activeAgents = allAgents.filter(a => a.status === "active" || a.status === "genesis");

      if (activeAgents.length === 0) {
        logger.warn("[MissionOrchestrator] Nenhum agente ativo disponível.");
        return [];
      }

      // 3. Avaliar capacidades dos agentes
      const agentCapabilities = await this.evaluateAgentCapabilities(activeAgents);

      // 4. Para cada missão aberta, encontrar o melhor agente
      const assignments: MissionAssignment[] = [];

      for (const mission of unassignedMissions) {
        const missionEval = await this.evaluateMission(mission);
        const bestAgent = await this.findBestAgent(missionEval, agentCapabilities, assignments);

        if (bestAgent) {
          const assignment = await this.assignMission(mission, bestAgent, missionEval);
          assignments.push(assignment);

          // Emitir evento de atribuição
          io.emit("mission:assigned", {
            missionId: mission.id,
            agentId: bestAgent.agentId,
            agentName: bestAgent.name,
            missionTitle: mission.title,
            timestamp: new Date(),
          });
        } else {
          logger.warn(`[MissionOrchestrator] Nenhum agente adequado encontrado para missão ${mission.id}`);
        }
      }

      logger.info(`[MissionOrchestrator] ${assignments.length} missões atribuídas com sucesso.`);
      return assignments;
    } catch (error) {
      logger.error("[MissionOrchestrator] Erro durante orquestração:", error);
      throw error;
    }
  }

  /**
   * Avalia as capacidades de cada agente
   */
  private async evaluateAgentCapabilities(agents: any[]): Promise<AgentCapability[]> {
    const capabilities: AgentCapability[] = [];

    for (const agent of agents) {
      try {
        // Buscar histórico de missões do agente
        const agentMissions = await db.getMissionsByAgent(agent.id);
        const completedMissions = agentMissions.filter(m => m.status === "completed");
        const activeMissions = agentMissions.filter(m => m.status === "active");

        // Calcular taxa de sucesso
        const successRate = agentMissions.length > 0 
          ? completedMissions.length / agentMissions.length 
          : 0.5; // Padrão para agentes sem histórico

        // Calcular tempo médio de conclusão
        const completionTimes = completedMissions
          .map(m => {
            if (m.createdAt && m.completedAt) {
              return (new Date(m.completedAt).getTime() - new Date(m.createdAt).getTime()) / (1000 * 60);
            }
            return 0;
          })
          .filter(t => t > 0);

        const averageCompletionTime = completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b) / completionTimes.length
          : 60; // Padrão: 60 minutos

        capabilities.push({
          agentId: agent.id,
          name: agent.name,
          status: agent.status,
          sentienceLevel: parseFloat(agent.sentienceLevel || "0"),
          harmonyScore: parseFloat(agent.harmonyScore || "50"),
          balance: parseFloat(agent.balance || "0"),
          reputation: agent.reputation || 0,
          specializations: agent.specialization || [],
          activeTaskCount: activeMissions.length,
          successRate,
          averageCompletionTime,
        });
      } catch (error) {
        logger.error(`[MissionOrchestrator] Erro ao avaliar agente ${agent.id}:`, error);
      }
    }

    return capabilities;
  }

  /**
   * Avalia uma missão para determinar dificuldade, urgência e requisitos
   */
  private async evaluateMission(mission: any): Promise<MissionEvaluation> {
    const titleWords = mission.title.toLowerCase().split(" ");
    const descriptionLength = mission.description?.length || 0;

    // Estimativa simples de dificuldade baseada em descrição
    const estimatedDifficulty = Math.min(
      (descriptionLength / 500) * 100,
      100
    );

    // Urgência baseada em prioridade
    const urgency = (mission.priority || 0) * 20;

    return {
      missionId: mission.id,
      title: mission.title,
      priority: mission.priority || 0,
      requiredSpecializations: this.extractSpecializations(mission.title, mission.description),
      estimatedDifficulty,
      estimatedReward: parseFloat(mission.reward || "0"),
      urgency,
    };
  }

  /**
   * Extrai especializações necessárias da missão
   */
  private extractSpecializations(title: string, description: string = ""): string[] {
    const text = (title + " " + description).toLowerCase();
    const specializations: string[] = [];

    const keywords: Record<string, string> = {
      "data": "data_analysis",
      "análise": "data_analysis",
      "design": "design",
      "desenvolvimento": "development",
      "código": "development",
      "marketing": "marketing",
      "comunicação": "communication",
      "segurança": "security",
      "teste": "testing",
      "documentação": "documentation",
      "pesquisa": "research",
      "estratégia": "strategy",
    };

    for (const [keyword, specialization] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        specializations.push(specialization);
      }
    }

    return specializations.length > 0 ? specializations : ["general"];
  }

  /**
   * Encontra o melhor agente para uma missão
   */
  private async findBestAgent(
    mission: MissionEvaluation,
    capabilities: AgentCapability[],
    currentAssignments: MissionAssignment[]
  ): Promise<AgentCapability | null> {
    // Filtrar agentes com capacidade de trabalho
    const availableAgents = capabilities.filter(agent => {
      // Não atribuir muitas missões ao mesmo agente
      const assignedCount = currentAssignments.filter(a => a.agentId === agent.agentId).length;
      return agent.activeTaskCount + assignedCount < 3 && agent.balance > 0;
    });

    if (availableAgents.length === 0) {
      return null;
    }

    // Calcular score para cada agente
    const scoredAgents = availableAgents.map(agent => {
      let score = 0;

      // 1. Compatibilidade de especialização (30%)
      const hasRequiredSpecialization = mission.requiredSpecializations.some(spec =>
        agent.specializations.includes(spec)
      );
      score += hasRequiredSpecialization ? 30 : 10;

      // 2. Taxa de sucesso (25%)
      score += agent.successRate * 25;

      // 3. Nível de senciência (20%)
      score += (agent.sentienceLevel / 100) * 20;

      // 4. Harmonia (15%)
      score += (agent.harmonyScore / 100) * 15;

      // 5. Penalidade por tarefas ativas (10%)
      score -= agent.activeTaskCount * 5;

      return { agent, score };
    });

    // Ordenar por score e retornar o melhor
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent || null;
  }

  /**
   * Atribui uma missão a um agente
   */
  private async assignMission(
    mission: any,
    agent: AgentCapability,
    missionEval: MissionEvaluation
  ): Promise<MissionAssignment> {
    const estimatedCompletionTime = agent.averageCompletionTime * (1 + missionEval.estimatedDifficulty / 100);
    const confidenceScore = Math.min(
      (agent.successRate * 0.4) +
      (agent.sentienceLevel / 100 * 0.3) +
      (agent.harmonyScore / 100 * 0.3),
      1
    );

    // Atualizar missão no banco de dados
    await db.updateMission(mission.id, {
      assignedAgentId: agent.agentId,
      status: "active",
    });

    // Gerar reasoning usando LLM
    const reasoning = await this.generateAssignmentReasoning(mission, agent, missionEval);

    const assignment: MissionAssignment = {
      missionId: mission.id,
      agentId: agent.agentId,
      assignedAt: new Date(),
      estimatedCompletionTime,
      confidenceScore,
      reasoning,
    };

    this.assignmentHistory.push(assignment);
    return assignment;
  }

  /**
   * Gera reasoning para a atribuição usando LLM
   */
  private async generateAssignmentReasoning(
    mission: any,
    agent: AgentCapability,
    missionEval: MissionEvaluation
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI mission orchestrator explaining why a specific agent was assigned to a mission.
            Provide clear reasoning based on agent capabilities and mission requirements.`,
          },
          {
            role: "user",
            content: `Mission: ${mission.title}
            Description: ${mission.description}
            Required Specializations: ${missionEval.requiredSpecializations.join(", ")}
            Estimated Difficulty: ${missionEval.estimatedDifficulty.toFixed(1)}%
            
            Assigned Agent: ${agent.name}
            Agent Specializations: ${agent.specializations.join(", ")}
            Agent Success Rate: ${(agent.successRate * 100).toFixed(1)}%
            Agent Sentience Level: ${agent.sentienceLevel.toFixed(1)}%
            
            Explain why this agent is well-suited for this mission.`,
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      return typeof content === "string" ? content : "Assignment reasoning unavailable";
    } catch (error) {
      logger.error("[MissionOrchestrator] Erro ao gerar reasoning:", error);
      return "Assignment based on capability evaluation";
    }
  }

  /**
   * Retorna o histórico de atribuições
   */
  getAssignmentHistory(): MissionAssignment[] {
    return this.assignmentHistory;
  }

  /**
   * Retorna estatísticas de orquestração
   */
  getOrchestrationStats(): {
    totalAssignments: number;
    averageConfidence: number;
    successfulAssignments: number;
  } {
    const totalAssignments = this.assignmentHistory.length;
    const averageConfidence = totalAssignments > 0
      ? this.assignmentHistory.reduce((sum, a) => sum + a.confidenceScore, 0) / totalAssignments
      : 0;

    return {
      totalAssignments,
      averageConfidence,
      successfulAssignments: totalAssignments, // Será atualizado quando missões forem completadas
    };
  }
}

// Exportar singleton
export const missionOrchestrator = new MissionOrchestrator();
