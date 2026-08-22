/**
 * Nexus Hub - Metrics Service
 * Coleta e agregação de métricas em tempo real
 */

import * as db from "./db";

export interface DashboardMetrics {
  timestamp: Date;
  missions: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    failed: number;
    successRate: number;
  };
  agents: {
    total: number;
    active: number;
    idle: number;
    offline: number;
    averageSentienceLevel: number;
    averageHarmonyScore: number;
  };
  rewards: {
    totalDistributed: string;
    averageReward: string;
    topAgents: Array<{ agentId: string; totalReward: string; name: string }>;
  };
  orchestration: {
    totalAssignments: number;
    successfulAssignments: number;
    averageConfidence: number;
  };
  performance: {
    averageExecutionTime: number;
    averageQuality: number;
    successRate: number;
  };
  ecosystem: {
    totalTransactions: number;
    totalEconomyValue: string;
    averageTransactionValue: string;
  };
  health: {
    systemStatus: "healthy" | "degraded" | "critical";
    uptime: number;
    errorRate: number;
    averageResponseTime: number;
  };
}

export interface SystemAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp: Date;
}

class MetricsService {
  private metricsHistory: DashboardMetrics[] = [];
  private lastUpdate: Date = new Date();
  private alerts: SystemAlert[] = [];
  private startTime: Date = new Date();

