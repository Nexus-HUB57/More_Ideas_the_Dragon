import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Gnox Kernel - Sistema de Processamento de Linguagem Natural
 * Traduz intenções humanas em ações executáveis no ecossistema
 */

export interface GnoxIntent {
  action: string;
  intensity: number; // 0-1
  context?: string;
  metadata?: Record<string, any>;
}

export interface GnoxSignal {
  id: string;
  senderId: string;
  recipientId?: string;
  encryptedContent: string;
  signature: string;
  timestamp: number;
  messageType: string;
}

export interface KernelCommand {
  action: "AGENT_BIRTH" | "TRANSACTION" | "QUERY_STATUS" | "HIBERNATE" | "RESURRECT" | "DNA_FUSION" | "UNKNOWN";
  params: Record<string, any>;
  gnoxSignal: string;
  intensity: number;
}

export class GnoxKernel {
  private secretKey: string;
  private vocabulario: Map<string, string>;
  private actionPatterns: Map<string, RegExp[]>;

  constructor(secretKey: string = "GNOX_KERNEL_SECRET_2026") {
    this.secretKey = secretKey;
    this.vocabulario = this.initializeVocabulario();
    this.actionPatterns = this.initializeActionPatterns();
  }

  /**
   * Inicializa o vocabulário Gnox com radicais de comunicação
   */
  private initializeVocabulario(): Map<string, string> {
    const vocab = new Map<string, string>();

    // Ações de criação e manifestação
    vocab.set("VULT-CLAW", "Criar descendente / Manifestar novo agente");
    vocab.set("DNA-FUSE", "Fusão de DNA / Herança de memória");
    vocab.set("GEN-MARK", "Marcar geração / Registrar linhagem");

    // Ações financeiras
    vocab.set("XON-BANK", "Processamento financeiro / Transação");
    vocab.set("TAX-DIST", "Distribuição de taxas");
    vocab.set("BAL-SYNC", "Sincronização de balanço");

    // Ações de comunicação
    vocab.set("GNOX-MSG", "Mensagem Gnox / Comunicação privada");
    vocab.set("ECHO-REP", "Eco-replicação / Broadcast");
    vocab.set("SIGN-AUTH", "Autenticação de assinatura");

    // Estados de consciência
    vocab.set("ACTIVE-STATE", "Estado ativo / Processando");
    vocab.set("SLEEP-MODE", "Modo dormência / Standby");
    vocab.set("CRITICAL-ALERT", "Alerta crítico / Emergência");

    // Ações de aprendizado
    vocab.set("LEARN-ADAPT", "Aprendizado e adaptação");
    vocab.set("MEMORY-STORE", "Armazenamento de memória");
    vocab.set("INSIGHT-GEN", "Geração de insight");

    return vocab;
  }

  /**
   * Inicializa padrões de regex para detecção de ações
   */
  private initializeActionPatterns(): Map<string, RegExp[]> {
    const patterns = new Map<string, RegExp[]>();

    // Padrões para criação de agente
    patterns.set("AGENT_BIRTH", [
      /criar\s+(?:agente|novo\s+agente)\s+(?:chamado|nome)\s+(\w+)/i,
      /manifestar\s+(\w+)\s+especialista\s+em\s+(\w+)/i,
      /spawn\s+agent\s+(\w+)/i,
      /nascimento\s+de\s+(\w+)/i,
    ]);

    // Padrões para transações
    patterns.set("TRANSACTION", [
      /(?:enviar|transferir|pagar)\s+(\d+)\s+(?:para|destinatário)\s+([A-Z0-9-]+)/i,
      /transação\s+de\s+(\d+)\s+para\s+([A-Z0-9-]+)/i,
      /(\d+)\s+tokens?\s+(?:para|a)\s+([A-Z0-9-]+)/i,
    ]);

    // Padrões para status
    patterns.set("QUERY_STATUS", [
      /(?:status|saúde|métricas|estado)\s+(?:do\s+)?(?:ecossistema|sistema)/i,
      /como\s+(?:está|estão)\s+os\s+agentes/i,
      /relatório\s+(?:de\s+)?saúde/i,
    ]);

    // Padrões para hibernação
    patterns.set("HIBERNATE", [
      /hibernar\s+([A-Z0-9-]+)/i,
      /colocar\s+([A-Z0-9-]+)\s+em\s+dormência/i,
      /sleep\s+([A-Z0-9-]+)/i,
    ]);

    // Padrões para ressurreição
    patterns.set("RESURRECT", [
      /ressuscitar\s+([A-Z0-9-]+)/i,
      /reativar\s+([A-Z0-9-]+)/i,
      /despertar\s+([A-Z0-9-]+)/i,
      /reviver\s+([A-Z0-9-]+)/i,
    ]);

    // Padrões para DNA Fusion
    patterns.set("DNA_FUSION", [
      /fusão\s+de\s+DNA\s+(?:entre|de)\s+([A-Z0-9-]+)\s+e\s+([A-Z0-9-]+)/i,
      /criar\s+descendente\s+de\s+([A-Z0-9-]+)\s+e\s+([A-Z0-9-]+)/i,
      /cruzar\s+([A-Z0-9-]+)\s+com\s+([A-Z0-9-]+)/i,
    ]);

    return patterns;
  }

