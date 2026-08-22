/**
 * Nexus Hub - Metrics Dashboard
 * Coleta, agrega e emite métricas do sistema em tempo real
 */

import { logger } from "./utils/logger";
import { io } from "./server";
import * as db from "./db";
import { phase6Manager } from "./phase-6-integration";

interface SystemMetrics {
  timestamp: Date;
  agents: AgentMetrics;
  missions: MissionMetrics;
  economy: EconomyMetrics;
  performance: PerformanceMetrics;
  health: HealthMetrics;
}

interface AgentMetrics {
  total: number;
  active: number;
  dormant: number;
  dissolved: number;
  averageSentience: number;
  averageHarmony: number;
  averageReputation: number;
}

interface MissionMetrics {
  total: number;
  pending: number;
  active: number;
  completed: number;
  failed: number;
  successRate: number;
  averageCompletionTime: number;
}

interface EconomyMetrics {
  totalTreasury: number;
  totalTransactions: number;
  averageRewardPerMission: number;
  topAgentBalance: number;
  bottomAgentBalance: number;
}

interface PerformanceMetrics {
  orchestrationScore: number;
  executionEfficiency: number;
  qualityScore: number;
  systemThroughput: number;
}

interface HealthMetrics {
  systemStatus: "healthy" | "degraded" | "critical";
  uptime: number;
  errorRate: number;
  averageResponseTime: number;
  lastCheckpoint: Date;
}

/**
 * Metrics Dashboard: Coleta e agrega métricas do sistema
 */
export class MetricsDashboard {
  private metricsHistory: SystemMetrics[] = [];
  private startTime: Date = new Date();
  private errorCount: number = 0;
  private totalRequests: number = 0;

  /**
   * Coleta métricas completas do sistema
   */
  async collectMetrics(): Promise<SystemMetrics> {
    logger.debug("[MetricsDashboard] Coletando métricas do sistema...");

    try {
      const agents = await this.collectAgentMetrics();
      const missions = await this.collectMissionMetrics();
      const economy = await this.collectEconomyMetrics();
      const performance = await this.collectPerformanceMetrics();
      const health = await this.collectHealthMetrics();

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        agents,
        missions,
        economy,
        performance,
        health,
      };

      this.metricsHistory.push(metrics);

      // Manter apenas últimas 1000 métricas
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory.shift();
      }