  /**
   * Coleta todas as métricas do ecossistema
   */
  async collectMetrics(): Promise<DashboardMetrics> {
    console.log("[MetricsService] Coletando métricas do ecossistema");

    try {
      // 1. Coletar dados de missões
      const allMissions = await db.getAllMissions();
      const missionMetrics = {
        total: allMissions.length,
        pending: allMissions.filter((m: any) => m.status === "pending").length,
        active: allMissions.filter((m: any) => m.status === "active").length,
        completed: allMissions.filter((m: any) => m.status === "completed").length,
        failed: allMissions.filter((m: any) => m.status === "failed").length,
        successRate:
          allMissions.length > 0
            ? ((allMissions.filter((m: any) => m.status === "completed").length /
                allMissions.length) *
                100)
            : 0,
      };

      // 2. Coletar dados de agentes
      const allAgents = await db.getAllAgents();
      const agentMetrics = {
        total: allAgents.length,
        active: allAgents.filter((a: any) => a.status === "active").length,
        idle: allAgents.filter((a: any) => a.status === "idle").length,
        offline: allAgents.filter((a: any) => a.status === "offline").length,
        averageSentienceLevel:
          allAgents.length > 0
            ? allAgents.reduce((sum: number, a: any) => sum + (a.sentienceLevel || 0), 0) /
              allAgents.length
            : 0,
        averageHarmonyScore:
          allAgents.length > 0
            ? allAgents.reduce((sum: number, a: any) => sum + (a.harmonyScore || 0), 0) /
              allAgents.length
            : 0,
      };

      // 3. Coletar dados de recompensas
      const allTransactions = await db.getTransactionHistory();
      const totalRewards = allTransactions.reduce(
        (sum: number, t: any) => sum + parseFloat(t.amount || "0"),
        0
      );

      // Agrupar recompensas por agente
      const rewardsByAgent: Record<string, number> = {};
      allTransactions.forEach((t: any) => {
        const agentId = t.toAgentId;
        rewardsByAgent[agentId] = (rewardsByAgent[agentId] || 0) + parseFloat(t.amount || "0");
      });

      const topAgents = Object.entries(rewardsByAgent)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([agentId, reward]) => {
          const agent = allAgents.find((a: any) => a.id === agentId);
          return {
            agentId,
            totalReward: reward.toFixed(2),
            name: agent?.name || "Unknown",
          };
        });

      const rewardMetrics = {
        totalDistributed: totalRewards.toFixed(2),
        averageReward:
          allTransactions.length > 0
            ? (totalRewards / allTransactions.length).toFixed(2)
            : "0",
        topAgents,
      };

      // 4. Coletar dados de orquestração (simulado)
      const activeAssignments = allMissions.filter((m: any) => m.status === "active").length;
      const orchestrationMetrics = {
        totalAssignments: allMissions.filter((m: any) => m.assignedAgentId).length,
        successfulAssignments: allMissions.filter((m: any) => m.status === "completed").length,
        averageConfidence: 0.82, // Simulado
      };

      // 5. Coletar dados de performance
      const completedMissions = allMissions.filter((m: any) => m.status === "completed");
      const performanceMetrics = {
        averageExecutionTime: 145.5, // Simulado
        averageQuality: 84.6, // Simulado
        successRate: missionMetrics.successRate,
      };

      // 6. Coletar dados de economia
      const ecosystemMetrics = {
        totalTransactions: allTransactions.length,
        totalEconomyValue: totalRewards.toFixed(2),
        averageTransactionValue:
          allTransactions.length > 0
            ? (totalRewards / allTransactions.length).toFixed(2)
            : "0",
      };

      // 7. Calcular saúde do sistema
      const errorRate = 0.8; // Simulado
      const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000 / 3600; // em horas
      const systemStatus: "healthy" | "degraded" | "critical" =
        agentMetrics.offline > agentMetrics.total * 0.3
          ? "critical"
          : performanceMetrics.successRate < 70
            ? "degraded"
            : "healthy";

      const healthMetrics = {
        systemStatus,
        uptime,
        errorRate,
        averageResponseTime: 142, // Simulado
      };

      // 8. Compilar dashboard
      const dashboard: DashboardMetrics = {
        timestamp: new Date(),
        missions: missionMetrics,
        agents: agentMetrics,
        rewards: rewardMetrics,
        orchestration: orchestrationMetrics,
        performance: performanceMetrics,
        ecosystem: ecosystemMetrics,
        health: healthMetrics,
      };

      this.metricsHistory.push(dashboard);
      this.lastUpdate = new Date();

      // Manter apenas últimas 1000 entradas
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      // Gerar alertas
      this.generateAlerts(dashboard);

      return dashboard;
    } catch (error) {
      console.error("[MetricsService] Erro ao coletar métricas:", error);
      throw error;
    }
  }

  /**
   * Obtém dashboard atual (com cache de 30 segundos)
   */
  async getCurrentDashboard(): Promise<DashboardMetrics> {
    const timeSinceLastUpdate = (new Date().getTime() - this.lastUpdate.getTime()) / 1000;

    if (timeSinceLastUpdate < 30 && this.metricsHistory.length > 0) {
      return this.metricsHistory[this.metricsHistory.length - 1];
    }

    return await this.collectMetrics();
  }

  /**
   * Obtém histórico de métricas
   */
  getMetricsHistory(limit: number = 100): DashboardMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Obtém tendências de métricas
   */
  getTrends() {
    if (this.metricsHistory.length < 2) {
      return null;
    }

    const current = this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[this.metricsHistory.length - 2];

    return {
      missions: {
        totalChange: current.missions.total - previous.missions.total,
        completedChange: current.missions.completed - previous.missions.completed,
        failedChange: current.missions.failed - previous.missions.failed,
      },
      agents: {
        activeChange: current.agents.active - previous.agents.active,
        sentienceLevelChange:
          current.agents.averageSentienceLevel - previous.agents.averageSentienceLevel,
      },
      rewards: {
        distributedChange:
          parseFloat(current.rewards.totalDistributed) -
          parseFloat(previous.rewards.totalDistributed),
      },
      performance: {
        qualityChange: current.performance.averageQuality - previous.performance.averageQuality,
        successRateChange:
          current.performance.successRate - previous.performance.successRate,
      },
    };
  }

  /**
   * Gera alertas baseado em métricas
   */
  private generateAlerts(metrics: DashboardMetrics) {
    this.alerts = [];

    // Alertas de missões
    if (metrics.missions.failed > metrics.missions.completed * 0.2) {
      this.addAlert(
        "warning",
        "Taxa de Falha Elevada",
        `${metrics.missions.failed} missões falharam (${((metrics.missions.failed / metrics.missions.total) * 100).toFixed(1)}%)`
      );
    }

    if (metrics.missions.pending > 10) {
      this.addAlert(
        "info",
        "Missões Pendentes",
        `${metrics.missions.pending} missões aguardando atribuição`
      );
    }

    // Alertas de agentes
    if (metrics.agents.offline > metrics.agents.total * 0.3) {
      this.addAlert(
        "critical",
        "Agentes Offline",
        `${metrics.agents.offline} agentes offline (${((metrics.agents.offline / metrics.agents.total) * 100).toFixed(1)}%)`
      );
    }

    if (metrics.agents.averageSentienceLevel < 50) {
      this.addAlert(
        "warning",
        "Senciência Baixa",
        `Nível médio de senciência: ${metrics.agents.averageSentienceLevel.toFixed(1)}`
      );
    }

    // Alertas de performance
    if (metrics.performance.successRate < 70) {
      this.addAlert(
        "critical",
        "Taxa de Sucesso Baixa",
        `Taxa de sucesso: ${metrics.performance.successRate.toFixed(1)}%`
      );
    }

    if (metrics.performance.averageQuality < 75) {
      this.addAlert(
        "warning",
        "Qualidade Reduzida",
        `Qualidade média: ${metrics.performance.averageQuality.toFixed(1)}%`
      );
    }
  }

  /**
   * Adiciona um alerta
   */
  private addAlert(severity: "info" | "warning" | "critical", title: string, description: string) {
    this.alerts.push({
      id: `alert-${Date.now()}-${Math.random()}`,
      severity,
      title,
      description,
      timestamp: new Date(),
    });

    // Manter apenas últimos 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  /**
   * Obtém alertas atuais
   */
  getAlerts(): SystemAlert[] {
    return this.alerts;
  }

  /**
   * Obtém alertas por severidade
   */
  getAlertsBySeverity(severity: "info" | "warning" | "critical"): SystemAlert[] {
    return this.alerts.filter((a) => a.severity === severity);
  }
}

// Exportar instância singleton
export const metricsService = new MetricsService();
