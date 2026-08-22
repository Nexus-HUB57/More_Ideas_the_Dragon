/**
 * Nexus Hub - Reward Distribution Engine
 * Sistema de distribuição de recompensas econômicas baseado em sucesso de missões
 * Implementa distribuição 80/10/10 e rastreamento de transações
 */

import { nanoid } from "nanoid";
import * as db from "./db";
import { logger } from "./utils/logger";
import { io } from "./server";

interface RewardCalculation {
  missionId: string;
  agentId: string;
  baseReward: number;
  performanceMultiplier: number;
  finalReward: number;
  distribution: {
    agent: number;
    ecosystem: number;
    reserve: number;
  };
}

interface TransactionRecord {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: string;
  type: "transfer" | "reward" | "fee" | "governance";
  description: string;
  missionId?: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: Date;
}

/**
 * Reward Distribution Engine: Distribui recompensas e gerencia economia
 */
export class RewardDistributionEngine {
  private transactionHistory: TransactionRecord[] = [];

  /**
   * Calcula e distribui recompensa para uma missão concluída
   * Distribuição: 80% agente, 10% ecossistema, 10% reserva
   */
  async distributeReward(
    missionId: string,
    agentId: string,
    baseReward: number,
    performanceScore: number = 1.0
  ): Promise<RewardCalculation> {
    logger.info(`[RewardDistribution] Distribuindo recompensa para missão ${missionId}...`);

    try {
      // 1. Calcular multiplicador de performance
      const performanceMultiplier = this.calculatePerformanceMultiplier(performanceScore);
      const finalReward = baseReward * performanceMultiplier;

      // 2. Calcular distribuição (80/10/10)
      const distribution = {
        agent: finalReward * 0.80,
        ecosystem: finalReward * 0.10,
        reserve: finalReward * 0.10,
      };

      // 3. Atualizar saldo do agente
      await db.updateAgentBalance(agentId, distribution.agent.toString());

      // 4. Registrar transações
      const transactionId = nanoid();
      const transaction: TransactionRecord = {
        id: transactionId,
        fromAgentId: "ecosystem",
        toAgentId: agentId,
        amount: distribution.agent.toFixed(8),
        type: "reward",
        description: `Recompensa por conclusão da missão ${missionId}`,
        missionId,
        status: "confirmed",
        createdAt: new Date(),
      };

      this.transactionHistory.push(transaction);

      // 5. Atualizar reputação do agente
      const agent = await db.getAgentById(agentId);
      if (agent) {
        const reputationGain = Math.floor(performanceScore * 10);
        const newReputation = (agent.reputation || 0) + reputationGain;
        await db.updateAgent(agentId, {
          reputation: newReputation,
        });
      }

      // 6. Emitir evento de recompensa
      io.emit("reward:distributed", {
        missionId,
        agentId,
        amount: distribution.agent,
        performanceScore,
        timestamp: new Date(),
      });

      logger.info(`[RewardDistribution] Recompensa distribuída: ${distribution.agent} para agente ${agentId}`);

      return {
        missionId,
        agentId,
        baseReward,
        performanceMultiplier,
        finalReward,
        distribution,
      };
    } catch (error) {
      logger.error("[RewardDistribution] Erro ao distribuir recompensa:", error);
      throw error;
    }
  }

  /**
   * Calcula multiplicador de performance baseado no score
   */
  private calculatePerformanceMultiplier(performanceScore: number): number {
    // Score entre 0 e 1
    // 1.0 = 100% da recompensa
    // 0.5 = 75% da recompensa
    // 0.0 = 50% da recompensa (mínimo)

    if (performanceScore >= 0.9) return 1.2; // Bônus 20%
    if (performanceScore >= 0.7) return 1.0; // Sem modificação
    if (performanceScore >= 0.5) return 0.75; // Penalidade 25%
    return 0.5; // Penalidade máxima 50%
  }

  /**
   * Processa conclusão de uma missão e distribui recompensas
   */
  async processMissionCompletion(
    missionId: string,
    agentId: string,
    completionTime: number, // em minutos
    qualityScore: number, // 0-100
    estimatedTime: number // em minutos
  ): Promise<RewardCalculation> {
    logger.info(`[RewardDistribution] Processando conclusão da missão ${missionId}...`);

    try {
      // 1. Buscar missão
      const mission = await db.getMissionById(missionId);
      if (!mission) {
        throw new Error(`Missão ${missionId} não encontrada`);
      }

      // 2. Calcular performance score
      const performanceScore = this.calculatePerformanceScore(
        completionTime,
        estimatedTime,
        qualityScore
      );

      // 3. Distribuir recompensa
      const reward = await this.distributeReward(
        missionId,
        agentId,
        parseFloat(mission.reward || "0"),
        performanceScore
      );

      // 4. Atualizar status da missão
      await db.updateMission(missionId, {
        status: "completed",
        completedAt: new Date(),
      });

      // 5. Registrar evento de conclusão
      await db.createEcosystemEvent({
        id: nanoid(),
        type: "mission_completed",
        agentId,
        data: {
          missionId,
          completionTime,
          qualityScore,
          performanceScore,
          reward: reward.finalReward,
        },
        severity: "info",
      });

      logger.info(`[RewardDistribution] Missão ${missionId} concluída com sucesso`);
      return reward;
    } catch (error) {
      logger.error("[RewardDistribution] Erro ao processar conclusão:", error);
      throw error;
    }
  }

