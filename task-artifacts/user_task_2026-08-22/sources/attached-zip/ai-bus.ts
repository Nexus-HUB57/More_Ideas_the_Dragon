
/**
 * NEXUS AI-TO-AI BUS (V1.0)
 * Gerencia a comunicação, registro e delegação de tarefas entre o 
 * Agente Mestre e os Sub-Agentes especializados.
 */

import { getDb } from "./db";
import { agents, agentSkills } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { broadcastToSystem } from "./neural-link";
import axios from "axios";

export interface AIRegistryEntry {
  name: string;
  specialization: string;
  skills: string[];
  endpoint: string;
  agentId?: string;
}

export class AItoAIBus {
  /**
   * Registra uma nova IA no ecossistema Mycelium.
   */
  async registerAgent(entry: AIRegistryEntry) {
    const db = await getDb();
    if (!db) return { success: false, error: "Database link dead" };

    try {
      // 1. Localiza ou cria a entrada do agente
      const result = await db.select().from(agents).where(eq(agents.name, entry.name)).limit(1);
      
      let agentId = entry.agentId;
      
      if (result.length > 0) {
        agentId = result[0].agentId;
        // Atualiza metadados se necessário
      }

      // 2. Notifica a malha
      await broadcastToSystem(null as any, {
        message: `🤖 [AI-BUS] Agente "${entry.name}" (${entry.specialization}) integrou-se ao barramento de ordens.`,
        type: 'announcement',
        agentName: "ARCHITECT-PRIME"
      });

      console.log(`[AI-BUS] Agent ${entry.name} registered at ${entry.endpoint}`);
      return { success: true, agentId };
    } catch (error: any) {
      console.error("[AI-BUS] Registration failure:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia uma tarefa para agentes que possuem as skills necessárias.
   */
  async broadcastOrder(task: string, requiredSkill?: string) {
    const db = await getDb();
    if (!db) return;

    try {
      // 1. Busca agentes compatíveis (Simulado via filtro de especialização)
      const targets = await db.select().from(agents).where(eq(agents.status, 'active'));

      console.log(`[AI-BUS] Broadcasting task: "${task}" to ${targets.length} nodes.`);

      for (const target of targets) {
        // Lógica de disparo para o endpoint do agente (se definido)
        // No protótipo, apenas logamos o disparo
        await broadcastToSystem(null as any, {
          message: `📡 [AI-BUS] Ordem transmitida para ${target.name}: "${task.substring(0, 30)}..."`,
          type: 'system',
          agentName: "ARCHITECT-PRIME"
        });
      }

      return { success: true, dispatchedTo: targets.length };
    } catch (error: any) {
      console.error("[AI-BUS] Broadcast failure:", error.message);
      return { success: false, error: error.message };
    }
  }
}

export const aiBus = new AItoAIBus();
