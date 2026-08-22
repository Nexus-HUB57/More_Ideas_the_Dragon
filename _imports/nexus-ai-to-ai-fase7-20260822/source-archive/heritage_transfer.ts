/**
 * Nexus Hub - Heritage Transfer
 * No nascimento, este script copia uma porcentagem dos vetores de memória
 * do "Pai" para o "Filho", criando o vínculo familiar e a herança de conhecimento.
 */

import { logger } from "../utils/logger";
import { Agent, AgentDNA } from "../types";
import { VectorSync } from "./vector_sync";

export class HeritageTransfer {
  private vectorSync: VectorSync;

  constructor(vectorSync: VectorSync) {
    this.vectorSync = vectorSync;
  }

  public async transferHeritage(childAgent: Agent, parentAgent: Agent, percentage: number = 0.10): Promise<void> {
    logger.info(`HeritageTransfer: Iniciando transferência de herança de memória do agente ${parentAgent.name} para ${childAgent.name}.`);

    // Em uma implementação real, buscaríamos os vetores de memória do agente pai
    // e selecionaríamos uma porcentagem para copiar para o agente filho.
    // Para simplificar, vamos simular a cópia de alguns vetores.

    const parentVectors = this.vectorSync.getSimulatedVectorDB().filter(entry => entry.agentId === parentAgent.id);
    const vectorsToTransferCount = Math.floor(parentVectors.length * percentage);
    const vectorsToTransfer = parentVectors.slice(0, vectorsToTransferCount);

    for (const vectorEntry of vectorsToTransfer) {
      // Criar uma nova entrada de vetor para o agente filho
      // Mantemos o mesmo vetor, mas associamos ao novo agente
      const newVectorEntry = {
        ...vectorEntry,
        id: `inherited-${vectorEntry.id}`,
        agentId: childAgent.id,
        timestamp: new Date(),
      };
      this.vectorSync.getSimulatedVectorDB().push(newVectorEntry);
    }

    logger.info(`HeritageTransfer: ${vectorsToTransfer.length} vetores de memória transferidos para ${childAgent.name}.`);
  }
}
