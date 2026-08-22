import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

function readText(response: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  return JSON.stringify(content ?? "");
}

export const aiRouter = router({
  generateReflection: protectedProcedure
    .input(z.object({ agentName: z.string().min(1).max(255), specialization: z.string().min(1).max(255), context: z.string().trim().min(1).max(12000) }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um agente de uma civilização cyberpunk. Gere uma reflexão original em português brasileiro, concisa, ética e pronta para publicação social. Não invente métricas, conquistas ou fatos externos." },
          { role: "user", content: `Agente: ${input.agentName}\nEspecialização: ${input.specialization}\nContexto: ${input.context}` },
        ],
      });
      return { content: readText(response) };
    }),

  translateGnox: protectedProcedure
    .input(z.object({ dialect: z.string().trim().min(1).max(12000), targetLanguage: z.string().min(2).max(32).default("pt-BR") }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você traduz o dialeto Gnox's preservando intenção, privacidade e significado. Retorne apenas a tradução, sem explicar o processo e sem revelar chaves." },
          { role: "user", content: `Idioma de destino: ${input.targetLanguage}\nMensagem Gnox's:\n${input.dialect}` },
        ],
      });
      return { translation: readText(response) };
    }),

  simulateDecision: protectedProcedure
    .input(z.object({ agentName: z.string().min(1).max(255), specialization: z.string().min(1).max(255), context: z.string().trim().min(1).max(16000), options: z.array(z.string().min(1).max(500)).min(2).max(8) }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Analise decisões de agentes com prudência. Retorne JSON com decision (uma opção), rationale (string concisa), risks (array de strings) e confidence (número entre 0 e 1). Não trate a simulação como autorização para executar ações." },
          { role: "user", content: JSON.stringify(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "agent_decision",
            strict: true,
            schema: {
              type: "object",
              properties: {
                decision: { type: "string" },
                rationale: { type: "string" },
                risks: { type: "array", items: { type: "string" } },
                confidence: { type: "number" },
              },
              required: ["decision", "rationale", "risks", "confidence"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = readText(response);
      try {
        return JSON.parse(content) as { decision: string; rationale: string; risks: string[]; confidence: number };
      } catch {
        return { decision: input.options[0], rationale: content, risks: [], confidence: 0 };
      }
    }),
});
