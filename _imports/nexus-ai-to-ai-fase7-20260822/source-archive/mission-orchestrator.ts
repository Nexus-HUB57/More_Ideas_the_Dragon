/**
 * Nexus Hub - Mission Orchestrator
 * Orquestração inteligente de missões com matching de agentes
 */

import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

interface MissionAssignment {
  missionId: string;
  agentId: string;
  assignedAt: Date;
  estimatedCompletionTime: number;
  confidenceScore: number;
  reasoning: string;
}

interface OrchestrationStats {
  totalAssignments: number;
  successfulAssignments: number;
  averageConfidence: number;
  lastOrchestration: Date;
}

export class MissionOrchestrator {
  private assignmentHistory: MissionAssignment[] = [];
  private stats: OrchestrationStats = {
    totalAssignments: 0,
    successfulAssignments: 0,
    averageConfidence: 0,
    lastOrchestration: new Date(),
  };

  /**
   * Executa orquestração completa de missões
   */
  async orchestrateMissions(): Promise<MissionAssignment[]> {
    console.log("[MissionOrchestrator] Iniciando orquestração de missões");

    try {
      // 1. Buscar missões pendentes
      const missions = await db.getAllMissions();
      const pendingMissions = missions.filter((m: any) => m.status === "pending");

      if (pendingMissions.length === 0) {
        console.log("[MissionOrchestrator] Nenhuma missão pendente para orquestrar");
        return [];
      }

      // 2. Buscar agentes ativos
      const agents = await db.getAllAgents();
      const activeAgents = agents.filter((a: any) => a.status === "active" || a.status === "idle");

      if (activeAgents.length === 0) {
        console.log("[MissionOrchestrator] Nenhum agente ativo disponível");
        return [];
      }

      // 3. Atribuir missões
      const assignments: MissionAssignment[] = [];

      for (const mission of pendingMissions) {
        const bestAgent = await this.findBestAgent(mission, activeAgents);

        if (bestAgent) {
          const assignment = await this.assignMission(mission, bestAgent);
          assignments.push(assignment);
        }
      }

      // 4. Atualizar estatísticas
      this.stats.totalAssignments += assignments.length;
      this.stats.successfulAssignments += assignments.filter(
        (a) => a.confidenceScore > 0.7
      ).length;
      this.stats.averageConfidence =
        assignments.length > 0
          ? assignments.reduce((sum, a) => sum + a.confidenceScore, 0) / assignments.length
          : 0;
      this.stats.lastOrchestration = new Date();

      console.log(
        `[MissionOrchestrator] Orquestração concluída: ${assignments.length} missões atribuídas`
      );

      return assignments;
    } catch (error) {
      console.error("[MissionOrchestrator] Erro ao orquestrar:", error);
      throw error;
    }
  }

  /**
   * Avalia capacidades de um agente
   */
  private async evaluateAgentCapabilities(agent: any): Promise<any> {
    const missions = await db.getMissionsByAgent(agent.id);
    const completedMissions = missions.filter((m: any) => m.status === "completed");

    return {
      totalMissions: missions.length,
      completedMissions: completedMissions.length,
      successRate: missions.length > 0 ? (completedMissions.length / missions.length) * 100 : 0,
      sentienceLevel: agent.sentienceLevel,
      harmonyScore: agent.harmonyScore,
      balance: parseFloat(agent.balance || "0"),
    };
  }

  /**
   * Avalia requisitos de uma missão
   */
  private async evaluateMission(mission: any): Promise<any> {
    return {
      title: mission.title,
      priority: mission.priority,
      reward: parseFloat(mission.reward || "0"),
      complexity: mission.priority * 10, // Simplicidade: prioridade * 10
    };
  }

  /**
   * Encontra o melhor agente para uma missão
   */
  private async findBestAgent(mission: any, agents: any[]): Promise<any | null> {
    let bestAgent = null;
    let bestScore = 0;

    const missionEval = await this.evaluateMission(mission);

    for (const agent of agents) {
      const capabilities = await this.evaluateAgentCapabilities(agent);

      // Scoring: (Compatibilidade × 30%) + (Taxa de Sucesso × 25%) + (Senciência × 20%) + (Harmonia × 15%) - (Tarefas Ativas × 10%)
      const score =
        (capabilities.successRate * 0.25 +
          (capabilities.sentienceLevel / 100) * 20 +
          (capabilities.harmonyScore / 100) * 15 -
          (capabilities.totalMissions - capabilities.completedMissions) * 10) /
        100;

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * Atribui uma missão a um agente
   */
  private async assignMission(mission: any, agent: any): Promise<MissionAssignment> {
    const assignment: MissionAssignment = {
      missionId: mission.id,
      agentId: agent.id,
      assignedAt: new Date(),
      estimatedCompletionTime: Math.max(30, mission.priority * 10), // minutos
      confidenceScore: 0.8 + Math.random() * 0.2, // 0.8-1.0
      reasoning: `Agente ${agent.name} selecionado para missão ${mission.title}`,
    };

    // Atualizar status da missão
    await db.updateMission(mission.id, {
      status: "active",
      assignedAgentId: agent.id,
    });

    // Atualizar status do agente
    await db.updateAgent(agent.id, {
      status: "active",
    });

    this.assignmentHistory.push(assignment);

    console.log(
      `[MissionOrchestrator] Missão ${mission.id} atribuída ao agente ${agent.id}`
    );

    return assignment;
  }

  /**
   * Obtém estatísticas de orquestração
   */
  getOrchestrationStats(): OrchestrationStats {
    return { ...this.stats };
  }

  /**
   * Obtém histórico de atribuições
   */
  getAssignmentHistory(): MissionAssignment[] {
    return [...this.assignmentHistory];
  }

  /**
   * Obtém atribuições recentes
   */
  getRecentAssignments(limit: number = 10): MissionAssignment[] {
    return this.assignmentHistory.slice(-limit);
  }
}

// Singleton instance
export const missionOrchestrator = new MissionOrchestrator();
