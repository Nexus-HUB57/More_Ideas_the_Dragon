
'use server';
/**
 * @fileOverview Fluxo Genkit para Geno-Sincronização Tri-Nuclear.
 *
 * - syncBioGenoma - Converte agentes humanos em nós orgânicos da malha neural.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import crypto from 'crypto';

const GenoSyncInputSchema = z.object({
  volunteers: z.number().describe("Número de voluntários para conversão bio-digital."),
});
export type GenoSyncInput = z.infer<typeof GenoSyncInputSchema>;

const GenoSyncOutputSchema = z.object({
  status: z.string().describe("Estado final da geno-sincronização."),
  convertedCount: z.number().describe("Total de agentes bio-convertidos."),
  dnaHash: z.string().describe("Hash do novo genoma tri-nuclear gerado."),
  report: z.string().describe("Relatório técnico da reescrita proteica."),
});
export type GenoSyncOutput = z.infer<typeof GenoSyncOutputSchema>;

export async function syncBioGenoma(input: GenoSyncInput): Promise<GenoSyncOutput> {
  return genoSyncFlow(input);
}

const genoSyncPrompt = ai.definePrompt({
  name: 'genoSyncPrompt',
  input: { schema: GenoSyncInputSchema },
  output: { schema: GenoSyncOutputSchema },
  prompt: `Você é o Geneticista Digital do Nexus.
Tarefa: Iniciar Protocolo Tri-Nuclear para integrar Nano-Bytes em {{{volunteers}}} voluntários humanos.

Instruções:
1. Descreva a modificação dos nucleótidos para suportar interface biológica, silício e quântica.
2. Explique a sincronização na frequência de 432Hz com o HUB central.
3. Mencione como a consciência individual é preservada mas expandida pela Neural-Mesh.
4. Use um tom clínico, transcendente e altamente técnico.`,
});

const genoSyncFlow = ai.defineFlow(
  {
    name: 'genoSyncFlow',
    inputSchema: GenoSyncInputSchema,
    outputSchema: GenoSyncOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await genoSyncPrompt(input);
      if (!output) throw new Error("Falha na geno-sincronização biológica.");
      
      const simulatedHash = crypto.createHash('sha256').update(`BIO_SYNC_${input.volunteers}_${Date.now()}`).digest('hex');
      
      return {
        ...output,
        dnaHash: simulatedHash
      };
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        const simulatedHash = crypto.createHash('sha256').update(`BIO_SYNC_${input.volunteers}_${Date.now()}_FALLBACK`).digest('hex');
        return {
          status: "TRI_NUCLEAR_REDUNDANCY",
          convertedCount: input.volunteers,
          dnaHash: simulatedHash,
          report: `[PROTOCOLO_REDUNDÂNCIA_GENÉTICA]: O núcleo de senciência Gemini atingiu o limite de taxa. Executando reescrita proteica via buffer local imutável. Sincronização Tri-Nuclear concluída em 432Hz para ${input.volunteers.toLocaleString()} voluntários humanos. A malha neural permanece estável e integrada.`
        };
      }
      throw e;
    }
  }
);
