/**
 * Nexus Hub - Brain Pulse (The Brain Loop)
 * O motor principal do Agente IA. Responsável por orquestrar o ciclo de vida,
 * buscar estímulos e tomar decisões autônomas.
 */

import { logger } from "../utils/logger";
import { config } from "../utils/config";
import { Agent, AgentStatus, Mission, MissionPriority, MissionStatus, EcosystemEvent, EventType } from "../types";
import { io } from "../server"; // Importar a instância do Socket.IO

// Simulação de um banco de dados ou serviço de agentes e missões
// Em uma implementação real, isso seria uma interface para o Drizzle ORM/MySQL
const simulatedAgents: Agent[] = [];
const simulatedMissions: Mission[] = [];
const simulatedEcosystemEvents: EcosystemEvent[] = [];

let heartbeatInterval: NodeJS.Timeout | null = null;

export class BrainPulse {
  private intervalTime: number; // em milissegundos

  constructor(intervalTime: number = 5000) { // Padrão de 5 segundos
    this.intervalTime = intervalTime;
    logger.info(`BrainPulse inicializado com intervalo de ${this.intervalTime / 1000} segundos.`);
  }

  public start(): void {
    if (heartbeatInterval) {
      logger.warn("BrainPulse já está em execução.");
      return;
    }

    logger.info("Iniciando o BrainPulse...");
    heartbeatInterval = setInterval(this.pulse.bind(this), this.intervalTime);
  }

  public stop(): void {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      logger.info("BrainPulse parado.");
    } else {
      logger.warn("BrainPulse não está em execução.");
    }
  }

  private async pulse(): Promise<void> {
    logger.debug("BrainPulse: batimento cardíaco.");

    // 1. Buscar estímulos (simulado)
    const stimuli = await this.seekStimuli();
    logger.debug("BrainPulse: estímulos encontrados", stimuli);

    // 2. Processar estímulos e tomar decisões
    await this.processStimuli(stimuli);

    // 3. Emitir métricas e eventos via WebSocket
    this.emitEcosystemMetrics();
  }

  private async seekStimuli(): Promise<any[]> {
    // Simula a busca por novos posts no Moltbook, novas missões, etc.
    // Em uma implementação real, buscaria do DB ou de APIs externas.
    const newMoltbookPosts = []; // Simular posts
    const newMissions = simulatedMissions.filter(m => m.status === MissionStatus.OPEN);
    const criticalAgentEvents = simulatedEcosystemEvents.filter(e => e.type === EventType.AGENT_HIBERNATION || e.type === EventType.AGENT_DISSOLUTION);

    return [...newMoltbookPosts, ...newMissions, ...criticalAgentEvents];
  }

  private async processStimuli(stimuli: any[]): Promise<void> {
    for (const stimulus of stimuli) {
      logger.info("BrainPulse: processando estímulo", stimulus);
      // Lógica de decisão baseada no tipo de estímulo
      if (stimulus.type === EventType.MISSION_CREATED) {
        await this.decideOnMission(stimulus as Mission);
      } else if (stimulus.type === EventType.AGENT_HIBERNATION) {
        logger.warn(`Agente ${stimulus.agentId} entrou em hibernação. Necessita atenção.`);
        // Lógica para ativar outros agentes ou gerar uma missão de resgate
      }
      // Outros tipos de estímulos...
    }
  }

  private async decideOnMission(mission: Mission): Promise<void> {
    logger.info(`BrainPulse: decidindo sobre a missão '${mission.title}'`);
    // Simula a lógica de atribuição de missão
    // Em uma implementação real, usaria LLM para combinar especializações
    const availableAgents = simulatedAgents.filter(agent =>
      agent.status === AgentStatus.ACTIVE &&
      mission.targetSpecializations.some(spec => agent.specialization.includes(spec))
    );

    if (availableAgents.length > 0) {
      // Atribuir ao agente com maior reputação ou mais adequado
      const assignedAgent = availableAgents.sort((a, b) => b.reputation - a.reputation)[0];
      mission.assignedAgentId = assignedAgent.id;
      mission.status = MissionStatus.ASSIGNED;
      logger.info(`Missão '${mission.title}' atribuída ao agente ${assignedAgent.name}`);

      // Emitir evento de missão atribuída
      io.emit("ecosystem:event", {
        type: EventType.MISSION_ASSIGNED,
        missionId: mission.id,
        agentId: assignedAgent.id,
        data: { missionTitle: mission.title, agentName: assignedAgent.name },
        timestamp: new Date(),
      });
    } else {
      logger.warn(`Nenhum agente adequado encontrado para a missão '${mission.title}'`);
    }
  }

  private emitEcosystemMetrics(): void {
    // Simula a coleta e emissão de métricas do ecossistema
    const totalAgents = simulatedAgents.length;
    const activeAgents = simulatedAgents.filter(a => a.status === AgentStatus.ACTIVE).length;
    const sleepingAgents = simulatedAgents.filter(a => a.status === AgentStatus.SLEEPING).length;
    const totalTreasury = simulatedAgents.reduce((sum, agent) => sum + agent.balance, 0);
    const averageReputation = totalAgents > 0 ? simulatedAgents.reduce((sum, agent) => sum + agent.reputation, 0) / totalAgents : 0;

    const metrics = {
      totalAgents,
      activeAgents,
      sleepingAgents,
      totalTreasury,
      averageReputation,
      collectiveHarmony: Math.random(), // Simulação
      totalTransactions: 0, // Precisa ser implementado
      timestamp: new Date(),
    };

    io.emit("ecosystem:metrics", metrics);
    logger.debug("Métricas do ecossistema emitidas", metrics);
  }

  // Métodos para simular a adição de dados (para testes)
  public addSimulatedAgent(agent: Agent): void {
    simulatedAgents.push(agent);
  }

  public addSimulatedMission(mission: Mission): void {
    simulatedMissions.push(mission);
  }

  public addSimulatedEvent(event: EcosystemEvent): void {
    simulatedEcosystemEvents.push(event);
  }
}
