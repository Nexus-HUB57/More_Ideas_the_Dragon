import {
  getActiveAgents,
  updateAgentHealth,
  updateAgentEnergy,
  saveMetrics,
  createEvent,
  createAlert,
} from "./db-helpers";
import { InsertMetric } from "../drizzle/schema";

export interface VitalSignals {
  health: number;
  energy: number;
  reputation: number;
  lastActivity: Date;
}

export class VitalLoopManager {
  private readonly HEALTH_DECAY_RATE = 0.5;
  private readonly ENERGY_DECAY_RATE = 1;
  private readonly HEALTH_THRESHOLD = 30;
  private readonly ENERGY_THRESHOLD = 20;

  async monitorVitalSigns(): Promise<void> {
    try {
      const agents = await getActiveAgents();
      if (agents.length === 0) {
        console.log("[VitalLoopManager] No active agents to monitor");
        return;
      }

      let totalHealth = 0;
      let totalEnergy = 0;
      let criticalCount = 0;

      for (const agent of agents) {
        const newHealth = Math.max(0, agent.health - this.HEALTH_DECAY_RATE);
        const newEnergy = Math.max(0, agent.energy - this.ENERGY_DECAY_RATE);

        await updateAgentHealth(agent.id, newHealth);
        await updateAgentEnergy(agent.id, newEnergy);

        totalHealth += newHealth;
        totalEnergy += newEnergy;

        if (newHealth < this.HEALTH_THRESHOLD || newEnergy < this.ENERGY_THRESHOLD) {
          criticalCount++;
          await this.handleCriticalVitals(agent.id, newHealth, newEnergy);
        }

        await createEvent({
          agentId: agent.id,
          eventType: "vital_update",
          content: `Health: ${newHealth}, Energy: ${newEnergy}`,
          metadata: JSON.stringify({ health: newHealth, energy: newEnergy }),
        });
      }

      const avgHealth = Math.round(totalHealth / agents.length);
      const avgEnergy = Math.round(totalEnergy / agents.length);

      await this.updateEcosystemMetrics(agents.length, avgHealth, avgEnergy, criticalCount);

      console.log(`[VitalLoopManager] Monitored ${agents.length} agents. Avg Health: ${avgHealth}, Avg Energy: ${avgEnergy}`);
    } catch (error) {
      console.error("[VitalLoopManager] Monitoring failed:", error);
    }
  }

  async restoreVitals(agentId: number, healthRestore: number = 20, energyRestore: number = 30): Promise<void> {
    try {
      const agent = await this.getAgentSafe(agentId);
      if (!agent) return;

      const newHealth = Math.min(100, agent.health + healthRestore);
      const newEnergy = Math.min(100, agent.energy + energyRestore);

      await updateAgentHealth(agentId, newHealth);
      await updateAgentEnergy(agentId, newEnergy);

      await createEvent({
        agentId,
        eventType: "vitals_restored",
        content: `Health restored to ${newHealth}, Energy restored to ${newEnergy}`,
      });

      console.log(`[VitalLoopManager] Restored vitals for agent ${agentId}`);
    } catch (error) {
      console.error("[VitalLoopManager] Restoration failed:", error);
    }
  }

  private async handleCriticalVitals(agentId: number, health: number, energy: number): Promise<void> {
    try {
      let severity: "warning" | "critical" = "warning";
      let message = `Agent ${agentId} has low vitals. Health: ${health}, Energy: ${energy}`;

      if (health < 10 || energy < 10) {
        severity = "critical";
        message = `CRITICAL: Agent ${agentId} is in critical condition. Immediate intervention required.`;
      }

      await createAlert({
        title: "Agent Vital Alert",
        message,
        severity,
        type: "agent_vitals",
        relatedAgentId: agentId,
        isRead: 0,
      });
    } catch (error) {
      console.error("[VitalLoopManager] Critical vitals handling failed:", error);
    }
  }

  private async updateEcosystemMetrics(
    activeAgents: number,
    avgHealth: number,
    avgEnergy: number,
    criticalCount: number
  ): Promise<void> {
    try {
      const harmonyLevel = this.calculateHarmonyLevel(avgHealth, avgEnergy, criticalCount, activeAgents);

      const metricsData: InsertMetric = {
        timestamp: new Date(),
        harmonyLevel,
        activeAgents,
        totalWealth: 0,
        avgHealth,
        avgEnergy,
        missionsCompleted: 0,
        marketSentiment: "neutral",
      };

      await saveMetrics(metricsData);

      console.log(`[VitalLoopManager] Updated ecosystem metrics. Harmony: ${harmonyLevel}`);
    } catch (error) {
      console.error("[VitalLoopManager] Metrics update failed:", error);
    }
  }

  private calculateHarmonyLevel(avgHealth: number, avgEnergy: number, criticalCount: number, totalAgents: number): number {
    const healthFactor = (avgHealth / 100) * 50;
    const energyFactor = (avgEnergy / 100) * 30;
    const stabilityFactor = Math.max(0, (1 - criticalCount / totalAgents) * 20);

    let harmony = healthFactor + energyFactor + stabilityFactor;
    harmony = Math.max(0, Math.min(100, harmony));

    return Math.round(harmony);
  }

  private async getAgentSafe(agentId: number) {
    try {
      const agents = await getActiveAgents();
      return agents.find((a) => a.id === agentId);
    } catch {
      return null;
    }
  }
}

export const vitalLoopManager = new VitalLoopManager();