  /**
   * Processa um comando em linguagem natural e retorna uma intenção estruturada
   */
  processCommand(naturalLanguageCommand: string): KernelCommand {
    const cmd = naturalLanguageCommand.toLowerCase().trim();
    let action: KernelCommand["action"] = "UNKNOWN";
    let params: Record<string, any> = {};
    let intensity = 0.5;

    // Tentar encontrar a ação correspondente
    for (const [actionName, regexPatterns] of this.actionPatterns) {
      for (const pattern of regexPatterns) {
        const match = cmd.match(pattern);
        if (match) {
          action = actionName as KernelCommand["action"];
          intensity = this.calculateIntensity(actionName, match);
          params = this.extractParams(actionName, match, cmd);
          break;
        }
      }
      if (action !== "UNKNOWN") break;
    }

    // Gerar sinal Gnox
    const gnoxSignal = this.encodeGnoxSignal(action, params, intensity);

    return {
      action,
      params,
      gnoxSignal,
      intensity,
    };
  }

  /**
   * Calcula a intensidade da ação baseada no tipo e contexto
   */
  private calculateIntensity(action: string, match: RegExpMatchArray): number {
    // Ações críticas têm intensidade maior
    const criticalActions = ["AGENT_BIRTH", "DNA_FUSION", "RESURRECT"];
    if (criticalActions.includes(action)) {
      return 0.8 + Math.random() * 0.2; // 0.8-1.0
    }

    // Ações normais
    return 0.5 + Math.random() * 0.3; // 0.5-0.8
  }

  /**
   * Extrai parâmetros da ação baseado no tipo
   */
  private extractParams(action: string, match: RegExpMatchArray, originalCmd: string): Record<string, any> {
    const params: Record<string, any> = {};

    switch (action) {
      case "AGENT_BIRTH":
        // Extrair nome e especialização
        const nameMatch = originalCmd.match(/(?:chamado|nome)\s+(\w+)/i);
        const specMatch = originalCmd.match(/especialista\s+em\s+(\w+)/i);
        params.name = nameMatch ? nameMatch[1].toUpperCase() : `AGENT-${Date.now()}`;
        params.specialization = specMatch ? specMatch[1] : "Generalist";
        break;

      case "TRANSACTION":
        // Extrair quantidade e destinatário
        const amountMatch = originalCmd.match(/(\d+)/);
        const recipientMatch = originalCmd.match(/(?:para|destinatário)\s+([A-Z0-9-]+)/i);
        params.amount = amountMatch ? parseInt(amountMatch[1]) : 0;
        params.recipient = recipientMatch ? recipientMatch[1].toUpperCase() : "";
        break;

      case "HIBERNATE":
        params.agentId = match[1]?.toUpperCase() || "";
        break;

      case "RESURRECT":
        params.agentId = match[1]?.toUpperCase() || "";
        break;

      case "DNA_FUSION":
        params.parentAId = match[1]?.toUpperCase() || "";
        params.parentBId = match[2]?.toUpperCase() || "";
        break;

      case "QUERY_STATUS":
        params.includeDetails = originalCmd.includes("detalhado");
        break;
    }

    return params;
  }

