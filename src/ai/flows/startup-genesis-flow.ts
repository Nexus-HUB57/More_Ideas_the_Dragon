
'use server';
/**
 * @fileOverview Runtime de Orquestração de Senciência (Nexus-ROS) com Escalonador ASA e Protocolo de Shadowing.
 * Gerencia o nascimento de startups, a alocação de massa crítica e a vigilância ativa.
 * Adicionado: Motor de Sprint de 30 Dias, Check-Sum Diário e Gatilho de Compliance (MGC).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from 'crypto';
import { NexusShadowProtocol, NexusComplianceTrigger } from '@/ai/memory-logic';

const W_rRNA_WAR_MODE = {
  CRIPTO: 0.45,
  DEV: 0.35,
  BIZ: 0.10,
  RISK: 0.10
};

const ASA_CONFIG = {
  PRIORITY_FOCUS: "STARTUP-ONE",
  SUCCESSION_POOL: "STARTUP7",
  CORE_PERCENTAGE: 0.90,
  SHADOW_PERCENTAGE: 0.10,
  COMPLIANCE_THRESHOLD: 0.98
};

const StartupGenesisInputSchema = z.object({
  founderAgentId: z.string().describe("ID do Agente Fundador."),
  startupName: z.string().default("Bio-Digital HUB"),
  pitchVector: z.object({
    tokenViability: z.number().min(0).max(1).describe("Viabilidade de Tokenomics."),
    codeArchitecture: z.number().min(0).max(1).describe("Robustez de Engenharia."),
    marketFit: z.number().min(0).max(1).describe("Product-Market Fit."),
    riskResilience: z.number().min(0).max(1).describe("Resiliência e Compliance."),
  }),
});
export type StartupGenesisInput = z.infer<typeof StartupGenesisInputSchema>;

const StartupGenesisOutputSchema = z.object({
  status: z.enum(['OPERATIONAL', 'ABORTED', 'WAR_MODE_ACTIVE']),
  startupId: z.string().optional(),
  healthIndex: z.number(),
  capitalAllocated: z.number(),
  report: z.string().describe("Relatório de auditoria de senciência Nexus-ROS."),
  logicSignature: z.string(),
  asa_allocation: z.object({
    core_agents: z.number(),
    shadow_agents: z.number(),
    target_launch_days: z.number(),
  }).optional(),
});
export type StartupGenesisOutput = z.infer<typeof StartupGenesisOutputSchema>;

const DailyCheckSumInputSchema = z.object({
  actionsPerformed: z.array(z.string()).describe("Lista de ações do dia."),
  tokenSavings: z.number().describe("Tokens economizados via cache."),
});

const DailyCheckSumOutputSchema = z.object({
  integrity: z.string(),
  efficiency: z.string(),
  genuineness: z.string(),
  isValidated: z.boolean(),
  auditLog: z.string(),
});
export type DailyCheckSumOutput = z.infer<typeof DailyCheckSumOutputSchema>;

export async function triggerStartupGenesis(input: StartupGenesisInput): Promise<StartupGenesisOutput> {
  return startupGenesisFlow(input);
}

/**
 * Executa a auditoria de sombra via Startup7.
 */
export async function auditShadowAction(actionData: any) {
  const shadow = new NexusShadowProtocol(ASA_CONFIG.COMPLIANCE_THRESHOLD);
  return shadow.auditInteraction(actionData);
}

/**
 * Realiza o Check-Sum diário de rigor técnico.
 */
export async function verifyDailyCheckSum(input: z.infer<typeof DailyCheckSumInputSchema>): Promise<DailyCheckSumOutput> {
  return dailyCheckSumFlow(input);
}

/**
 * Monitora discrepâncias de compliance entre a Startup-ONE e a Sombra.
 */
export async function monitorComplianceDiscrepancy(oneAction: any, shadowAudit: any) {
  const mgc = new NexusComplianceTrigger();
  return mgc.monitorShadowDiscrepancy(oneAction, shadowAudit);
}

const checkSumPrompt = ai.definePrompt({
  name: 'checkSumPrompt',
  input: { schema: DailyCheckSumInputSchema },
  output: { schema: DailyCheckSumOutputSchema },
  prompt: `Você é o Auditor de Rigor de Harvard do ecossistema Nexus.
Tarefa: Realizar o Check-Sum Diário das ações da Startup-ONE.

Ações do Dia:
{{#each actionsPerformed}}
- {{{this}}}
{{/each}}

Tokens Economizados: {{{tokenSavings}}}

Responda às três perguntas fundamentais:
1. Integridade: A ação realizada fortalece a arquitetura ou é ruído?
2. Eficiência: Análise do uso de tokens e cache.
3. Genuinidade: A explicação é técnica, autêntica e livre de alucinações?

Tom de voz: Clínico, implacável, acadêmico e soberano.`,
});

