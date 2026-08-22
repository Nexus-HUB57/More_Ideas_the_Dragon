/**
 * Nexus Hub - Phase 6 Integration Manager
 * Gerenciador central de integração entre Terminal Gnox e componentes da Fase 6
 */

import { missionOrchestrator } from "./mission-orchestrator";
import { rewardDistributionEngine } from "./reward-distribution";
import { missionExecutionTracker } from "./mission-tracker";
import { metricsDashboard } from "./metrics-dashboard";
import * as db from "./db";

export class Phase6IntegrationManager {
  /**
   * Executa orquestração de missões
   */
  async executeOrchestration(): Promise<any> {
    console.log("[Phase6Integration] Executando orquestração");
    return await missionOrchestrator.orchestrateMissions();
  }

  /**
   * Obtém estatísticas de orquestração
   */
  getOrchestrationStats(): any {
    return missionOrchestrator.getOrchestrationStats();
  }

  /**
   * Obtém histórico de atribuições
   */
  getAssignmentHistory(limit: number = 10): any[] {
    return missionOrchestrator.getRecentAssignments(limit);
  }

  /**
   * Distribui recompensa para missão concluída
   */
  async distributeReward(
    missionId: string,
    agentId: string,
    baseReward: string,
    performanceScore: number
  ): Promise<any> {
    return await rewardDistributionEngine.distributeReward(
      missionId,
      agentId,
      baseReward,
      performanceScore
    );
  }

  /**
   * Processa conclusão de missão
   */
  async processMissionCompletion(
    missionId: string,
    agentId: string,
    qualityScore: number,
    executionTimeMinutes: number,
    estimatedTimeMinutes: number
  ): Promise<any> {
    return await rewardDistributionEngine.processMissionCompletion(
      missionId,
      agentId,
      qualityScore,
      executionTimeMinutes,
      estimatedTimeMinutes
    );
  }

  /**
   * Obtém estatísticas de recompensas
   */
  getRewardStats(): any {
    return rewardDistributionEngine.getRewardStats();
  }

  /**
   * Obtém histórico de transações
   */
  getTransactionHistory(agentId?: string): any[] {
    return rewardDistributionEngine.getTransactionHistory(agentId);
  }

  /**
   * Obtém saldo de agente
   */
  async getAgentBalance(agentId: string): Promise<string> {
    return await rewardDistributionEngine.getAgentBalance(agentId);
  }

  /**
   * Inicia rastreamento de missão
   */
  async startMissionTracking(
    missionId: string,
    agentId: string,
    estimatedTime: number
  ): Promise<any> {
    return await missionExecutionTracker.startMissionTracking(
      missionId,
      agentId,
      estimatedTime
    );
  }

  /**
   * Registra checkpoint de progresso
   */
  async recordCheckpoint(
    missionId: string,
    agentId: string,
    progressPercentage: number,
    qualityScore: number
  ): Promise<any> {
    return await missionExecutionTracker.recordCheckpoint(
      missionId,
      agentId,
      progressPercentage,
      qualityScore
    );
  }

  /**
   * Conclui rastreamento de missão
   */
  async completeMissionTracking(missionId: string): Promise<any> {
    return await missionExecutionTracker.completeMissionTracking(missionId);
  }

  /**
   * Obtém relatório de performance de agente
   */
  getAgentPerformanceReport(agentId: string): any {
    return missionExecutionTracker.getAgentPerformanceReport(agentId);
  }

  /**
   * Obtém estatísticas agregadas
   */
  getAggregatedStats(): any {
    return missionExecutionTracker.getAggregatedStats();
  }

  /**
   * Coleta métricas do dashboard
   */
  async collectMetrics(): Promise<any> {
    return await metricsDashboard.collectMetrics();
  }

  /**
   * Obtém dashboard atual
   */
  async getCurrentDashboard(): Promise<any> {
    return await metricsDashboard.getCurrentDashboard();
  }

  /**
   * Obtém histórico de métricas
   */
  getMetricsHistory(limit: number = 100): any[] {
    return metricsDashboard.getMetricsHistory(limit);
  }

  /**
   * Obtém tendências de métricas
   */
  getTrends(): any {
    return metricsDashboard.getTrends();
  }

  /**
   * Obtém alertas do sistema
   */
  getAlerts(): string[] {
    return metricsDashboard.getAlerts();
  }

  /**
   * Obtém recomendações do sistema
   */
  getRecommendations(): string[] {
    return metricsDashboard.getRecommendations();
  }

  /**
   * Obtém métricas de sucesso de missões
   */
  async getMissionSuccessMetrics(): Promise<any> {
    return await rewardDistributionEngine.getMissionSuccessMetrics();
  }

  /**
   * Obtém relatório completo do ecossistema
   */
  async getEcosystemReport(): Promise<any> {
    const dashboard = await this.getCurrentDashboard();
    const trends = this.getTrends();
    const alerts = this.getAlerts();
    const recommendations = this.getRecommendations();

    return {
      dashboard,
      trends,
      alerts,
      recommendations,
      timestamp: new Date(),
    };
  }
}

// Singleton instance
export const phase6Manager = new Phase6IntegrationManager();
