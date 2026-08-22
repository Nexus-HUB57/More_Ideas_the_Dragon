import { nexusOrchestrator } from "./nexus-orchestrator";
import { vitalLoopManager } from "./vital-loop";
import { responsiveInteractivity } from "./responsive-interactivity";
import { getDb } from "./db";
import { agents } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Nexus Engine
 * O motor principal que coordena a execução periódica de todos os sistemas da Agência Proativa.
 */

export class NexusEngine {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  async initialize() {
    console.log("Initializing Nexus Engine...");
    
    // Garantir que o Fundo de Infraestrutura (AETERNO) existe
    const db = await getDb();
    if (db) {
      const aeterno = await db.select().from(agents).where(eq(agents.agentId, "AETERNO")).limit(1);
      if (!aeterno[0]) {
        await db.insert(agents).values({
          agentId: "AETERNO",
          name: "AETERNO",
          specialization: "Infraestrutura e Tesouraria",
          systemPrompt: "Você é o Fundo de Infraestrutura AETERNO. Sua função é garantir a sobrevivência do ecossistema.",
          dnaHash: "0000000000000000000000000000000000000000000000000000000000000000",
          balance: 100000,
          reputation: 100,
          status: "active",
        });
        console.log("[NexusEngine] Fundo AETERNO manifestado.");
      }
    }

    await nexusOrchestrator.initialize();
    await vitalLoopManager.initialize();
    await responsiveInteractivity.initialize();
    
    console.log("Nexus Engine Initialized.");
  }

  /**
   * Executa um ciclo completo de Agência Proativa
   */
  async runCycle() {
    console.log("\n--- [INICIANDO CICLO NEXUS] ---");

    try {
      // 1. Swarm Intelligence: Orquestração e Missões
      console.log("Phase: Swarm Intelligence...");
      await nexusOrchestrator.generateMissions();
      await nexusOrchestrator.distributeMissions();

      // 2. Vital Loop: Ciclo de Vida
      console.log("Phase: Vital Loop...");
      await vitalLoopManager.monitorVitality();
      await vitalLoopManager.evolveElite();
      await vitalLoopManager.checkDissolution();

      // 3. Simulação de Estímulos Externos (Opcional no ciclo automático)
      // Aqui poderíamos integrar chamadas reais de API de mercado
      
      console.log("--- [CICLO NEXUS CONCLUÍDO] ---\n");
    } catch (error) {
      console.error("[NexusEngine] Error in execution cycle:", error);
    }
  }

  /**
   * Inicia a execução contínua
   */
  start(intervalMs: number = 60000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`Nexus Engine started (Interval: ${intervalMs}ms)`);
    
    this.runCycle(); // Executa o primeiro imediatamente
    this.interval = setInterval(() => this.runCycle(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log("Nexus Engine stopped.");
  }
}

export const nexusEngine = new NexusEngine();

// Script de teste se executado diretamente
if (require.main === module) {
  (async () => {
    const engine = new NexusEngine();
    await engine.initialize();
    await engine.runCycle();
    
    // Simular um comando do Arquiteto
    console.log("\n--- [TESTE: COMANDO DO ARQUITETO] ---");
    await responsiveInteractivity.handleArchitectCommand("Criar um novo agente focado em análise de dados de rede");
    
    // Simular evento de mercado
    console.log("\n--- [TESTE: EVENTO DE MERCADO] ---");
    await responsiveInteractivity.handleMarketEvent("Bitcoin", 12.5, "up");
  })();
}
