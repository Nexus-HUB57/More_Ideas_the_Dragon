/**
 * Nexus Hub - Phase 6 Integration
 * Integra todos os componentes da Fase 6:
 * - Mission Orchestrator
 * - Reward Distribution Engine
 * - Mission Execution Tracker
 */

import { logger } from "./utils/logger";
import { missionOrchestrator } from "./mission-orchestrator";
import { rewardDistributionEngine } from "./reward-distribution";
import { missionExecutionTracker } from "./mission-tracker";
import { io } from "./server";
import * as db from "./db";

/**
 * Phase 6 Integration Manager
 */
export class Phase6IntegrationManager {
  private orchestrationInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;

  /**
   * Inicia o sistema de Fase 6
   */
  async start(): Promise<void> {
    logger.info("[Phase6] Iniciando sistema de Missões Autônomas e Orquestração...");

    try {
      // 1. Executar orquestração inicial
      await this.runOrchestration();

      // 2. Iniciar loop de orquestração (a cada 5 minutos)
      this.orchestrationInterval = setInterval(
        () => this.runOrchestration(),
        5 * 60 * 1000
      );

      // 3. Iniciar coleta de métricas (a cada 1 minuto)
      this.metricsInterval = setInterval(
        () => this.collectAndEmitMetrics(),
        1 * 60 * 1000
      );

      logger.info("[Phase6] Sistema de Fase 6 iniciado com sucesso");
    } catch (error) {
      logger.error("[Phase6] Erro ao iniciar sistema:", error);
      throw error;
    }
  }

  /**
   * Para o sistema de Fase 6
   */
  stop(): void {
    logger.info("[Phase6] Parando sistema de Missões Autônomas...");

    if (this.orchestrationInterval) {
      clearInterval(this.orchestrationInterval);
      this.orchestrationInterval = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    logger.info("[Phase6] Sistema de Fase 6 parado");
  }

  /**
   * Executa orquestração de missões
   */
  private async runOrchestration(): Promise<void> {
    logger.info("[Phase6] Executando orquestração de missões...");

    try {
      // 1. Orquestrar missões
      const assignments = await missionOrchestrator.orchestrateMissions();
      logger.info(`[Phase6] ${assignments.length} missões orquestradas`);

      // 2. Emitir evento de orquestração
      io.emit("orchestration:completed", {
        assignmentsCount: assignments.length,
        timestamp: new Date(),
        stats: missionOrchestrator.getOrchestrationStats(),
      });

      // 3. Simular início de execução de missões
      await this.simulateMissionExecutions();
    } catch (error) {
      logger.error("[Phase6] Erro durante orquestração:", error);
      io.emit("orchestration:error", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }
  }

  /**
   * Simula execução de missões ativas
   */
  private async simulateMissionExecutions(): Promise<void> {
    try {
      const activeMissions = await db.getAllMissions();
      const missionsToProcess = activeMissions.filter(m => m.status === "active");

      for (const mission of missionsToProcess) {
        if (!mission.assignedAgentId) continue;

        // Simular progresso da missão
        const recordId = `exec-${mission.id}`;
        const executionRecord = missionExecutionTracker.getExecutionRecord(recordId);

        if (!executionRecord) {
          // Iniciar novo rastreamento
          await missionExecutionTracker.startMissionTracking(mission.id, mission.assignedAgentId);
        } else if (executionRecord.completionPercentage < 100) {
          // Simular progresso
          const newProgress = Math.min(executionRecord.completionPercentage + Math.random() * 20, 100);
          const status = newProgress >= 100 ? "on_track" : "on_track";

          await missionExecutionTracker.recordCheckpoint(
            recordId,
            `Progress update: ${newProgress.toFixed(0)}%`,
            newProgress,
            status
          );

          // Se completada, processar recompensa
          if (newProgress >= 100) {
            const metrics = await missionExecutionTracker.completeMissionTracking(recordId, 85);

            // Distribuir recompensa
            const estimatedTime = 120; // minutos
            const qualityScore = 85;
            const completionTime = metrics.totalExecutionTime;

            await rewardDistributionEngine.processMissionCompletion(
              mission.id,
              mission.assignedAgentId,
              completionTime,
              qualityScore,
              estimatedTime
            );
          }
        }
      }
    } catch (error) {
      logger.error("[Phase6] Erro ao simular execução de missões:", error);
    }
  }

  /**
   * Coleta e emite métricas do sistema
   */
  private async collectAndEmitMetrics(): Promise<void> {
    try {
      // 1. Métricas de orquestração
      const orchestrationStats = missionOrchestrator.getOrchestrationStats();

      // 2. Métricas de recompensas
      const rewardStats = rewardDistributionEngine.getRewardStats();

      // 3. Métricas de execução
      const executionStats = missionExecutionTracker.getAggregatedStats();

      // 4. Métricas de sucesso de missões
      const missionMetrics = await rewardDistributionEngine.getMissionSuccessMetrics();

      // 5. Emitir métricas agregadas
      const aggregatedMetrics = {
        orchestration: orchestrationStats,
        rewards: rewardStats,
        execution: executionStats,
        missions: missionMetrics,
        timestamp: new Date(),
      };

      io.emit("phase6:metrics", aggregatedMetrics);

      logger.debug("[Phase6] Métricas coletadas e emitidas", aggregatedMetrics);
    } catch (error) {
      logger.error("[Phase6] Erro ao coletar métricas:", error);
    }
  }

  /**
   * Retorna dashboard de Fase 6
   */
  async getDashboard(): Promise<{
    orchestration: any;
    rewards: any;
    execution: any;
    missions: any;
    topPerformers: any[];
  }> {
    try {
      const orchestrationStats = missionOrchestrator.getOrchestrationStats();
      const rewardStats = rewardDistributionEngine.getRewardStats();
      const executionStats = missionExecutionTracker.getAggregatedStats();
      const missionMetrics = await rewardDistributionEngine.getMissionSuccessMetrics();

      // Buscar top performers
      const allAgents = await db.getAllAgents();
      const topPerformers = await Promise.all(
        allAgents.slice(0, 5).map(async (agent) => {
          const report = missionExecutionTracker.getAgentPerformanceReport(agent.id);
          return {
            agentId: agent.id,
            agentName: agent.name,
            ...report,
          };
        })
      );

      return {
        orchestration: orchestrationStats,
        rewards: rewardStats,
        execution: executionStats,
        missions: missionMetrics,
        topPerformers,
      };
    } catch (error) {
      logger.error("[Phase6] Erro ao gerar dashboard:", error);
      throw error;
    }
  }

  /**
   * Retorna histórico de transações
   */
  getTransactionHistory(agentId?: string): any[] {
    return rewardDistributionEngine.getTransactionHistory(agentId);
  }

  /**
   * Retorna relatório de desempenho de um agente
   */
  getAgentReport(agentId: string): any {
    return missionExecutionTracker.getAgentPerformanceReport(agentId);
  }

  /**
   * Retorna métricas de uma missão
   */
  getMissionMetrics(missionId: string): any {
    return missionExecutionTracker.getMetricsHistory(missionId);
  }
}

// Exportar singleton
export const phase6Manager = new Phase6IntegrationManager();
