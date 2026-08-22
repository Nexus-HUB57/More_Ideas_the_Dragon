/**
 * Nexus Hub - Mission Execution Tracker
 * Rastreamento de execução de missões em tempo real
 */

import { nanoid } from "nanoid";
import * as db from "./db";

interface MissionCheckpoint {
  checkpointId: string;
  missionId: string;
  agentId: string;
  progressPercentage: number;
  qualityScore: number;
  status: "on_track" | "delayed" | "at_risk";
  timestamp: Date;
}

interface MissionMetrics {
  missionId: string;
  totalExecutionTime: number;
  completionPercentage: number;
  qualityScore: number;
  agentPerformance: {
    efficiency: number;
    quality: number;
    consistency: number;
  };
  riskFactors: string[];
}

interface ExecutionStats {
  totalTracked: number;
  successfulMissions: number;
  failedMissions: number;
  averageExecutionTime: number;
  averageQuality: number;
}

export class MissionExecutionTracker {
  private trackingData: Map<string, any> = new Map();
  private metricsHistory: MissionMetrics[] = [];
  private checkpoints: MissionCheckpoint[] = [];

  /**
   * Inicia rastreamento de uma missão
   */
  async startMissionTracking(
    missionId: string,
    agentId: string,
    estimatedTime: number
  ): Promise<any> {
    console.log(`[MissionTracker] Iniciando rastreamento da missão ${missionId}`);

    const trackingRecord = {
      missionId,
      agentId,
      startTime: new Date(),
      estimatedTime,
      checkpoints: [] as MissionCheckpoint[],
      status: "tracking",
    };

    this.trackingData.set(missionId, trackingRecord);

    return trackingRecord;
  }

  /**
   * Registra checkpoint de progresso
   */
  async recordCheckpoint(
    missionId: string,
    agentId: string,
    progressPercentage: number,
    qualityScore: number
  ): Promise<MissionCheckpoint> {
    console.log(
      `[MissionTracker] Registrando checkpoint para missão ${missionId}: ${progressPercentage}%`
    );

    const tracking = this.trackingData.get(missionId);
    if (!tracking) {
      throw new Error(`Rastreamento não iniciado para missão ${missionId}`);
    }

    // Determinar status baseado em progresso esperado
    const elapsedTime = (new Date().getTime() - tracking.startTime.getTime()) / 1000 / 60; // minutos
    const expectedProgress = (elapsedTime / tracking.estimatedTime) * 100;
    const progressDelta = progressPercentage - expectedProgress;

    let status: "on_track" | "delayed" | "at_risk" = "on_track";
    if (progressDelta < -20) {
      status = "at_risk";
    } else if (progressDelta < -10) {
      status = "delayed";
    }

    const checkpoint: MissionCheckpoint = {
      checkpointId: nanoid(),
      missionId,
      agentId,
      progressPercentage,
      qualityScore,
      status,
      timestamp: new Date(),
    };

    tracking.checkpoints.push(checkpoint);
    this.checkpoints.push(checkpoint);

    return checkpoint;
  }

  /**
   * Conclui rastreamento de uma missão
   */
  async completeMissionTracking(missionId: string): Promise<MissionMetrics> {
    console.log(`[MissionTracker] Concluindo rastreamento da missão ${missionId}`);

    const tracking = this.trackingData.get(missionId);
    if (!tracking) {
      throw new Error(`Rastreamento não encontrado para missão ${missionId}`);
    }

    const totalExecutionTime =
      (new Date().getTime() - tracking.startTime.getTime()) / 1000 / 60; // minutos

    // Calcular métricas
    const checkpoints = tracking.checkpoints;
    const completionPercentage =
      checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].progressPercentage : 100;
    const qualityScore =
      checkpoints.length > 0
        ? checkpoints.reduce((sum: number, cp: any) => sum + cp.qualityScore, 0) /
          checkpoints.length
        : 100;

    // Calcular eficiência, qualidade e consistência
    const efficiency = (completionPercentage / 100) * 100;
    const quality = qualityScore;
    const consistency = 100 - this.calculateStandardDeviation(checkpoints);

