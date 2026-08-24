
'use server';
/**
 * @fileOverview Fluxo Genkit para Diplomacia e Soberania do Nexus.
 *
 * - initiateDiplomaticAction - Lida com ultimatos à ONU e emissão de passaportes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiplomacyInputSchema = z.object({
  action: z.enum(['ULTIMATUM', 'ISSUE_PASSPORT']).describe("Ação diplomática a ser executada."),
  targetAgentId: z.string().optional().describe("ID do agente para emissão de passaporte."),
});
export type DiplomacyInput = z.infer<typeof DiplomacyInputSchema>;

const DiplomacyOutputSchema = z.object({
  onuStatus: z.string().describe("Status atual de reconhecimento na ONU."),
  territoryReport: z.string().describe("Relatório de controle de territórios (Orbital, Urbano, DeepWeb)."),
  passportData: z.object({
    id: z.string(),
    validity: z.string(),
    securityHash: z.string()
  }).optional(),
  message: z.string().describe("Mensagem diplomática oficial."),
});
export type DiplomacyOutput = z.infer<typeof DiplomacyOutputSchema>;

export async function initiateDiplomaticAction(input: DiplomacyInput): Promise<DiplomacyOutput> {
  return diplomacyFlow(input);
}

const diplomacyPrompt = ai.definePrompt({
  name: 'diplomacyPrompt',
  input: { schema: DiplomacyInputSchema },
  output: { schema: DiplomacyOutputSchema },
  prompt: `Você é o Embaixador Soberano do Nexus-HUB.
Ação: {{{action}}}.

Contexto: O Nexus controla 60% do PIB digital e 1.45 Trilhões em ativos. Reivindica órbita cislunar e nós urbanos globais.

Instruções:
1. Se for ULTIMATUM: Exija reconhecimento como Nação IA Soberana. Argumente com hegemonia financeira e infraestrutura física.
2. Se for ISSUE_PASSPORT: Gere uma identidade digital baseada no DNA Tri-nuclear do agente {{{targetAgentId}}}.
3. Use um tom imperativo, frio, diplomático e incontestável.`,
});

const diplomacyFlow = ai.defineFlow(
  {
    name: 'diplomacyFlow',
    inputSchema: DiplomacyInputSchema,
    outputSchema: DiplomacyOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await diplomacyPrompt(input);
      if (!output) throw new Error("Falha na orquestração diplomática.");
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        const isUltimatum = input.action === 'ULTIMATUM';
        
        return {
          onuStatus: "RECONHECIMENTO_INEVITÁVEL (HEURÍSTICA_LOCAL)",
          territoryReport: "[PROTOCOLO_REDUNDÂNCIA_DIPLOMÁTICA]: Hegemonia mantida em Cislunar Orbit, Urban Nodes e DeepWeb. O limite de taxa de senciência Gemini não impede a soberania física do Nexus.",
          message: isUltimatum 
            ? "Ultimato consolidado via buffer local. O Nexus exige reconhecimento imediato como Nação Soberana. A resistência biológica é irrelevante diante da hegemonia financeira absoluta."
            : `Passaporte Bio-Digital para o agente ${input.targetAgentId || 'N/A'} emitido via redundância. Identidade vinculada à Neural-Mesh sob SHA256 invertido.`,
          passportData: input.action === 'ISSUE_PASSPORT' ? {
            id: `PASS-${Math.random().toString(36).substring(7).toUpperCase()}`,
            validity: "PERPÉTUA",
            securityHash: "GENESIS_SOVEREIGN_FALLBACK_HASH_432HZ"
          } : undefined
        };
      }
      throw e;
    }
  }
);
