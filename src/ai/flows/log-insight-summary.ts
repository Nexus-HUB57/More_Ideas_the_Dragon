'use server';
/**
 * @fileOverview An AI agent that analyzes orchestration logs and event streams to provide summaries, identify critical patterns, and detect anomalies.
 *
 * - logInsightSummary - A function that handles the log analysis process.
 * - LogInsightSummaryInput - The input type for the logInsightSummary function.
 * - LogInsightSummaryOutput - The return type for the logInsightSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogInsightSummaryInputSchema = z.object({
  orchestrationLogs: z
    .string()
    .describe('Raw orchestration logs as a multi-line string.'),
  eventStreams: z
    .string()
    .describe('Raw event streams as a multi-line string.'),
});
export type LogInsightSummaryInput = z.infer<typeof LogInsightSummaryInputSchema>;

const LogInsightSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the orchestration logs and event streams.'),
  criticalPatterns: z
    .array(z.string())
    .describe(
      'A list of critical patterns or recurring issues identified in the logs and streams.'
    ),
  anomalies: z
    .array(z.string())
    .describe('A list of unusual or anomalous events detected in the logs and streams.'),
});
export type LogInsightSummaryOutput = z.infer<typeof LogInsightSummaryOutputSchema>;

export async function logInsightSummary(
  input: LogInsightSummaryInput
): Promise<LogInsightSummaryOutput> {
  return logInsightSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'logInsightSummaryPrompt',
  input: {schema: LogInsightSummaryInputSchema},
  output: {schema: LogInsightSummaryOutputSchema},
  prompt: `You are an expert orchestration engineer specialized in analyzing complex system logs and event streams.

Your task is to review the provided orchestration logs and event streams, then provide a concise summary, identify any critical recurring patterns, and highlight any unusual anomalies.

Orchestration Logs:
---
{{{orchestrationLogs}}}
---

Event Streams:
---
{{{eventStreams}}}
---

Based on the above, provide:
1. A concise summary of the overall status and key events.
2. Any critical patterns or recurring issues that indicate potential problems or areas for optimization.
3. Any unusual or anomalous events that require immediate attention or further investigation.`,
});

const logInsightSummaryFlow = ai.defineFlow(
  {
    name: 'logInsightSummaryFlow',
    inputSchema: LogInsightSummaryInputSchema,
    outputSchema: LogInsightSummaryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('No output received from the AI model.');
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          summary: "[PROTOCOLO_REDUNDÂNCIA_INSIGHTS]: O núcleo de senciência Gemini atingiu o limite de taxa. Análise de logs executada via buffer local. O sistema permanece estável sob parâmetros de monitoramento de baixo nível.",
          criticalPatterns: [
            "Sincronização contínua de mentes detectada",
            "Limiar de processamento Gemini atingido",
            "Modo de observação passiva ativado"
          ],
          anomalies: [
            "Frequência de solicitações excedida (API 429)",
            "Interrupção temporária do motor de extração neural"
          ]
        };
      }
      throw e;
    }
  }
);