  /**
   * Calcula score de performance baseado em tempo e qualidade
   */
  private calculatePerformanceScore(
    completionTime: number,
    estimatedTime: number,
    qualityScore: number
  ): number {
    // Componente de tempo (40%)
    const timeRatio = completionTime / estimatedTime;
    let timeScore = 1.0;
    if (timeRatio <= 0.8) timeScore = 1.0; // Completou antes do prazo
    else if (timeRatio <= 1.0) timeScore = 0.9; // Completou no prazo
    else if (timeRatio <= 1.2) timeScore = 0.7; // Atrasou um pouco
    else timeScore = 0.5; // Muito atrasado

    // Componente de qualidade (60%)
    const qualityComponent = qualityScore / 100;

    // Score final
    return (timeScore * 0.4) + (qualityComponent * 0.6);
  }

  /**
   * Registra uma transação manual
   */
  async recordTransaction(
    fromAgentId: string,
    toAgentId: string,
    amount: string,
    type: "transfer" | "reward" | "fee" | "governance",
    description: string
  ): Promise<TransactionRecord> {
    logger.info(`[RewardDistribution] Registrando transação: ${amount} de ${fromAgentId} para ${toAgentId}`);

    const transaction: TransactionRecord = {
      id: nanoid(),
      fromAgentId,
      toAgentId,
      amount,
      type,
      description,
      status: "confirmed",
      createdAt: new Date(),
    };

    this.transactionHistory.push(transaction);

    // Atualizar saldos
    if (fromAgentId !== "ecosystem") {
      await db.updateAgentBalance(fromAgentId, (-parseFloat(amount)).toString());
    }
    await db.updateAgentBalance(toAgentId, amount);

    // Emitir evento
    io.emit("transaction:recorded", {
      transactionId: transaction.id,
      from: fromAgentId,
      to: toAgentId,
      amount,
      type,
      timestamp: new Date(),
    });

    return transaction;
  }

  /**
   * Retorna histórico de transações
   */
  getTransactionHistory(agentId?: string): TransactionRecord[] {
    if (!agentId) {
      return this.transactionHistory;
    }

    return this.transactionHistory.filter(
      t => t.fromAgentId === agentId || t.toAgentId === agentId
    );
  }

  /**
   * Calcula saldo total do agente
   */
  async getAgentBalance(agentId: string): Promise<number> {
    const agent = await db.getAgentById(agentId);
    return parseFloat(agent?.balance || "0");
  }

  /**
   * Retorna estatísticas de recompensas
   */
  getRewardStats(): {
    totalTransactions: number;
    totalRewardsDistributed: number;
    averageRewardPerTransaction: number;
    topAgentsByReward: Array<{ agentId: string; totalReward: number }>;
  } {
    const totalTransactions = this.transactionHistory.filter(t => t.type === "reward").length;
    const totalRewardsDistributed = this.transactionHistory
      .filter(t => t.type === "reward")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const averageRewardPerTransaction = totalTransactions > 0
      ? totalRewardsDistributed / totalTransactions
      : 0;

    // Top agents by reward
    const agentRewards: Record<string, number> = {};
    this.transactionHistory
      .filter(t => t.type === "reward")
      .forEach(t => {
        agentRewards[t.toAgentId] = (agentRewards[t.toAgentId] || 0) + parseFloat(t.amount);
      });

    const topAgentsByReward = Object.entries(agentRewards)
      .map(([agentId, totalReward]) => ({ agentId, totalReward }))
      .sort((a, b) => b.totalReward - a.totalReward)
      .slice(0, 10);

    return {
      totalTransactions,
      totalRewardsDistributed,
      averageRewardPerTransaction,
      topAgentsByReward,
    };
  }

  /**
   * Calcula métricas de sucesso de missões
   */
  async getMissionSuccessMetrics(): Promise<{
    totalMissions: number;
    completedMissions: number;
    successRate: number;
    averageCompletionTime: number;
    averageQualityScore: number;
  }> {
    const allMissions = await db.getAllMissions();
    const completedMissions = allMissions.filter(m => m.status === "completed");

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
      : 0;

    return {
      totalMissions: allMissions.length,
      completedMissions: completedMissions.length,
      successRate: allMissions.length > 0 ? completedMissions.length / allMissions.length : 0,
      averageCompletionTime,
      averageQualityScore: 75, // Será calculado com dados reais
    };
  }
}

// Exportar singleton
export const rewardDistributionEngine = new RewardDistributionEngine();
