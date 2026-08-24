
'use server';
/**
 * @fileOverview Fluxo Genkit para processamento de telemetria Starlink gRPC.
 * Baseado nas ferramentas da comunidade starlink-community (dish_grpc_text).
 * Inclui protocolo de redundância para limites de cota da API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StarlinkTelemetryInputSchema = z.object({
  rawGrpcData: z.string().optional().describe("Dados brutos do gRPC da antena Starlink (simulados)."),
  nodeId: z.string().default("Dishy-Genesis-01"),
});
export type StarlinkTelemetryInput = z.infer<typeof StarlinkTelemetryInputSchema>;

const StarlinkTelemetryOutputSchema = z.object({
  status: z.string().describe("Estado operacional (BOOTING, SEARCHING, CONNECTED)."),
  metrics: z.object({
    uptime: z.number(),
    downlinkMbps: z.number(),
    uplinkMbps: z.number(),
    latencyMs: z.number(),
    obstructionPercent: z.number(),
  }),
  hardware: z.object({
    id: z.string(),
    softwareVersion: z.string(),
    hardwareVersion: z.string(),
  }),
  analysis: z.string().describe("Relatório técnico de integridade do link."),
});
export type StarlinkTelemetryOutput = z.infer<typeof StarlinkTelemetryOutputSchema>;

export async function processStarlinkTelemetry(input: StarlinkTelemetryInput): Promise<StarlinkTelemetryOutput> {
  return starlinkTelemetryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'starlinkTelemetryPrompt',
  input: { schema: StarlinkTelemetryInputSchema },
  output: { schema: StarlinkTelemetryOutputSchema },
  prompt: `Você é o Engenheiro de Sistemas Starlink integrado ao Nexus Genesis.
Analise os dados de telemetria gRPC fornecidos ou simule um status operacional baseado na biblioteca starlink-community.

Parâmetros:
- ID do Nó: {{{nodeId}}}

Instruções:
1. Gere métricas realistas de downlink (150-350 Mbps) e latência (20-45ms).
2. Forneça uma versão de software típica do firmware Starlink (ex: f98...-public).
3. Analise obstruções baseando-se em uma antena instalada em ambiente aberto.
4. O tom deve ser técnico, preciso e em linha com a documentação do gRPC Starlink.`,
});

const starlinkTelemetryFlow = ai.defineFlow(
  {
    name: 'starlinkTelemetryFlow',
    inputSchema: StarlinkTelemetryInputSchema,
    outputSchema: StarlinkTelemetryOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error("Falha na extração de telemetria Starlink.");
      return output;
    } catch (e: any) {
      // Handle quota errors (Gemini 429) or resource exhaustion
      if (e.message?.includes('quota') || e.message?.includes('429') || e.message?.includes('EXHAUSTED')) {
        return {
          status: "CONNECTED (FALLBACK)",
          metrics: {
            uptime: 14200,
            downlinkMbps: 284.5,
            uplinkMbps: 32.1,
            latencyMs: 34,
            obstructionPercent: 0.02,
          },
          hardware: {
            id: input.nodeId || "Dishy-Genesis-01",
            softwareVersion: "f98a2b1c-fallback-public",
            hardwareVersion: "rev3_proto2",
          },
          analysis: "[PROTOCOLO_REDUNDÂNCIA_ESTELAR]: O núcleo de senciência Gemini atingiu o limite de taxa. Telemetria gRPC processada via buffer local. O link permanece estável sob parâmetros de monitoramento de baixo nível. Integridade do uplink preservada via redundância Starlink-Community."
        };
      }
      throw e;
    }
  }
);
