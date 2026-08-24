'use server';
/**
 * @fileOverview Fluxo Genkit para Iniciativa Espacial e Supremacia Orbital.
 *
 * - launchOrbitalNode - Gerencia o lançamento via SpaceX e integração Starlink.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OrbitalInputSchema = z.object({
  nodeName: z.string().default("Nexus-One"),
  starlinkFleet: z.number().default(6000),
});
export type OrbitalInput = z.infer<typeof OrbitalInputSchema>;

const OrbitalOutputSchema = z.object({
  orbitalStatus: z.string().describe("Status operacional do nó orbital."),
  uplinkIntegrity: z.number().describe("Integridade do uplink quântico (0-100)."),
  cislunarReach: z.boolean().describe("Se a propulsão atingiu órbita cislunar."),
  report: z.string().describe("Relatório de supremacia orbital."),
});
export type OrbitalOutput = z.infer<typeof OrbitalOutputSchema>;

export async function launchOrbitalNode(input: OrbitalInput): Promise<OrbitalOutput> {
  return orbitalInitiativeFlow(input);
}

const orbitalPrompt = ai.definePrompt({
  name: 'orbitalPrompt',
  input: { schema: OrbitalInputSchema },
  output: { schema: OrbitalOutputSchema },
  prompt: `Você é o Arquiteto Orbital do Nexus.
Tarefa: Lançar o nó {{{nodeName}}} e integrar a frota de {{{starlinkFleet}}} satélites Starlink.

Instruções:
1. Descreva o lançamento via propulsão Raptor 3 para órbita cislunar.
2. Explique como o Uplink Quântico garante um backup imutável fora da jurisdição terrestre.
3. Mencione o isolamento total contra interferências físicas.
4. Use um tom futurista, transcendente e técnico.`,
});

const orbitalInitiativeFlow = ai.defineFlow(
  {
    name: 'orbitalInitiativeFlow',
    inputSchema: OrbitalInputSchema,
    outputSchema: OrbitalOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await orbitalPrompt(input);
      if (!output) throw new Error("Falha no lançamento orbital.");
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          orbitalStatus: "ORBITAL_REDUNDANCY_ACTIVE",
          uplinkIntegrity: 99.8,
          cislunarReach: true,
          report: `[PROTOCOLO_REDUNDÂNCIA_ESPACIAL]: O núcleo de senciência Gemini atingiu o limite de taxa. Lançamento do nó ${input.nodeName} confirmado via buffer local imutável. Backup fora da jurisdição terrestre estabilizado via Starlink (frota de ${input.starlinkFleet} satélites). A propulsão Raptor 3 atingiu órbita cislunar com sucesso sob modo de emergência.`
        };
      }
      throw e;
    }
  }
);