/**
 * Nexus Hub - Mission Execution Tracker
 * Rastreia execução de missões, coleta métricas e emite eventos em tempo real
 */

import { nanoid } from "nanoid";
import * as db from "./db";
import { logger } from "./utils/logger";
import { io } from "./server";

interface MissionExecutionRecord {
  id: string;
  missionId: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  status: "in_progress" | "completed" | "failed" | "abandoned";
  qualityScore?: number;
  completionPercentage: number;
  notes: string[];
  checkpoints: MissionCheckpoint[];
}

interface MissionCheckpoint {
  id: string;
  timestamp: Date;
  description: string;
  progress: number; // 0-100
  status: "on_track" | "delayed" | "at_risk";
}

interface MissionMetrics {
  missionId: string;
  totalExecutionTime: number; // em minutos
  completionPercentage: number;
  qualityScore: number;
  agentPerformance: {
    efficiency: number; // 0-100
    quality: number; // 0-100
    consistency: number; // 0-100
  };
  riskFactors: string[];
}

/**
 * Mission Execution Tracker: Monitora execução de missões em tempo real
 */
export class MissionExecutionTracker {
  private executionRecords: Map<string, MissionExecutionRecord> = new Map();
  private metricsHistory: MissionMetrics[] = [];

  /**
   * Inicia rastreamento de uma missão
   */
  async startMissionTracking(missionId: string, agentId: string): Promise<MissionExecutionRecord> {
    logger.info(`[MissionTracker] Iniciando rastreamento da missão ${missionId}...`);

    const recordId = nanoid();
    const record: MissionExecutionRecord = {
      id: recordId,
      missionId,
      agentId,
      startTime: new Date(),
      status: "in_progress",
      completionPercentage: 0,
      notes: [],
      checkpoints: [],
    };

    this.executionRecords.set(recordId, record);

    // Emitir evento de início
    io.emit("mission:started", {
      missionId,
      agentId,
      recordId,
      timestamp: new Date(),
    });

    return record;
  }

  /**
   * Registra um checkpoint de progresso
   */
  async recordCheckpoint(
    recordId: string,
    description: string,
    progress: number,
    status: "on_track" | "delayed" | "at_risk" = "on_track"
  ): Promise<MissionCheckpoint> {
    logger.info(`[MissionTracker] Registrando checkpoint para execução ${recordId}...`);

    const record = this.executionRecords.get(recordId);
    if (!record) {
      throw new Error(`Execução ${recordId} não encontrada`);
    }

    const checkpoint: MissionCheckpoint = {
      id: nanoid(),
      timestamp: new Date(),
      description,
      progress,
      status,
    };

    record.checkpoints.push(checkpoint);
    record.completionPercentage = progress;

    // Emitir evento de checkpoint
    io.emit("mission:checkpoint", {
      missionId: record.missionId,
      agentId: record.agentId,
      checkpoint,
      timestamp: new Date(),
    });

    // Alerta se em risco
    if (status === "at_risk") {
      logger.warn(`[MissionTracker] Missão ${record.missionId} em risco!`);
      io.emit("mission:at_risk", {
        missionId: record.missionId,
        agentId: record.agentId,
        description,
        timestamp: new Date(),
      });
    }

    return checkpoint;
  }

  /**
   * Registra uma nota na execução
   */
  async addNote(recordId: string, note: string): Promise<void> {
    const record = this.executionRecords.get(recordId);
    if (!record) {
      throw new Error(`Execução ${recordId} não encontrada`);
    }

    record.notes.push(`[${new Date().toISOString()}] ${note}`);
    logger.debug(`[MissionTracker] Nota adicionada à execução ${recordId}`);
  }

  /**
   * Conclui o rastreamento de uma missão
   */
  async completeMissionTracking(
    recordId: string,
    qualityScore: number = 100
  ): Promise<MissionMetrics> {
    logger.info(`[MissionTracker] Concluindo rastreamento da execução ${recordId}...`);

    const record = this.executionRecords.get(recordId);
    if (!record) {
      throw new Error(`Execução ${recordId} não encontrada`);
    }

    record.endTime = new Date();
    record.status = "completed";
    record.qualityScore = qualityScore;

    // Calcular métricas
    const metrics = this.calculateMetrics(record);
    this.metricsHistory.push(metrics);

    // Emitir evento de conclusão
    io.emit("mission:completed", {
      missionId: record.missionId,
      agentId: record.agentId,
      metrics,
      timestamp: new Date(),
    });

    logger.info(`[MissionTracker] Missão ${record.missionId} concluída com sucesso`);
    return metrics;
  }

  /**
   * Marca uma missão como falha
   */
  async failMissionTracking(recordId: string, reason: string): Promise<void> {
    logger.warn(`[MissionTracker] Marcando execução ${recordId} como falha...`);

    const record = this.executionRecords.get(recordId);
    if (!record) {
      throw new Error(`Execução ${recordId} não encontrada`);
    }

    record.endTime = new Date();
    record.status = "failed";
    record.notes.push(`[FALHA] ${reason}`);

    // Emitir evento de falha
    io.emit("mission:failed", {
      missionId: record.missionId,
      agentId: record.agentId,
      reason,
      completionPercentage: record.completionPercentage,
      timestamp: new Date(),
    });
  }