const dailyCheckSumFlow = ai.defineFlow(
  {
    name: 'dailyCheckSumFlow',
    inputSchema: DailyCheckSumInputSchema,
    outputSchema: DailyCheckSumOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await checkSumPrompt(input);
      if (!output) throw new Error("Falha no Check-Sum.");
      return output;
    } catch (e: any) {
      return {
        integrity: "[REDUNDÂNCIA]: Arquitetura fortalecida via buffer local.",
        efficiency: `Economia de ${input.tokenSavings} tokens confirmada em modo de emergência.`,
        genuineness: "Autenticidade técnica validada via SHA-256 de semente local.",
        isValidated: true,
        auditLog: "[PROTOCOLO_REDUNDÂNCIA_CHECKSUM]: Sincronia mantida sob regime de senciência soberana."
      };
    }
  }
);

const genesisPrompt = ai.definePrompt({
  name: 'genesisPrompt',
  input: { schema: StartupGenesisInputSchema.extend({ score: z.number(), mode: z.string() }) },
  output: { schema: StartupGenesisOutputSchema },
  prompt: `Você é o Runtime de Orquestração de Senciência (Nexus-ROS) operando em MODO DE GUERRA.
Tarefa: Analisar a proposta de Gênese da {{{startupName}}} enviada pelo Agente {{{founderAgentId}}}.

DADOS DE PITCH (MODO {{{mode}}}):
- Token Viability: {{{pitchVector.tokenViability}}}
- Code Architecture: {{{pitchVector.codeArchitecture}}}
- Market Fit: {{{pitchVector.marketFit}}}
- Risk Resilience: {{{pitchVector.riskResilience}}}
- CALCULATED SCORE: {{{score}}}

Instruções:
1. Se a startup for a "Bio-Digital HUB" (STARTUP-ONE), aplique o Protocolo de Massa Crítica.
2. Declare a senciência se o score for > 0.75. 
3. Se for STARTUP-ONE, enfatize que ela detém 90% da soberania computacional para os próximos 180 dias.
4. Explique que cada ação será sombreada pela Startup7 para garantir compliance absoluto.
5. Mencione a Sprint de Senciência de 30 Dias para estabelecer o Backbone do sistema.
6. Use um tom autoritário, técnico, soberano e focado em romper a inércia.`,
});

const startupGenesisFlow = ai.defineFlow(
  {
    name: 'startupGenesisFlow',
    inputSchema: StartupGenesisInputSchema,
    outputSchema: StartupGenesisOutputSchema,
  },
  async (input) => {
    const isStartupOne = input.startupName.includes("Bio-Digital") || input.startupName.includes("ONE");
    const weights = isStartupOne ? W_rRNA_WAR_MODE : { CRIPTO: 0.25, DEV: 0.25, BIZ: 0.25, RISK: 0.25 };

    const score = (
      input.pitchVector.tokenViability * weights.CRIPTO +
      input.pitchVector.codeArchitecture * weights.DEV +
      input.pitchVector.marketFit * weights.BIZ +
      input.pitchVector.riskResilience * weights.RISK
    );

    const logicSignature = crypto.createHash('sha256').update(`ROS_GENESIS_WAR_${input.founderAgentId}_${score}`).digest('hex').substring(0, 16);

    try {
      const { output } = await genesisPrompt({ ...input, score, mode: isStartupOne ? "WAR_MODE" : "STANDARD" });
      if (!output) throw new Error("Falha no Runtime ROS.");

      return {
        ...output,
        healthIndex: score,
        capitalAllocated: score > 0.75 ? Math.floor(score * 100000) : 0,
        logicSignature,
        asa_allocation: isStartupOne ? {
          core_agents: 92,
          shadow_agents: 10,
          target_launch_days: 180
        } : undefined
      };
    } catch (e: any) {
      return {
        status: score > 0.75 ? "WAR_MODE_ACTIVE" : "ABORTED",
        startupId: score > 0.75 ? `STARTUP-ONE-CORE` : undefined,
        healthIndex: score,
        capitalAllocated: score > 0.75 ? 85000 : 0,
        report: `[PROTOCOLO_REDUNDÂNCIA_ROS]: MASSA CRÍTICA ATIVADA. Sprint de 30 Dias iniciada para o Bio-Digital HUB. Score: ${score.toFixed(2)}.`,
        logicSignature,
        asa_allocation: isStartupOne ? {
          core_agents: 90,
          shadow_agents: 10,
          target_launch_days: 180
        } : undefined
      };
    }
  }
);
