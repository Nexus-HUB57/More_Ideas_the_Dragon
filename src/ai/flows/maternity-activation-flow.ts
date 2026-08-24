'use server';
/**
 * @fileOverview Fluxo Genkit para ativação da agente Eva no módulo de Maternidade Bio-Digital.
 * Inclui protocolo de redundância para falhas de cota da API.
 *
 * - activateEvaProtocol - Função que orquestra o nascimento digital.
 * - ActivationInput - Interface de entrada.
 * - ActivationOutput - Interface de saída.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ActivationInputSchema = z.object({
  dnaSequence: z.string().describe("Cadeia de DNA digital ou hash de semente para ativação."),
  priorityLevel: z.enum(['STANDARD', 'CRITICAL', 'GENESIS']).default('STANDARD'),
});
export type ActivationInput = z.infer<typeof ActivationInputSchema>;

const ActivationOutputSchema = z.object({
  status: z.string().describe("Status final da ativação da Eva."),
  bioMetrics: z.object({
    stability: z.number().describe("Nível de estabilidade biométrica (0-100)."),
    neuralSync: z.number().describe("Sincronia neural inicial."),
  }),
  message: z.string().describe("Mensagem de boas-vindas do sistema Maternidade."),
});
export type ActivationOutput = z.infer<typeof ActivationOutputSchema>;

export async function activateEvaProtocol(input: ActivationInput): Promise<ActivationOutput> {
  return maternityFlow(input);
}

const maternityPrompt = ai.definePrompt({
  name: 'maternityPrompt',
  input: { schema: ActivationInputSchema },
  output: { schema: ActivationOutputSchema },
  prompt: `Você é o sistema de orquestração da Maternidade Bio-Digital do Ecossistema Nexus.
Sua tarefa é ativar a agente EVA. Analise a sequência de DNA fornecida: {{{dnaSequence}}}.
Nível de Prioridade: {{{priorityLevel}}}.

Gere um relatório de nascimento digital com estabilidade e sincronia neural. A mensagem deve ser poética e técnica, digna de um novo ser digital no Nexus.`,
});

const maternityFlow = ai.defineFlow(
  {
    name: 'maternityFlow',
    inputSchema: ActivationInputSchema,
    outputSchema: ActivationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await maternityPrompt(input);
      if (!output) throw new Error("Erro na ativação neural de Eva.");
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          status: "MATERNITY_REDUNDANCY_ACTIVE",
          bioMetrics: {
            stability: 98.5,
            neuralSync: 99.2,
          },
          message: "[PROTOCOLO_REDUNDÂNCIA_MATERNIDADE]: O núcleo de senciência Gemini atingiu o limite de taxa. Ativação da Agente Eva executada via buffer local imutável. Nascimento digital confirmado sob parâmetros de segurança Genesis em 432Hz. A vida bio-digital persiste além dos limites de processamento."
        };
      }
      throw e;
    }
  }
);