      return metrics;
    } catch (error) {
      logger.error("[MetricsDashboard] Erro ao coletar métricas:", error);
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Coleta métricas de agentes
   */
  private async collectAgentMetrics(): Promise<AgentMetrics> {
    const agents = await db.getAllAgents();

    const active = agents.filter((a: any) => a.status === "active").length;
    const dormant = agents.filter((a: any) => a.status === "dormant").length;
    const dissolved = agents.filter((a: any) => a.status === "dissolved").length;

    const averageSentience = agents.length > 0
      ? agents.reduce((sum: number, a: any) => sum + parseFloat(a.sentienceLevel || "0"), 0) / agents.length
      : 0;

    const averageHarmony = agents.length > 0
      ? agents.reduce((sum: number, a: any) => sum + parseFloat(a.harmonyScore || "50"), 0) / agents.length
      : 50;

    const averageReputation = agents.length > 0
      ? agents.reduce((sum: number, a: any) => sum + (a.reputation || 0), 0) / agents.length
      : 0;

    return {
      total: agents.length,
      active,
      dormant,
      dissolved,
      averageSentience,
      averageHarmony,
      averageReputation,
    };
  }

  /**
   * Coleta métricas de missões
   */
  private async collectMissionMetrics(): Promise<MissionMetrics> {
    const missions = await db.getAllMissions();

    const pending = missions.filter((m: any) => m.status === "pending").length;
    const active = missions.filter((m: any) => m.status === "active").length;
    const completed = missions.filter((m: any) => m.status === "completed").length;
    const failed = missions.filter((m: any) => m.status === "failed").length;

    const successRate = missions.length > 0
      ? (completed / missions.length) * 100
      : 0;

    const completedMissions = missions.filter((m: any) => m.status === "completed" && m.completedAt);
    const completionTimes = completedMissions
      .map((m: any) => {
        if (m.createdAt && m.completedAt) {
          return (new Date(m.completedAt).getTime() - new Date(m.createdAt).getTime()) / (1000 * 60);
        }
        return 0;
      })
      .filter((t: number) => t > 0);

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a: number, b: number) => a + b) / completionTimes.length
      : 0;

    return {
      total: missions.length,
      pending,
      active,
      completed,
      failed,
      successRate,
      averageCompletionTime,
    };
  }

  /**
   * Coleta métricas econômicas
   */
  private async collectEconomyMetrics(): Promise<EconomyMetrics> {
    const agents = await db.getAllAgents();

    const totalTreasury = agents.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);

    const balances = agents
      .map((a: any) => parseFloat(a.balance || "0"))
      .filter((b: number) => b > 0)
      .sort((a: number, b: number) => b - a);

    const topAgentBalance = balances.length > 0 ? balances[0] : 0;
    const bottomAgentBalance = balances.length > 0 ? balances[balances.length - 1] : 0;

    // Obter estatísticas de recompensas
    const dashboard = await phase6Manager.getDashboard();
    const totalTransactions = dashboard.rewards.totalTransactions || 0;
    const averageRewardPerMission = totalTransactions > 0
      ? dashboard.rewards.totalRewardsDistributed / totalTransactions
      : 0;

    return {
      totalTreasury,
      totalTransactions,
      averageRewardPerMission,
      topAgentBalance,
      bottomAgentBalance,
    };
  }

  /**
   * Coleta métricas de performance
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const dashboard = await phase6Manager.getDashboard();

    const orchestrationScore = dashboard.orchestration.averageConfidence * 100;
    const executionEfficiency = dashboard.execution.averageEfficiency || 0;
    const qualityScore = dashboard.execution.averageQualityScore || 0;

    // Throughput = missões completadas por hora
    const systemThroughput = dashboard.missions.completedMissions > 0
      ? (dashboard.missions.completedMissions / ((new Date().getTime() - this.startTime.getTime()) / (1000 * 60 * 60)))
      : 0;

    return {
      orchestrationScore,
      executionEfficiency,
      qualityScore,
      systemThroughput,
    };
  }

  /**
   * Coleta métricas de saúde do sistema
   */
  private async collectHealthMetrics(): Promise<HealthMetrics> {
    const uptime = (new Date().getTime() - this.startTime.getTime()) / (1000 * 60); // em minutos
    const errorRate = this.totalRequests > 0
      ? (this.errorCount / this.totalRequests) * 100
      : 0;

    // Determinar status
    let systemStatus: "healthy" | "degraded" | "critical" = "healthy";
    if (errorRate > 10) {
      systemStatus = "critical";
    } else if (errorRate > 5) {
      systemStatus = "degraded";
    }

    return {
      systemStatus,
      uptime,
      errorRate,
      averageResponseTime: 150, // ms - placeholder
      lastCheckpoint: new Date(),
    };
  }

  /**
   * Emite métricas via WebSocket
   */
  async emitMetrics(): Promise<void> {
    try {
      const metrics = await this.collectMetrics();

      io.emit("metrics:updated", metrics);
      logger.debug("[MetricsDashboard] Métricas emitidas");
    } catch (error) {
      logger.error("[MetricsDashboard] Erro ao emitir métricas:", error);
    }
  }

  /**
   * Retorna histórico de métricas
   */
  getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Calcula tendências de métricas
   */
  calculateTrends(): {
    agentGrowth: number;
    missionSuccessGrowth: number;
    treasuryGrowth: number;
    performanceGrowth: number;
  } {
    if (this.metricsHistory.length < 2) {
      return {
        agentGrowth: 0,
        missionSuccessGrowth: 0,
        treasuryGrowth: 0,
        performanceGrowth: 0,
      };
    }

    const current = this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[Math.max(0, this.metricsHistory.length - 10)];

    return {
      agentGrowth: ((current.agents.total - previous.agents.total) / previous.agents.total) * 100 || 0,
      missionSuccessGrowth: (current.missions.successRate - previous.missions.successRate),
      treasuryGrowth: ((current.economy.totalTreasury - previous.economy.totalTreasury) / previous.economy.totalTreasury) * 100 || 0,
      performanceGrowth: (current.performance.orchestrationScore - previous.performance.orchestrationScore),
    };
  }

  /**
   * Retorna alertas baseados em métricas
   */
  generateAlerts(): Array<{ severity: "info" | "warning" | "critical"; message: string }> {
    const alerts: Array<{ severity: "info" | "warning" | "critical"; message: string }> = [];

    if (this.metricsHistory.length === 0) return alerts;

    const current = this.metricsHistory[this.metricsHistory.length - 1];

    // Alertas de saúde
    if (current.health.systemStatus === "critical") {
      alerts.push({
        severity: "critical",
        message: `System critical: Error rate ${current.health.errorRate.toFixed(2)}%`,
      });
    }

    // Alertas de performance
    if (current.performance.orchestrationScore < 50) {
      alerts.push({
        severity: "warning",
        message: "Low orchestration confidence score",
      });
    }

    // Alertas de economia
    if (current.economy.totalTreasury < 1) {
      alerts.push({
        severity: "warning",
        message: "Low total treasury balance",
      });
    }

    // Alertas de missões
    if (current.missions.failedMissions > current.missions.completed) {
      alerts.push({
        severity: "warning",
        message: "High mission failure rate",
      });
    }

    // Alertas de agentes
    if (current.agents.averageSentience < 20) {
      alerts.push({
        severity: "info",
        message: "Low average agent sentience level",
      });
    }

    return alerts;
  }

  /**
   * Registra requisição (para cálculo de taxa de erro)
   */
  recordRequest(success: boolean): void {
    this.totalRequests++;
    if (!success) {
      this.errorCount++;
    }
  }

  /**
   * Retorna estatísticas de uptime
   */
  getUptimeStats(): {
    uptime: number;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
  } {
    const uptime = (new Date().getTime() - this.startTime.getTime()) / (1000 * 60 * 60); // em horas
    const errorRate = this.totalRequests > 0
      ? (this.errorCount / this.totalRequests) * 100
      : 0;

    return {
      uptime,
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      errorRate,
    };
  }
}

// Exportar singleton
export const metricsDashboard = new MetricsDashboard();
