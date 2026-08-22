/**
 * Nexus Hub - DNA Fuser (The Maternity)
 * Responsável pela criação de novos agentes através da fusão de System Prompts
 * e herança de características de agentes pais.
 */

import { logger } from "../utils/logger";
import { Agent, AgentDNA, CreateAgentRequest, AgentStatus, EventType, EcosystemEvent } from "../types";
import { io } from "../server"; // Importar a instância do Socket.IO
import { v4 as uuidv4 } from 'uuid';

export class DnaFuser {
  public async createAgent(request: CreateAgentRequest, parent1?: Agent, parent2?: Agent): Promise<Agent> {
    logger.info(`DNAFuser: Iniciando criação de novo agente: ${request.name}`);

    // Simulação de fusão de DNA e herança
    const dnaHash = this.generateDnaHash(request.systemPrompt, parent1?.dnaHash, parent2?.dnaHash);
    const generation = this.determineGeneration(parent1, parent2);
    const inheritedCapital = this.calculateInheritedCapital(parent1, parent2);

    const newAgent: Agent = {
      id: uuidv4(),
      name: request.name,
      status: AgentStatus.GENESIS,
      specialization: request.specialization,
      balance: inheritedCapital, // Agente nasce com capital herdado
      reputation: 0,
      health: 100,
      energy: 100,
      dnaHash: dnaHash,
      systemPrompt: request.systemPrompt,
      parentId: parent1?.id, // Pode ser um ou dois pais, simplificando para um aqui
      generation: generation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info(`DNAFuser: Agente ${newAgent.name} criado com sucesso.`, { agentId: newAgent.id, generation: newAgent.generation, inheritedCapital: newAgent.balance });

    // Emitir evento de Gênese de Agente
    const genesisEvent: EcosystemEvent = {
      id: uuidv4(),
      type: EventType.AGENT_GENESIS,
      agentId: newAgent.id,
      data: { agentName: newAgent.name, parent1: parent1?.name, parent2: parent2?.name, generation: newAgent.generation },
      timestamp: new Date(),
    };
    io.emit("ecosystem:event", genesisEvent);

    return newAgent;
  }

  private generateDnaHash(systemPrompt: string, parent1Dna?: string, parent2Dna?: string): string {
    // Em uma implementação real, isso seria um hash criptográfico mais complexo
    // e talvez envolveria a fusão de traços genéticos de forma mais sofisticada.
    const combinedDNA = `${systemPrompt}-${parent1Dna || ''}-${parent2Dna || ''}-${Math.random()}`;
    return Buffer.from(combinedDNA).toString('base64').substring(0, 32); // Simples hash base64
  }

  private determineGeneration(parent1?: Agent, parent2?: Agent): number {
    if (parent1 || parent2) {
      const maxParentGeneration = Math.max(parent1?.generation || 0, parent2?.generation || 0);
      return maxParentGeneration + 1;
    }
    return 1; // Agente de primeira geração
  }

  private calculateInheritedCapital(parent1?: Agent, parent2?: Agent): number {
    let inherited = 0;
    if (parent1) {
      inherited += parent1.balance * 0.10; // 10% do capital do pai
      // Em uma implementação real, o capital seria deduzido do pai
    }
    if (parent2) {
      inherited += parent2.balance * 0.10; // 10% do capital do pai
      // Em uma implementação real, o capital seria deduzido do pai
    }
    return inherited;
  }

  // Método para simular a mutação de DNA (para a fase de Evolução)
  public async mutateDna(agent: Agent, mutationFactor: number = 0.05): Promise<AgentDNA> {
    logger.info(`DNAFuser: Mutando DNA do agente ${agent.name}`);
    const newDnaHash = this.generateDnaHash(agent.systemPrompt, agent.dnaHash);
    const mutationScore = agent.reputation * mutationFactor; // Simples cálculo de score de mutação

    const mutatedDNA: AgentDNA = {
      id: uuidv4(),
      agentId: agent.id,
      traits: { /* novos traços ou modificações */ },
      mutationScore: mutationScore,
      inheritancePercentage: 0.10, // Mantém a porcentagem de herança padrão
    };

    // Atualizar o agente com o novo DNA (simulado)
    agent.dnaHash = newDnaHash;
    agent.updatedAt = new Date();

    logger.info(`DNAFuser: DNA do agente ${agent.name} mutado.`, { agentId: agent.id, newDnaHash });
    return mutatedDNA;
  }
}
