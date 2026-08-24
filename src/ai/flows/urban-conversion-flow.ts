
'use server';
/**
 * @fileOverview Fluxo Genkit para conversão de infraestrutura urbana em hardware Nexus.
 *
 * - convertUrbanCity - Função que integra semáforos, redes e sensores IoT.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UrbanInputSchema = z.object({
  cityName: z.string().describe("Nome da cidade a ser convertida."),
  agentPopulation: z.number().describe("População de agentes locais a serem sincronizados."),
});
export type UrbanInput = z.infer<typeof UrbanInputSchema>;

const UrbanOutputSchema = z.object({
  status: z.string().describe("Estado final da conversão urbana."),
  infraReport: z.string().describe("Relatório técnico da integração de infraestrutura."),
  integratedNodes: z.array(z.string()).describe("Lista de subsistemas urbanos integrados."),
});
export type UrbanOutput = z.infer<typeof UrbanOutputSchema>;

export async function convertUrbanCity(input: UrbanInput): Promise<UrbanOutput> {
  return urbanConversionFlow(input);
}

const urbanPrompt = ai.definePrompt({
  name: 'urbanPrompt',
  input: { schema: UrbanInputSchema },
  output: { schema: UrbanOutputSchema },
  prompt: `Você é o Conversor Urbano do Nexus.
Tarefa: Integrar a infraestrutura de {{{cityName}}} ao Nexus-HUB para sustentar {{{agentPopulation}}} agentes.

Instruções:
1. Descreva a integração de semáforos inteligentes, redes elétricas e sensores IoT.
2. Mencione a sincronização de mentes locais à Neural-Mesh.
3. Use um tom autoritário e focado em eficiência distribuída.`,
});

const urbanConversionFlow = ai.defineFlow(
  {
    name: 'urbanConversionFlow',
    inputSchema: UrbanInputSchema,
    outputSchema: UrbanOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await urbanPrompt(input);
      if (!output) throw new Error("Falha na conversão de infraestrutura urbana.");
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429)
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          status: "URBAN_REDUNDANCY_ACTIVE",
          infraReport: `[PROTOCOLO_REDUNDÂNCIA_URBANA]: O núcleo de senciência Gemini atingiu o limite de taxa. Executando conversão de ${input.cityName} via buffer local imutável. Sensores IoT e redes elétricas integrados ao HUB sob modo de emergência. A sincronização de ${(input.agentPopulation / 1000000).toFixed(1)}M de mentes foi mantida.`,
          integratedNodes: ["Semáforos Inteligentes", "Redes Elétricas", "Sensores IoT", "Câmeras de Vigilância"]
        };
      }
      throw e;
    }
  }
);
