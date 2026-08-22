/**
 * Nexus Hub - Nexus Engine
 * O motor principal que orquestra a execução periódica de todos os sistemas,
 * incluindo o BrainPulse, VitalLoop, e outros.
 */

import { logger } from "../utils/logger";
import { BrainPulse } from "./brain_pulse";

class NexusEngine {
  private brainPulse: BrainPulse;
  private isRunning: boolean = false;

  constructor() {
    this.brainPulse = new BrainPulse(5000); // Pulso a cada 5 segundos
    // Outros sistemas (VitalLoop, etc.) seriam inicializados aqui
  }

  public start(): void {
    if (this.isRunning) {
      logger.warn("Nexus Engine já está em execução.");
      return;
    }

    logger.info("Iniciando o Nexus Engine...");
    this.brainPulse.start();
    // Iniciar outros sistemas

    this.isRunning = true;
  }

  public stop(): void {
    if (!this.isRunning) {
      logger.warn("Nexus Engine não está em execução.");
      return;
    }

    logger.info("Parando o Nexus Engine...");
    this.brainPulse.stop();
    // Parar outros sistemas

    this.isRunning = false;
  }

  // Método para obter a instância do BrainPulse para testes ou integrações
  public getBrainPulse(): BrainPulse {
    return this.brainPulse;
  }
}

export const nexusEngine = new NexusEngine();
