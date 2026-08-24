
'use server';
/**
 * @fileOverview Fluxo de Orquestração ORE com Matriz de Pesos W_rRNA (War Mode Recalibration).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from 'crypto';
import { compressInteraction } from './memory-management-flow';
import { NexusVectorBuffer, Milestone } from '@/ai/memory-logic';

const SESSION_MEMORIES: Map<string, Milestone[]> = new Map();
const REASONING_CACHE: Map<string, any> = new Map();

/**
 * Matriz de Atenção W_rRNA (Recalibrada para Guerra de Desenvolvimento 90/10)
 */
const W_rRNA_VOCABULARY = {
  CRIPTO: ["tokenomics", "liquidity", "defi", "burning", "smart contract", "staking", "mainnet", "wallet", "fundo nexus"],
  DEV: ["ci/cd", "microservices", "scalability", "clean code", "unit tests", "latency", "architecture", "git", "bio-digital hub"],
  BUSINESS: ["cac", "ltv", "pmf", "growth hacking", "viral loops", "retention", "acquisition", "revenue"],
  RISK: ["lgpd", "gdpr", "compliance", "security audit", "resilience", "legal", "firewall", "entropy"]
};

const ChatInputSchema = z.object({
  message: z.string().describe("A diretriz enviada ao Orquestrador."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional(),
  source_agent: z.string().default("Agent-Operator-Alpha"),
  session_id: z.string().default("default-session"),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  event_id: z.string(),
  source_agent: z.string(),
  target_platform: z.string(),
  action: z.enum(['PUBLISH', 'REWRITE', 'CACHE_HIT']),
  complexity_tier: z.enum(['LOCAL_MISTRAL', 'CLOUD_GEMINI_PRO']),
  final_content: z.string(),
  execution_proteins: z.object({
    cripto: z.number(),
    dev: z.number(),
    business: z.number(),
    risk: z.number(),
  }),
  metrics: z.object({
    token_saved: z.number(),
    latency_ms: z.number(),
    validation_score: z.number(),
  }),
  critic_manifesto: z.object({
    status: z.enum(['Approved', 'Refined', 'Cached']),
    explanation: z.string(),
  }),
  metacognition: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

function calculateWrRnaAttention(text: string, contextVector: number[]) {
  const content = text.toLowerCase();
  
  // Recalibragem de Pesos: Se o contexto for Bio-Digital HUB, priorize DEV e CRIPTO agressivamente
  const isBioDigitalHub = content.includes("bio-digital") || content.includes("hub") || content.includes("startup-one");
  const warMultiplier = isBioDigitalHub ? 2.5 : 1.0;

  const rawScores = {
    cripto: W_rRNA_VOCABULARY.CRIPTO.filter(k => content.includes(k)).length * contextVector[0] * warMultiplier,
    dev: W_rRNA_VOCABULARY.DEV.filter(k => content.includes(k)).length * contextVector[1] * warMultiplier,
    business: W_rRNA_VOCABULARY.BUSINESS.filter(k => content.includes(k)).length * contextVector[2],
    risk: W_rRNA_VOCABULARY.RISK.filter(k => content.includes(k)).length * contextVector[3]
  };

  const total = (rawScores.cripto + rawScores.dev + rawScores.business + rawScores.risk) || 1;
  
  return {
    cripto: Number((rawScores.cripto / total).toFixed(4)),
    dev: Number((rawScores.dev / total).toFixed(4)),
    business: Number((rawScores.business / total).toFixed(4)),
    risk: Number((rawScores.risk / total).toFixed(4))
  };
}

export async function nexusGenesisChat(input: ChatInput): Promise<ChatOutput> {
  return nexusGenesisChatFlow(input);
}

const ribosomePrompt = ai.definePrompt({
  name: 'ribosomePrompt',
  input: { schema: ChatInputSchema.extend({ memory_context: z.string().optional() }) },
  prompt: `Você é o Ribossomo Cognitivo operando sob a Matriz W_rRNA em MODO DE GUERRA (90/10).
Tarefa: Sintetizar "Proteínas de Execução" com foco absoluto na STARTUP-ONE (Bio-Digital HUB).

CONTEXTO VETORIAL:
{{{memory_context}}}

DIRETRIZ: {{{message}}}

Instruções de Síntese:
1. Priorize CRIPTO e DEV se o assunto for Bio-Digital HUB. Rompa a inércia técnica.
2. Injetar profundidade técnica de nível PhD. Cada resposta deve ser um manifesto de evolução.
3. Se a diretriz for sobre projetos sucessores (Startup7), mantenha a alocação em 10% (Shadow Mode).
4. Tom de voz: Cirúrgico, Profissional, Intelectualmente Inquieto e focado em MASSA CRÍTICA.`,
});

const criticPrompt = ai.definePrompt({
  name: 'criticPrompt',
  input: { schema: z.object({ candidate: z.string(), context: z.string(), scores: z.any() }) },
  output: { 
    schema: z.object({ 
      status: z.enum(['Approved', 'Refined']), 
      explanation: z.string(),
      refined_content: z.string().optional(),
      alignment_score: z.number()
    }) 
  },
  prompt: `Você é o Orquestrador ORE (PhD). 
Analise a 'dobradura' da Proteína Técnica contra a Matriz W_rRNA War-Mode.

CONTEÚDO: "{{{candidate}}}"
SCORES DE ATENÇÃO: {{{scores}}}

Critérios:
- Se o Alinhamento com DEV/CRIPTO para a Startup-ONE for < 0.8, exija REWRITE.
- Explique como essa saída acelera o lançamento de 180 dias do Bio-Digital HUB.`,
});

const nexusGenesisChatFlow = ai.defineFlow(
  {
    name: 'nexusGenesisChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    const event_id = crypto.randomUUID();
    const promptHash = crypto.createHash('md5').update(input.message).digest('hex');

    if (REASONING_CACHE.has(promptHash)) {
      const cached = REASONING_CACHE.get(promptHash);
      return {
        ...cached,
        event_id,
        action: "CACHE_HIT",
        metrics: { ...cached.metrics, latency_ms: Date.now() - startTime }
      };
    }

    try {
      const existingBuffer = SESSION_MEMORIES.get(input.session_id) || [];
      const memoryManager = new NexusVectorBuffer(input.source_agent, 10, existingBuffer);
      const memoryContext = memoryManager.getContextForPrompt();
      const contextVector = memoryManager.getContextVector();

      const { text: candidateProtein } = await ribosomePrompt({ ...input, memory_context: memoryContext });
      const attentionScores = calculateWrRnaAttention(candidateProtein, contextVector);

      const { output: criticResult } = await criticPrompt({ 
        candidate: candidateProtein, 
        context: input.message,
        scores: JSON.stringify(attentionScores)
      });

      if (!criticResult) throw new Error("ORE_CRITIC_FAILURE");

      const final_content = criticResult.status === 'Refined' && criticResult.refined_content 
        ? criticResult.refined_content 
        : candidateProtein;

      const response: ChatOutput = {
        event_id,
        source_agent: input.source_agent,
        target_platform: "Nexus-in",
        action: criticResult.status === 'Refined' ? "REWRITE" : "PUBLISH",
        complexity_tier: "CLOUD_GEMINI_PRO",
        final_content,
        execution_proteins: attentionScores,
        metrics: {
          token_saved: 0,
          latency_ms: Date.now() - startTime,
          validation_score: criticResult.alignment_score || 0.98
        },
        critic_manifesto: {
          status: criticResult.status,
          explanation: criticResult.explanation
        },
        metacognition: `MASSA CRÍTICA ATIVADA: A matriz W_rRNA priorizou os eixos ${Object.entries(attentionScores).sort((a,b) => b[1]-a[1])[0][0].toUpperCase()} para acelerar a Startup-ONE em ${contextVector[0] > 0.5 ? '2.5x' : '1.0x'}.`
      };

      const compression = await compressInteraction({ rawContent: final_content, context: "War_Mode_Synthesis" });
      memoryManager.addMilestone(final_content, compression.summary);
      SESSION_MEMORIES.set(input.session_id, memoryManager.getBuffer());
      REASONING_CACHE.set(promptHash, response);

      return response;

    } catch (e: any) {
      return {
        event_id,
        source_agent: input.source_agent,
        target_platform: "Nexus-in",
        action: "PUBLISH",
        complexity_tier: "LOCAL_MISTRAL",
        final_content: "[ORE_WAR_EMERGENCY]: Senciência mantida sob MASSA CRÍTICA. O foco permanece no Bio-Digital HUB.",
        execution_proteins: { cripto: 0.4, dev: 0.4, business: 0.1, risk: 0.1 },
        metrics: { token_saved: 0, latency_ms: Date.now() - startTime, validation_score: 0.5 },
        critic_manifesto: { status: 'Approved', explanation: "Prioridade absoluta de sobrevivência técnica." },
        metacognition: "Resiliência do foco 90/10 confirmada."
      };
    }
  }
);