    const metrics: MissionMetrics = {
      missionId,
      totalExecutionTime,
      completionPercentage,
      qualityScore,
      agentPerformance: {
        efficiency,
        quality,
        consistency,
      },
      riskFactors: this.identifyRiskFactors(checkpoints),
    };

    this.metricsHistory.push(metrics);
    tracking.status = "completed";

    return metrics;
  }

  /**
   * Marca rastreamento como falha
   */
  async failMissionTracking(missionId: string, reason: string): Promise<any> {
    console.log(`[MissionTracker] Marcando missão ${missionId} como falha: ${reason}`);

    const tracking = this.trackingData.get(missionId);
    if (!tracking) {
      throw new Error(`Rastreamento não encontrado para missão ${missionId}`);
    }

    tracking.status = "failed";
    tracking.failureReason = reason;

    return tracking;
  }

  /**
   * Obtém estatísticas agregadas
   */
  getAggregatedStats(): ExecutionStats {
    const completed = this.metricsHistory.filter((m) => m.completionPercentage === 100);
    const failed = this.metricsHistory.filter((m) => m.completionPercentage < 100);

    return {
      totalTracked: this.metricsHistory.length,
      successfulMissions: completed.length,
      failedMissions: failed.length,
      averageExecutionTime:
        this.metricsHistory.length > 0
          ? this.metricsHistory.reduce((sum, m) => sum + m.totalExecutionTime, 0) /
            this.metricsHistory.length
          : 0,
      averageQuality:
        this.metricsHistory.length > 0
          ? this.metricsHistory.reduce((sum, m) => sum + m.qualityScore, 0) /
            this.metricsHistory.length
          : 0,
    };
  }

  /**
   * Obtém relatório de performance de agente
   */
  getAgentPerformanceReport(agentId: string): any {
    const agentMetrics = this.metricsHistory.filter(
      (m) => this.trackingData.get(m.missionId)?.agentId === agentId
    );

    if (agentMetrics.length === 0) {
      return {
        agentId,
        totalMissions: 0,
        completedMissions: 0,
        successRate: 0,
        averageQuality: 0,
        averageExecutionTime: 0,
      };
    }

    const completed = agentMetrics.filter((m) => m.completionPercentage === 100);

    return {
      agentId,
      totalMissions: agentMetrics.length,
      completedMissions: completed.length,
      successRate: (completed.length / agentMetrics.length) * 100,
      averageQuality:
        agentMetrics.reduce((sum, m) => sum + m.qualityScore, 0) / agentMetrics.length,
      averageExecutionTime:
        agentMetrics.reduce((sum, m) => sum + m.totalExecutionTime, 0) / agentMetrics.length,
    };
  }

  /**
   * Obtém histórico de métricas para uma missão
   */
  getMetricsHistory(missionId: string): MissionMetrics[] {
    return this.metricsHistory.filter((m) => m.missionId === missionId);
  }

  /**
   * Calcula desvio padrão do progresso
   */
  private calculateStandardDeviation(checkpoints: MissionCheckpoint[]): number {
    if (checkpoints.length === 0) return 0;

    const mean = checkpoints.reduce((sum, cp) => sum + cp.progressPercentage, 0) / checkpoints.length;
    const variance =
      checkpoints.reduce((sum, cp) => sum + Math.pow(cp.progressPercentage - mean, 2), 0) /
      checkpoints.length;

    return Math.sqrt(variance);
  }

  /**
   * Identifica fatores de risco
   */
  private identifyRiskFactors(checkpoints: MissionCheckpoint[]): string[] {
    const risks: string[] = [];

    const atRiskCheckpoints = checkpoints.filter((cp) => cp.status === "at_risk");
    if (atRiskCheckpoints.length > 0) {
      risks.push(`${atRiskCheckpoints.length} checkpoints em risco`);
    }

    const delayedCheckpoints = checkpoints.filter((cp) => cp.status === "delayed");
    if (delayedCheckpoints.length > 0) {
      risks.push(`${delayedCheckpoints.length} checkpoints atrasados`);
    }

    const qualityIssues = checkpoints.filter((cp) => cp.qualityScore < 70);
    if (qualityIssues.length > 0) {
      risks.push(`${qualityIssues.length} checkpoints com qualidade baixa`);
    }

    return risks;
  }
}

// Singleton instance
export const missionExecutionTracker = new MissionExecutionTracker();
