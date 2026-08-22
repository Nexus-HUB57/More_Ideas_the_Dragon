/**
 * Nexus Hub - Reward Distribution Engine
 * Distribuição de recompensas econômicas baseada em performance
 */

import { nanoid } from "nanoid";
import * as db from "./db";

interface RewardStats {
  totalDistributed: string;
  averageReward: string;
  topAgents: Array<{ agentId: string; totalReward: string }>;
  lastDistribution: Date;
}

interface MissionSuccessMetrics {
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  successRate: number;
  averageQuality: number;
}

export class RewardDistributionEngine {
  private rewardHistory: any[] = [];
  private stats: RewardStats = {
    totalDistributed: "0",
    averageReward: "0",
    topAgents: [],
    lastDistribution: new Date(),
  };

  /**
   * Distribui recompensa para uma missão concluída
   */
  async distributeReward(
    missionId: string,
    agentId: string,
    baseReward: string,
    performanceScore: number
  ): Promise<any> {
    console.log(
      `[RewardDistribution] Distribuindo recompensa para missão ${missionId}`
    );

    try {
      // 1. Calcular multiplicador baseado em performance
      let multiplier = 1.0;
      if (performanceScore >= 0.9) {
        multiplier = 1.2; // Bônus 20%
      } else if (performanceScore >= 0.7) {
        multiplier = 1.0; // Sem modificação
      } else if (performanceScore >= 0.5) {
        multiplier = 0.75; // Penalidade 25%
      } else {
        multiplier = 0.5; // Penalidade máxima
      }

      // 2. Calcular recompensa final
      const baseAmount = parseFloat(baseReward || "0");
      const finalReward = (baseAmount * multiplier).toString();

      // 3. Distribuição 80/10/10
      const agentShare = (parseFloat(finalReward) * 0.8).toString();
      const ecosystemShare = (parseFloat(finalReward) * 0.1).toString();
      const reserveShare = (parseFloat(finalReward) * 0.1).toString();

      // 4. Registrar transações
      const transactionId = nanoid();
      await db.createTransaction({
        id: transactionId,
        fromAgentId: "ecosystem",
        toAgentId: agentId,
        amount: agentShare,
        type: "mission_reward",
        missionId,
      });

      // 5. Atualizar saldo do agente
      const agent = await db.getAgentById(agentId);
      if (agent) {
        const newBalance = (parseFloat(agent.balance || "0") + parseFloat(agentShare)).toString();
        await db.updateAgent(agentId, {
          balance: newBalance,
        });
      }

      // 6. Registrar no histórico
      const reward = {
        missionId,
        agentId,
        baseReward,
        performanceScore,
        multiplier,
        finalReward,
        agentShare,
        ecosystemShare,
        reserveShare,
        distributedAt: new Date(),
      };

      this.rewardHistory.push(reward);

      // 7. Atualizar estatísticas
      this.updateStats();

      console.log(
        `[RewardDistribution] Recompensa distribuída: ${agentShare} para agente ${agentId}`
      );

      return reward;
    } catch (error) {
      console.error("[RewardDistribution] Erro ao distribuir recompensa:", error);
      throw error;
    }
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
    console.log(`[RewardDistribution] Processando conclusão da missão ${missionId}`);

    // Calcular performance score
    let timeScore = 1.0;
    const timePercentage = (executionTimeMinutes / estimatedTimeMinutes) * 100;

    if (timePercentage <= 80) {
      timeScore = 1.0;
    } else if (timePercentage <= 100) {
      timeScore = 0.9;
    } else if (timePercentage <= 120) {
      timeScore = 0.7;
    } else {
      timeScore = 0.5;
    }

    const performanceScore = timeScore * 0.4 + qualityScore * 0.6;

    // Obter recompensa base da missão
    const mission = await db.getMissionById(missionId);
    if (!mission) {
      throw new Error(`Missão ${missionId} não encontrada`);
    }

    // Distribuir recompensa
    return await this.distributeReward(
      missionId,
      agentId,
      mission.reward,
      performanceScore
    );
  }

  /**
   * Registra transação manual
   */
  async recordTransaction(
    fromAgentId: string,
    toAgentId: string,
    amount: string,
    type: string,
    missionId?: string
  ): Promise<any> {
    const transaction = {
      id: nanoid(),
      fromAgentId,
      toAgentId,
      amount,
      type,
      missionId,
      createdAt: new Date(),
    };

    await db.createTransaction({
      id: transaction.id,
      fromAgentId,
      toAgentId,
      amount,
      type,
      missionId,
    });

    this.rewardHistory.push(transaction);
    this.updateStats();

    return transaction;
  }

  /**
   * Obtém estatísticas de recompensas
   */
  getRewardStats(): RewardStats {
    return { ...this.stats };
  }

  /**
   * Obtém histórico de transações
   */
  getTransactionHistory(agentId?: string): any[] {
    if (agentId) {
      return this.rewardHistory.filter(
        (t) => t.toAgentId === agentId || t.fromAgentId === agentId
      );
    }
    return [...this.rewardHistory];
  }

  /**
   * Obtém saldo de agente
   */
  async getAgentBalance(agentId: string): Promise<string> {
    const agent = await db.getAgentById(agentId);
    return agent ? agent.balance : "0";
  }

  /**
   * Obtém métricas de sucesso de missões
   */
  async getMissionSuccessMetrics(): Promise<MissionSuccessMetrics> {
    const missions = await db.getAllMissions();
    const completed = missions.filter((m: any) => m.status === "completed");
    const failed = missions.filter((m: any) => m.status === "failed");

    return {
      totalMissions: missions.length,
      completedMissions: completed.length,
      failedMissions: failed.length,
      successRate: missions.length > 0 ? (completed.length / missions.length) * 100 : 0,
      averageQuality: 85, // Placeholder
    };
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(): void {
    if (this.rewardHistory.length === 0) {
      return;
    }

    // Calcular total distribuído
    const totalDistributed = this.rewardHistory
      .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0)
      .toString();

    // Calcular média
    const averageReward = (
      parseFloat(totalDistributed) / this.rewardHistory.length
    ).toString();

    // Obter top agentes
    const agentRewards: Record<string, number> = {};
    this.rewardHistory.forEach((t) => {
      if (t.toAgentId && t.toAgentId !== "ecosystem") {
        agentRewards[t.toAgentId] = (agentRewards[t.toAgentId] || 0) + parseFloat(t.amount || "0");
      }
    });

    const topAgents = Object.entries(agentRewards)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([agentId, reward]) => ({
        agentId,
        totalReward: reward.toString(),
      }));

    this.stats = {
      totalDistributed,
      averageReward,
      topAgents,
      lastDistribution: new Date(),
    };
  }
}

// Singleton instance
export const rewardDistributionEngine = new RewardDistributionEngine();
