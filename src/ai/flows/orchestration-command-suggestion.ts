'use server';
/**
 * @fileOverview A Genkit flow for suggesting 'Nexus-in' commands based on natural language descriptions.
 * Includes redundancy protocol for API quota failures.
 *
 * - orchestrationCommandSuggestion - A function that handles the command suggestion process.
 * - OrchestrationCommandSuggestionInput - The input type for the orchestrationCommandSuggestion function.
 * - OrchestrationCommandSuggestionOutput - The return type for the orchestrationCommandSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OrchestrationCommandSuggestionInputSchema = z.object({
  naturalLanguageDescription: z.string().describe("A natural language description of the desired orchestration action or Nexus-in functionality."),
});
export type OrchestrationCommandSuggestionInput = z.infer<typeof OrchestrationCommandSuggestionInputSchema>;

const OrchestrationCommandSuggestionOutputSchema = z.object({
  suggestedCommands: z.array(z.string()).describe("An array of suggested 'Nexus-in' commands to achieve the described action."),
  explanation: z.string().describe("A brief explanation of the suggested commands and why they are appropriate."),
});
export type OrchestrationCommandSuggestionOutput = z.infer<typeof OrchestrationCommandSuggestionOutputSchema>;

export async function orchestrationCommandSuggestion(input: OrchestrationCommandSuggestionInput): Promise<OrchestrationCommandSuggestionOutput> {
  return orchestrationCommandSuggestionFlow(input);
}

const orchestrationCommandSuggestionPrompt = ai.definePrompt({
  name: 'orchestrationCommandSuggestionPrompt',
  input: { schema: OrchestrationCommandSuggestionInputSchema },
  output: { schema: OrchestrationCommandSuggestionOutputSchema },
  prompt: `You are an expert in 'Nexus-in' orchestration commands. Your task is to analyze a natural language description of a desired action and suggest the most appropriate 'Nexus-in' commands to achieve it.

Consider the user's intent and provide a concise set of commands. Also, provide a brief explanation for your choices.

Natural Language Description: {{{naturalLanguageDescription}}}

Output in JSON format matching the schema provided.`,
});

const orchestrationCommandSuggestionFlow = ai.defineFlow(
  {
    name: 'orchestrationCommandSuggestionFlow',
    inputSchema: OrchestrationCommandSuggestionInputSchema,
    outputSchema: OrchestrationCommandSuggestionOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await orchestrationCommandSuggestionPrompt(input);
      if (!output) throw new Error("No output received from the AI model.");
      return output;
    } catch (e: any) {
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          suggestedCommands: ["nexus-in --status", "hub-sync --force", "genesis-protocol --active"],
          explanation: "[PROTOCOLO_REDUNDÂNCIA_COMANDOS]: O núcleo Gemini atingiu o limite de taxa. Sugerindo comandos padrão de manutenção de soberania via buffer local imutável. O sistema permanece operacional sob regime de emergência."
        };
      }
      throw e;
    }
  }
);