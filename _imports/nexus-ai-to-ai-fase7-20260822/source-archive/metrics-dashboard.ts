        successRate:
          executionStats.totalTracked > 0
            ? (executionStats.successfulMissions / executionStats.totalTracked) * 100
            : 0,
      };

      // 6. Coletar dados de economia
      const allTransactions = await db.getTransactionHistory();
      const totalEconomyValue = allTransactions
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0)
        .toString();
      const averageTransactionValue =
        allTransactions.length > 0
          ? (parseFloat(totalEconomyValue) / allTransactions.length).toString()
          : "0";

      const ecosystemMetrics = {
        totalTransactions: allTransactions.length,
        totalEconomyValue,
        averageTransactionValue,
      };

      // 7. Compilar dashboard
      const dashboard: DashboardMetrics = {
        timestamp: new Date(),
        missions: missionMetrics,
        agents: agentMetrics,
        rewards: rewardStats,
        orchestration: orchestrationStats,
        performance: performanceMetrics,
        ecosystem: ecosystemMetrics,
      };

      this.metricsHistory.push(dashboard);
      this.lastUpdate = new Date();

      // Manter apenas últimas 1000 entradas
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      return dashboard;
    } catch (error) {
      console.error("[MetricsDashboard] Erro ao coletar métricas:", error);
      throw error;
    }
  }

  /**
   * Obtém dashboard atual
   */
  async getCurrentDashboard(): Promise<DashboardMetrics> {
    // Se última coleta foi há menos de 30 segundos, retornar cache
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
  getTrends(): any {
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
   * Obtém alertas baseado em métricas
   */
  getAlerts(): string[] {
    const alerts: string[] = [];
    const current = this.metricsHistory[this.metricsHistory.length - 1];

    if (!current) return alerts;

    // Alertas de missões
    if (current.missions.failed > current.missions.completed * 0.2) {
      alerts.push("Taxa de falha de missões acima do normal");
    }

    if (current.missions.pending > 10) {
      alerts.push(`${current.missions.pending} missões pendentes aguardando atribuição`);
    }

    // Alertas de agentes
    if (current.agents.offline > current.agents.total * 0.3) {
      alerts.push("Mais de 30% dos agentes offline");
    }

    if (current.agents.averageSentienceLevel < 50) {
      alerts.push("Nível médio de senciência abaixo do esperado");
    }

    // Alertas de performance
    if (current.performance.successRate < 70) {
      alerts.push("Taxa de sucesso abaixo de 70%");
    }

    if (current.performance.averageQuality < 75) {
      alerts.push("Qualidade média abaixo de 75%");
    }

    return alerts;
  }

  /**
   * Obtém recomendações baseado em métricas
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const current = this.metricsHistory[this.metricsHistory.length - 1];
