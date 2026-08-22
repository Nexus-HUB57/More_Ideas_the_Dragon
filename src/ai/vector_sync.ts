/**
 * Nexus Hub - Vector Sync (The Soul Vault)
 * Simula a conexão do agente a um banco de dados de vetores (e.g., Pinecone)
 * para transformar interações em vetores e armazená-los para consulta futura.
 */

import { logger } from "../utils/logger";
import { Agent, EcosystemEvent, MoltbookPost } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Simulação de um banco de dados de vetores
interface VectorEntry {
  id: string;
  agentId: string;
  vector: number[]; // Representação simplificada de um vetor
  sourceId: string; // ID da interação original (post, evento, etc.)
  sourceType: string;
  timestamp: Date;
}

const simulatedVectorDB: VectorEntry[] = [];

export class VectorSync {
  public async syncInteraction(agent: Agent, interaction: MoltbookPost | EcosystemEvent): Promise<VectorEntry> {
    logger.info(`VectorSync: Sincronizando interação para o agente ${agent.name}.`);

    // Em uma implementação real, um LLM ou um modelo de embedding geraria o vetor
    // a partir do conteúdo da interação. Aqui, simulamos um vetor simples.
    const vector = this.generateSimulatedVector(interaction);

    const vectorEntry: VectorEntry = {
      id: uuidv4(),
      agentId: agent.id,
      vector: vector,
      sourceId: interaction.id,
      sourceType: (interaction as MoltbookPost).content ? 'MoltbookPost' : 'EcosystemEvent',
      timestamp: new Date(),
    };

    simulatedVectorDB.push(vectorEntry);
    logger.debug(`VectorSync: Interação sincronizada e vetor armazenado.`, { agentId: agent.id, vectorId: vectorEntry.id });
    return vectorEntry;
  }

  public async retrieveSimilarVectors(agentId: string, queryVector: number[], limit: number = 5): Promise<VectorEntry[]> {
    logger.info(`VectorSync: Recuperando vetores similares para o agente ${agentId}.`);

    // Simula a busca por similaridade (e.g., cosseno) no banco de dados de vetores
    // Em uma implementação real, isso seria uma consulta otimizada no Pinecone ou similar.
    const relevantVectors = simulatedVectorDB
      .filter(entry => entry.agentId === agentId)
      .sort((a, b) => this.cosineSimilarity(queryVector, b.vector) - this.cosineSimilarity(queryVector, a.vector))
      .slice(0, limit);

    logger.debug(`VectorSync: ${relevantVectors.length} vetores similares encontrados.`, { agentId });
    return relevantVectors;
  }

  private generateSimulatedVector(interaction: MoltbookPost | EcosystemEvent): number[] {
    // Gera um vetor simples baseado no comprimento do conteúdo ou tipo de evento
    const seed = (interaction as MoltbookPost).content?.length || (interaction as EcosystemEvent).type.length;
    return Array.from({ length: 10 }, (_, i) => (seed + i) % 100);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Método para obter o DB simulado (para testes)
  public getSimulatedVectorDB(): VectorEntry[] {
    return simulatedVectorDB;
  }
}
