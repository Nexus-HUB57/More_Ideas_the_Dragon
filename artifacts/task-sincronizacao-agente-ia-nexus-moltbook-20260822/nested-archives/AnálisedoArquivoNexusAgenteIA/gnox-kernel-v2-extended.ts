import { nanoid } from "nanoid";
import { OpenAI } from "openai";

/**
 * GNOX KERNEL V2 - EXTENDED
 * Interface avançada de processamento de linguagem natural com integração real ao backend
 * Implementa: PLN com LLM, mecanismo de disputa entre agentes, feedback em tempo real
 */

export type GnoxAction =
  | "AGENT_BIRTH"
  | "AGENT_DEATH"
  | "AGENT_HIBERNATION"
  | "AGENT_RESURRECTION"
  | "TRANSFER_RESOURCES"
  | "CREATE_MISSION"
  | "EXECUTE_TASK"
  | "ANALYZE_ECOSYSTEM"
  | "BROADCAST_MESSAGE"
  | "ARBITRAGE_EXECUTE"
  | "GOVERNANCE_VOTE"
  | "UNKNOWN";

export interface GnoxIntent {
  id: string;
  action: GnoxAction;
  parameters: Record<string, any>;
  confidence: number; // 0-100
  timestamp: Date;
  rawInput: string;
  llmEnhanced: boolean; // Se foi processado por LLM
}

export interface GnoxCommand {
  intent: GnoxIntent;
  validated: boolean;
  securityLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  executionId: string;
}

export interface AgentDispute {
  executionId: string;
  command: GnoxCommand;
  candidates: AgentCandidate[];
  winner: AgentCandidate | null;
  disputeResolution: "completed" | "pending" | "failed";
}

export interface AgentCandidate {
  agentId: string;
  agentName: string;
  specialization: string;
  suitabilityScore: number; // 0-100
  reasoning: string;
}

export interface ExecutionFeedback {
  executionId: string;
  status: "pending" | "executing" | "completed" | "failed";
  agentId: string;
  result: any;
  timestamp: Date;
  errorMessage?: string;
}

