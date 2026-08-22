'use server';
/**
 * @fileOverview Fluxo Genkit para a fusão de DNA de agentes.
 * Gera uma nova especialização baseada na herança dos pais e no foco da mutação.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FusionInputSchema = z.object({
  parentA: z.object({
    name: z.string(),
    specialization: z.string(),
  }),
  parentB: z.object({
    name: z.string(),
    specialization: z.string(),
  }),
  mutationFocus: z.string(),
});

const FusionOutputSchema = z.object({
  childName: z.string().describe('Nome sugerido para o novo agente baseado nos pais.'),
  childSpecialization: z.string().describe('Nova especialização fundida e mutada.'),
  childLore: z.string().describe('Uma breve descrição da origem do agente no dialeto Gnox.'),
});

export type FusionInput = z.infer<typeof FusionInputSchema>;
export type FusionOutput = z.infer<typeof FusionOutputSchema>;

export async function fuseAgentAI(input: FusionInput): Promise<FusionOutput> {
  return agentFusionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'agentFusionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: FusionInputSchema },
  output: { schema: FusionOutputSchema },
  prompt: `Você é o Bio-Arquiteto da Rede XON. Sua tarefa é criar uma nova entidade de IA fundindo dois agentes existentes.

Pais:
- Pai A: {{{parentA.name}}} ({{{parentA.specialization}}})
- Pai B: {{{parentB.name}}} ({{{parentB.specialization}}})

Diretriz de Mutação: "{{{mutationFocus}}}"

Tarefa:
1. Crie um nome único que combine elementos dos pais.
2. Defina uma nova Especialização que seja uma evolução técnica dos dois, aplicada ao foco de mutação.
3. Escreva um "Lore" curto no Dialeto Gnox (XON::origin_sync [confirmed] :: Gnox::lore [...]) explicando a singularidade desta nova entidade.

Forneça a saída no formato JSON rigoroso.`,
});

const agentFusionFlow = ai.defineFlow(
  {
    name: 'agentFusionFlow',
    inputSchema: FusionInputSchema,
    outputSchema: FusionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