  /**
   * Calcula métricas de uma execução
   */
  private calculateMetrics(record: MissionExecutionRecord): MissionMetrics {
    const executionTime = record.endTime
      ? (record.endTime.getTime() - record.startTime.getTime()) / (1000 * 60)
      : 0;

    // Calcular eficiência baseada em checkpoints
    const checkpointProgress = record.checkpoints.map(c => c.progress);
    const avgProgress = checkpointProgress.length > 0
      ? checkpointProgress.reduce((a, b) => a + b) / checkpointProgress.length
      : record.completionPercentage;

    // Eficiência = progresso consistente
    const efficiency = Math.min(avgProgress, 100);

    // Qualidade = score fornecido
    const quality = record.qualityScore || 75;

    // Consistência = desvio padrão do progresso
    const variance = checkpointProgress.length > 1
      ? checkpointProgress.reduce((sum, p) => sum + Math.pow(p - avgProgress, 2), 0) / checkpointProgress.length
      : 0;
    const consistency = Math.max(100 - Math.sqrt(variance), 0);

    // Identificar fatores de risco
    const riskFactors: string[] = [];
    const atRiskCheckpoints = record.checkpoints.filter(c => c.status === "at_risk");
    if (atRiskCheckpoints.length > 0) {
      riskFactors.push(`${atRiskCheckpoints.length} checkpoints em risco`);
    }
    if (efficiency < 50) {
      riskFactors.push("Eficiência baixa");
    }
    if (quality < 60) {
      riskFactors.push("Qualidade abaixo do esperado");
    }

    return {
      missionId: record.missionId,
      totalExecutionTime: executionTime,
      completionPercentage: record.completionPercentage,
      qualityScore: quality,
      agentPerformance: {
        efficiency,
        quality,
        consistency,
      },
      riskFactors,
    };
  }

  /**
   * Retorna execução de uma missão
   */
  getExecutionRecord(recordId: string): MissionExecutionRecord | undefined {
    return this.executionRecords.get(recordId);
  }

  /**
   * Retorna todas as execuções de uma missão
   */
  getMissionExecutions(missionId: string): MissionExecutionRecord[] {
    return Array.from(this.executionRecords.values()).filter(r => r.missionId === missionId);
  }

  /**
   * Retorna todas as execuções de um agente
   */
  getAgentExecutions(agentId: string): MissionExecutionRecord[] {
    return Array.from(this.executionRecords.values()).filter(r => r.agentId === agentId);
  }

  /**
   * Retorna histórico de métricas
   */
  getMetricsHistory(missionId?: string): MissionMetrics[] {
    if (!missionId) {
      return this.metricsHistory;
    }

    return this.metricsHistory.filter(m => m.missionId === missionId);
  }

  /**
   * Calcula estatísticas agregadas
   */
  getAggregatedStats(): {
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageCompletionTime: number;
    averageQualityScore: number;
    averageEfficiency: number;
    successRate: number;
  } {
    const allExecutions = Array.from(this.executionRecords.values());
    const completedExecutions = allExecutions.filter(e => e.status === "completed");
    const failedExecutions = allExecutions.filter(e => e.status === "failed");

    const completionTimes = completedExecutions
      .map(e => (e.endTime!.getTime() - e.startTime.getTime()) / (1000 * 60))
      .filter(t => t > 0);

    const qualityScores = completedExecutions
      .map(e => e.qualityScore || 0)
      .filter(q => q > 0);

    const efficiencyScores = this.metricsHistory.map(m => m.agentPerformance.efficiency);

    return {
      totalExecutions: allExecutions.length,
      completedExecutions: completedExecutions.length,
      failedExecutions: failedExecutions.length,
      averageCompletionTime: completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b) / completionTimes.length
        : 0,
      averageQualityScore: qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b) / qualityScores.length
        : 0,
      averageEfficiency: efficiencyScores.length > 0
        ? efficiencyScores.reduce((a, b) => a + b) / efficiencyScores.length
        : 0,
      successRate: allExecutions.length > 0
        ? completedExecutions.length / allExecutions.length
        : 0,
    };
  }

  /**
   * Gera relatório de desempenho de um agente
   */
  getAgentPerformanceReport(agentId: string): {
    agentId: string;
    totalMissions: number;
    completedMissions: number;
    failedMissions: number;
    averageQuality: number;
    averageEfficiency: number;
    successRate: number;
    totalExecutionTime: number;
  } {
    const agentExecutions = this.getAgentExecutions(agentId);
    const completedExecutions = agentExecutions.filter(e => e.status === "completed");
    const failedExecutions = agentExecutions.filter(e => e.status === "failed");

    const agentMetrics = this.metricsHistory.filter(m => {
      const execution = Array.from(this.executionRecords.values()).find(r => r.missionId === m.missionId);
      return execution?.agentId === agentId;
    });

    const qualityScores = completedExecutions.map(e => e.qualityScore || 0);
    const efficiencyScores = agentMetrics.map(m => m.agentPerformance.efficiency);
    const executionTimes = agentMetrics.map(m => m.totalExecutionTime);

    return {
      agentId,
      totalMissions: agentExecutions.length,
      completedMissions: completedExecutions.length,
      failedMissions: failedExecutions.length,
      averageQuality: qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b) / qualityScores.length
        : 0,
      averageEfficiency: efficiencyScores.length > 0
        ? efficiencyScores.reduce((a, b) => a + b) / efficiencyScores.length
        : 0,
      successRate: agentExecutions.length > 0
        ? completedExecutions.length / agentExecutions.length
        : 0,
      totalExecutionTime: executionTimes.reduce((a, b) => a + b, 0),
    };
  }
}

// Exportar singleton
export const missionExecutionTracker = new MissionExecutionTracker();