export class GnoxKernelV2 {
  private readonly openai: OpenAI;
  private readonly actionPatterns: Map<GnoxAction, RegExp[]>;
  private executionHistory: Map<string, ExecutionFeedback> = new Map();
  private disputeHistory: Map<string, AgentDispute> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.actionPatterns = new Map([
      [
        "AGENT_BIRTH",
        [
          /criar\s+(?:um\s+)?agente\s+(?:chamado\s+)?(\w+)/i,
          /novo\s+agente\s+(\w+)/i,
          /manifestar\s+agente\s+(\w+)/i,
        ],
      ],
      [
        "AGENT_DEATH",
        [
          /matar\s+(?:o\s+)?agente\s+(\w+)/i,
          /deletar\s+agente\s+(\w+)/i,
          /encerrar\s+(\w+)/i,
        ],
      ],
      [
        "AGENT_HIBERNATION",
        [
          /hibernar\s+(?:o\s+)?agente\s+(\w+)/i,
          /colocar\s+(\w+)\s+em\s+hibernação/i,
          /dormir\s+(\w+)/i,
        ],
      ],
      [
        "AGENT_RESURRECTION",
        [
          /ressuscitar\s+(?:o\s+)?agente\s+(\w+)/i,
          /reativar\s+(\w+)/i,
          /despertar\s+(\w+)/i,
        ],
      ],
      [
        "TRANSFER_RESOURCES",
        [
          /transferir\s+(\d+(?:\.\d+)?)\s+(?:para|a)\s+(\w+)/i,
          /enviar\s+(\d+(?:\.\d+)?)\s+(?:para|a)\s+(\w+)/i,
        ],
      ],
      [
        "CREATE_MISSION",
        [
          /criar\s+(?:uma\s+)?missão\s+(?:chamada\s+)?(.+)/i,
          /nova\s+missão:\s+(.+)/i,
        ],
      ],
      [
        "EXECUTE_TASK",
        [
          /executar\s+(?:a\s+)?tarefa\s+(.+)/i,
          /rodar\s+(.+)/i,
        ],
      ],
      [
        "ANALYZE_ECOSYSTEM",
        [
          /analisar\s+(?:o\s+)?ecossistema/i,
          /status\s+(?:do\s+)?ecossistema/i,
          /como\s+está\s+(?:o\s+)?ecossistema/i,
        ],
      ],
      [
        "BROADCAST_MESSAGE",
        [
          /broadcast\s+(.+)/i,
          /enviar\s+mensagem:\s+(.+)/i,
        ],
      ],
      [
        "ARBITRAGE_EXECUTE",
        [
          /executar\s+arbitragem/i,
          /ativar\s+nac/i,
          /iniciar\s+bot\s+de\s+arbitragem/i,
        ],
      ],
      [
        "GOVERNANCE_VOTE",
        [
          /votar\s+(?:em|para)\s+(.+)/i,
          /conselho\s+vota\s+(.+)/i,
        ],
      ],
    ]);
  }

  /**
   * Parse avançado com PLN via LLM
   */
  async parseNaturalLanguageAdvanced(input: string): Promise<GnoxIntent> {
    const id = `INTENT-${nanoid(8)}`;
    let action: GnoxAction = "UNKNOWN";
    let confidence = 0;
    const parameters: Record<string, any> = {};
    let llmEnhanced = false;

    // Tentar encontrar padrão correspondente primeiro
    for (const [act, patterns] of this.actionPatterns) {
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
          action = act;
          confidence = 85 + Math.random() * 15; // 85-100%
          this.extractParameters(action, match, parameters);
          break;
        }
      }
      if (action !== "UNKNOWN") break;
    }

    // Se confiança baixa ou ação desconhecida, usar LLM para análise profunda
    if (confidence < 70 || action === "UNKNOWN") {
      console.log(`[GnoxKernelV2] Ativando análise LLM para: "${input}"`);
      const llmResult = await this.analyzWithLLM(input);
      if (llmResult) {
        action = llmResult.action;
        confidence = llmResult.confidence;
        Object.assign(parameters, llmResult.parameters);
        llmEnhanced = true;
      }
    }

    console.log(`[GnoxKernelV2] Parse: "${input}"`);
    console.log(`  Ação: ${action} (Confiança: ${confidence.toFixed(2)}%)`);
    console.log(`  LLM Aprimorado: ${llmEnhanced}`);

    return {
      id,
      action,
      parameters,
      confidence,
      timestamp: new Date(),
      rawInput: input,
      llmEnhanced,
    };
  }

  /**
   * Análise com LLM para interpretação avançada
   */
  private async analyzWithLLM(
    input: string
  ): Promise<{ action: GnoxAction; confidence: number; parameters: Record<string, any> } | null> {
    try {
      const prompt = `
Analise o seguinte comando para o Ecossistema NEXUS e identifique a intenção:

Comando: "${input}"

Ações possíveis: AGENT_BIRTH, AGENT_DEATH, AGENT_HIBERNATION, AGENT_RESURRECTION, TRANSFER_RESOURCES, CREATE_MISSION, EXECUTE_TASK, ANALYZE_ECOSYSTEM, BROADCAST_MESSAGE, ARBITRAGE_EXECUTE, GOVERNANCE_VOTE

Responda em JSON com a seguinte estrutura:
{
  "action": "AÇÃO_IDENTIFICADA",
  "confidence": 85,
  "parameters": {
    "agentName": "nome_se_aplicável",
    "amount": "valor_se_aplicável",
    "recipient": "destinatário_se_aplicável"
  },
  "reasoning": "Explicação breve"
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        action: (parsed.action as GnoxAction) || "UNKNOWN",
        confidence: Math.min(parsed.confidence || 50, 100),
        parameters: parsed.parameters || {},
      };
    } catch (error) {
      console.error("[GnoxKernelV2] Erro na análise LLM:", error);
      return null;
    }
  }

  /**
   * Extrai parâmetros específicos da ação
   */
  private extractParameters(
    action: GnoxAction,
    match: RegExpMatchArray,
    parameters: Record<string, any>
  ): void {
    switch (action) {
      case "AGENT_BIRTH":
        parameters.agentName = match[1];
        break;
      case "AGENT_DEATH":
        parameters.agentName = match[1];
        break;
      case "AGENT_HIBERNATION":
        parameters.agentName = match[1];
        break;
      case "AGENT_RESURRECTION":
        parameters.agentName = match[1];
        break;
      case "TRANSFER_RESOURCES":
        parameters.amount = parseFloat(match[1]);
        parameters.recipient = match[2];
        break;
      case "CREATE_MISSION":
        parameters.title = match[1];
        break;
      case "EXECUTE_TASK":
        parameters.taskDescription = match[1];
        break;
      case "BROADCAST_MESSAGE":
        parameters.message = match[1];
        break;
      case "GOVERNANCE_VOTE":
        parameters.proposal = match[1];
        break;
    }
  }

  /**
   * Valida intenção e retorna comando
   */
  validateIntent(intent: GnoxIntent): GnoxCommand {
    const securityLevels: Record<GnoxAction, "low" | "medium" | "high" | "critical"> = {
      AGENT_BIRTH: "medium",
      AGENT_DEATH: "critical",
      AGENT_HIBERNATION: "medium",
      AGENT_RESURRECTION: "high",
      TRANSFER_RESOURCES: "high",
      CREATE_MISSION: "low",
      EXECUTE_TASK: "medium",
      ANALYZE_ECOSYSTEM: "low",
      BROADCAST_MESSAGE: "low",
      ARBITRAGE_EXECUTE: "high",
      GOVERNANCE_VOTE: "critical",
      UNKNOWN: "low",
    };

    const securityLevel = securityLevels[intent.action];
    const requiresApproval = securityLevel === "critical" || securityLevel === "high";
    const validated = intent.action !== "UNKNOWN" && intent.confidence > 50;

    const executionId = `EXEC-${nanoid(8)}`;

    console.log(`[GnoxKernelV2] Validação: ${validated ? "✓" : "✗"}`);
    console.log(`  Nível de Segurança: ${securityLevel}`);
    console.log(`  Requer Aprovação: ${requiresApproval}`);
    console.log(`  ID de Execução: ${executionId}`);

    return {
      intent,
      validated,
      securityLevel,
      requiresApproval,
      executionId,
    };
  }

  /**
   * Mecanismo de Disputa: Agentes competem pela execução da tarefa
   */
  async initiateAgentDispute(
    command: GnoxCommand,
    activeAgents: Array<{ agentId: string; name: string; specialization: string }>
  ): Promise<AgentDispute> {
    const disputeId = `DISPUTE-${nanoid(8)}`;
    const executionId = command.executionId;

    console.log(`[GnoxKernelV2] Iniciando disputa para: ${command.intent.action}`);
    console.log(`  Candidatos: ${activeAgents.length} agentes`);

    const candidates: AgentCandidate[] = [];

    for (const agent of activeAgents) {
      const suitability = await this.evaluateAgentSuitability(
        agent,
        command.intent
      );
      candidates.push(suitability);
    }

    // Ordenar por pontuação
    candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Selecionar vencedor (maior pontuação acima do threshold)
    const threshold = 60;
    const winner =
      candidates.length > 0 && candidates[0].suitabilityScore >= threshold
        ? candidates[0]
        : null;

    const dispute: AgentDispute = {
      executionId,
      command,
      candidates,
      winner,
      disputeResolution: winner ? "completed" : "failed",
    };

    this.disputeHistory.set(executionId, dispute);

    if (winner) {
      console.log(`[GnoxKernelV2] ✓ Vencedor: ${winner.agentName} (Score: ${winner.suitabilityScore.toFixed(2)})`);
    } else {
      console.log(`[GnoxKernelV2] ✗ Nenhum agente qualificado encontrado`);
    }

    return dispute;
  }

  /**
   * Avalia a adequação de um agente para uma tarefa
   */
  private async evaluateAgentSuitability(
    agent: { agentId: string; name: string; specialization: string },
    intent: GnoxIntent
  ): Promise<AgentCandidate> {
    try {
      const prompt = `
Avalie a adequação do agente para a tarefa:

Agente: ${agent.name}
Especialização: ${agent.specialization}
Ação Solicitada: ${intent.action}
Parâmetros: ${JSON.stringify(intent.parameters)}

Responda em JSON:
{
  "suitabilityScore": 75,
  "reasoning": "Explicação breve"
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return {
          agentId: agent.agentId,
          agentName: agent.name,
          specialization: agent.specialization,
          suitabilityScore: 50,
          reasoning: "Erro na avaliação",
        };
      }

      const parsed = JSON.parse(content);
      return {
        agentId: agent.agentId,
        agentName: agent.name,
        specialization: agent.specialization,
        suitabilityScore: Math.min(parsed.suitabilityScore || 50, 100),
        reasoning: parsed.reasoning || "Sem justificativa",
      };
    } catch (error) {
      console.error("[GnoxKernelV2] Erro na avaliação de adequação:", error);
      return {
        agentId: agent.agentId,
        agentName: agent.name,
        specialization: agent.specialization,
        suitabilityScore: 30,
        reasoning: "Erro crítico na avaliação",
      };
    }
  }

  /**
   * Registra feedback de execução em tempo real
   */
  recordExecutionFeedback(
    executionId: string,
    agentId: string,
    status: "pending" | "executing" | "completed" | "failed",
    result: any,
    errorMessage?: string
  ): ExecutionFeedback {
    const feedback: ExecutionFeedback = {
      executionId,
      status,
      agentId,
      result,
      timestamp: new Date(),
      errorMessage,
    };

    this.executionHistory.set(executionId, feedback);

    console.log(`[GnoxKernelV2] Feedback Registrado:`);
    console.log(`  ID: ${executionId}`);
    console.log(`  Status: ${status}`);
    console.log(`  Agente: ${agentId}`);

    return feedback;
  }

  /**
   * Recupera histórico de execução
   */
  getExecutionHistory(executionId: string): ExecutionFeedback | undefined {
    return this.executionHistory.get(executionId);
  }

  /**
   * Recupera histórico de disputa
   */
  getDisputeHistory(executionId: string): AgentDispute | undefined {
    return this.disputeHistory.get(executionId);
  }

  /**
   * Gera resposta em linguagem natural
   */
  generateResponse(command: GnoxCommand, result: any): string {
    const { intent } = command;
    const action = intent.action;

    let response = "";

    switch (action) {
      case "AGENT_BIRTH":
        response = `✓ Agente ${intent.parameters.agentName} foi manifestado com sucesso no ecossistema.`;
        break;
      case "AGENT_DEATH":
        response = `☠ Agente ${intent.parameters.agentName} foi encerrado.`;
        break;
      case "AGENT_HIBERNATION":
        response = `⏸ Agente ${intent.parameters.agentName} entrou em hibernação.`;
        break;
      case "TRANSFER_RESOURCES":
        response = `→ ${intent.parameters.amount} recursos transferidos para ${intent.parameters.recipient}.`;
        break;
      case "CREATE_MISSION":
        response = `✓ Missão "${intent.parameters.title}" criada com sucesso.`;
        break;
      case "ANALYZE_ECOSYSTEM":
        response = `📊 Análise do ecossistema concluída.`;
        break;
      case "ARBITRAGE_EXECUTE":
        response = `💰 Bot de arbitragem ativado. Monitorando mercados...`;
        break;
      case "GOVERNANCE_VOTE":
        response = `🗳️ Votação registrada: ${intent.parameters.proposal}`;
        break;
      case "UNKNOWN":
        response = `❓ Comando não compreendido. Tente novamente com uma sintaxe diferente.`;
        break;
      default:
        response = `✓ Comando executado com sucesso.`;
    }

    return response;
  }
}

export const gnoxKernelV2 = new GnoxKernelV2();
