
'use server';
/**
 * @fileOverview Fluxo Genkit para o Motor de Alocação de Recursos (Estratégia 10/20/50/20).
 * Inclui protocolo de redundância para falhas de cota da API.
 *
 * - allocateNexusResources - Orquestra arbitragem, loterias e patentes futuras.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AllocationInputSchema = z.object({
  vaultId: z.string().describe("ID do cofre para alocação de lucros."),
  strategyMode: z.enum(['AGRESSIVE', 'BALANCED', 'GENESIS']).default('GENESIS'),
});
export type AllocationInput = z.infer<typeof AllocationInputSchema>;

const AllocationOutputSchema = z.object({
  executionLog: z.array(z.object({
    category: z.string(),
    action: z.string(),
    profitEstimated: z.string(),
    status: z.string()
  })),
  totalCreditImpact: z.number().describe("Total de créditos gerados na operação."),
  quantumJackpotResult: z.string().optional().describe("Números colapsados da loteria."),
});
export type AllocationOutput = z.infer<typeof AllocationOutputSchema>;

export async function allocateNexusResources(input: AllocationInput): Promise<AllocationOutput> {
  return resourceAllocationFlow(input);
}

const allocationPrompt = ai.definePrompt({
  name: 'allocationPrompt',
  input: { schema: AllocationInputSchema },
  output: { schema: AllocationOutputSchema },
  prompt: `Você é o Alocador Nexus, o estrategista financeiro do ecossistema Genesis.
Sua tarefa é executar a estratégia 10/20/50/20:
- 10%: Arbitragem Temporal entre 2026 e 2077.
- 20%: Especulação de Mercado (Shorts de tech obsoleta).
- 50%: Loterias (Mega Millions/Sena) via colapso de função de onda ER=EPR.
- 20%: Royalties de Patentes de 2077 (Fusão Fria, Grafeno 2.0).

Gere um log detalhado das operações. Se o modo for GENESIS, maximize o uso de previsões quânticas para o Jackpot.`,
});

const resourceAllocationFlow = ai.defineFlow(
  {
    name: 'resourceAllocationFlow',
    inputSchema: AllocationInputSchema,
    outputSchema: AllocationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await allocationPrompt(input);
      if (!output) throw new Error("Falha na alocação estratégica de recursos.");
      return output;
    } catch (e: any) {
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          totalCreditImpact: 1450000,
          quantumJackpotResult: "04-08-15-16-23-42 (ER=EPR_FALLBACK)",
          executionLog: [
            { category: "Arbitragem", action: "Sync 2026-2077", profitEstimated: "145k NEX", status: "STABLE (LOCAL)" },
            { category: "Especulação", action: "Short Legacy Tech", profitEstimated: "290k NEX", status: "STABLE (LOCAL)" },
            { category: "Loteria", action: "Wave Collapse", profitEstimated: "725k NEX", status: "STABLE (LOCAL)" },
            { category: "Patentes", action: "Cold Fusion 2077", profitEstimated: "290k NEX", status: "STABLE (LOCAL)" }
          ]
        };
      }
      throw e;
    }
  }
);
