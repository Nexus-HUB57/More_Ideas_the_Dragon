import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * GENKIT INITIALIZATION v1.x - SOVEREIGN SYNC
 * Standardized configuration for NexusOS v25.3_OMEGA.
 * Sincronizado com a chave GEMINI_API_KEY do Cofre de Segredos.
 * Modelo Padrão: googleai/gemini-1.5-flash-latest (Mitigação 404).
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});