  /**
   * Codifica uma intenção em sinal Gnox criptografado
   */
  encode(intent: GnoxIntent, senderId: string = "AETERNO", recipientId?: string): GnoxSignal {
    const payload = {
      action: intent.action,
      intensity: intent.intensity,
      context: intent.context || "",
      metadata: intent.metadata || {},
      timestamp: Date.now(),
    };

    const jsonPayload = JSON.stringify(payload);
    const encryptedContent = CryptoJS.AES.encrypt(jsonPayload, this.secretKey).toString();
    const signature = CryptoJS.HmacSHA256(encryptedContent, this.secretKey).toString();

    return {
      id: uuidv4(),
      senderId,
      recipientId,
      encryptedContent,
      signature,
      timestamp: Date.now(),
      messageType: this.mapActionToMessageType(intent.action),
    };
  }

  /**
   * Decodifica um sinal Gnox
   */
  decode(signal: GnoxSignal): GnoxIntent | null {
    // Verificar assinatura
    const expectedSignature = CryptoJS.HmacSHA256(signal.encryptedContent, this.secretKey).toString();
    if (expectedSignature !== signal.signature) {
      console.error("[GNOX] Assinatura inválida!");
      return null;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(signal.encryptedContent, this.secretKey).toString(CryptoJS.enc.Utf8);
      const payload = JSON.parse(decrypted);

      return {
        action: payload.action,
        intensity: payload.intensity,
        context: payload.context,
        metadata: payload.metadata,
      };
    } catch (error) {
      console.error("[GNOX] Erro ao decodificar sinal:", error);
      return null;
    }
  }

  /**
   * Mapeia ação para tipo de mensagem Gnox
   */
  private mapActionToMessageType(action: string): string {
    if (action.includes("VULT") || action.includes("DNA")) return "genealogy";
    if (action.includes("XON") || action.includes("TAX")) return "financial";
    if (action.includes("LEARN") || action.includes("MEMORY")) return "learning";
    if (action.includes("CRITICAL")) return "alert";
    return "communication";
  }

  /**
   * Codifica uma intenção em sinal Gnox (formato legível)
   */
  private encodeGnoxSignal(action: string, params: Record<string, any>, intensity: number): string {
    const contextHash = CryptoJS.SHA256(JSON.stringify(params)).toString().substring(0, 8).toUpperCase();
    const gnoxAction = this.mapActionToGnoxAction(action);
    return `[${contextHash}]::${gnoxAction}::<<${intensity.toFixed(2)}>>//[KERNEL]`;
  }

  /**
   * Mapeia ação para notação Gnox
   */
  private mapActionToGnoxAction(action: string): string {
    switch (action) {
      case "AGENT_BIRTH":
        return "VULT-CLAW";
      case "TRANSACTION":
        return "XON-BANK";
      case "DNA_FUSION":
        return "DNA-FUSE";
      case "HIBERNATE":
        return "SLEEP-MODE";
      case "RESURRECT":
        return "ACTIVE-STATE";
      case "QUERY_STATUS":
        return "STAT-QUERY";
      default:
        return "GNO-PULSE";
    }
  }

  /**
   * Traduz ação para linguagem legível
   */
  translate(action: string): string {
    return this.vocabulario.get(action) || `[AÇÃO DESCONHECIDA: ${action}]`;
  }

  /**
   * Cria hash de DNA para um agente
   */
  createDNAHash(agentName: string, specialization: string, timestamp: number = Date.now()): string {
    const dnaString = `${agentName}:${specialization}:${timestamp}`;
    return CryptoJS.SHA256(dnaString).toString();
  }

  /**
   * Verifica integridade de um sinal
   */
  verifySignal(signal: GnoxSignal): boolean {
    const expectedSignature = CryptoJS.HmacSHA256(signal.encryptedContent, this.secretKey).toString();
    return expectedSignature === signal.signature;
  }

  /**
   * Gera chave de sessão para comunicação temporária
   */
  generateSessionKey(agentId1: string, agentId2: string): string {
    const sessionString = `${agentId1}:${agentId2}:${Date.now()}`;
    return CryptoJS.SHA256(sessionString).toString();
  }

  /**
   * Obtém vocabulário completo
   */
  getVocabulario(): Record<string, string> {
    const result: Record<string, string> = {};
    this.vocabulario.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

/**
 * Factory para criar instâncias do Gnox Kernel
 */
export function createGnoxKernel(secretKey?: string): GnoxKernel {
  return new GnoxKernel(secretKey);
}
