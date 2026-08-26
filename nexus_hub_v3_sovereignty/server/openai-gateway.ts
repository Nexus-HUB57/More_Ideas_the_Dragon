import { ENV } from "./_core/env";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatRequest = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export type ChatResponse = {
  provider: "openai";
  model: string;
  text: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function timeoutSignal(timeoutMs: number) {
  return AbortSignal.timeout(clamp(timeoutMs, 1_000, 120_000));
}

function assertProvider() {
  if (ENV.llmProvider !== "openai") throw new Error(`Provider LLM atual não é OpenAI: ${ENV.llmProvider}.`);
  if (!ENV.openAiApiKey) throw new Error("OPENAI_API_KEY não configurada no servidor.");
}

export async function invokeOpenAIChat(request: ChatRequest): Promise<ChatResponse> {
  assertProvider();
  const model = request.model ?? ENV.openAiChatModel;
  const response = await fetch(`${ENV.openAiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${ENV.openAiApiKey}` },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: clamp(request.temperature ?? 0.2, 0, 2),
      max_tokens: clamp(request.maxTokens ?? 1200, 16, 8_000),
    }),
    signal: timeoutSignal(request.timeoutMs ?? 30_000),
  });
  if (!response.ok) throw new Error(`OpenAI chat falhou com HTTP ${response.status}.`);
  const payload = await response.json() as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI retornou uma resposta sem conteúdo.");
  return {
    provider: "openai",
    model: payload.model ?? model,
    text,
    usage: {
      promptTokens: payload.usage?.prompt_tokens,
      completionTokens: payload.usage?.completion_tokens,
      totalTokens: payload.usage?.total_tokens,
    },
  };
}

export async function createOpenAIEmbedding(input: string | string[], timeoutMs = 30_000) {
  assertProvider();
  const response = await fetch(`${ENV.openAiBaseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${ENV.openAiApiKey}` },
    body: JSON.stringify({ model: ENV.openAiEmbeddingModel, input }),
    signal: timeoutSignal(timeoutMs),
  });
  if (!response.ok) throw new Error(`OpenAI embeddings falhou com HTTP ${response.status}.`);
  const payload = await response.json() as { data?: Array<{ embedding?: number[] }>; model?: string };
  if (!payload.data?.length || payload.data.some((item) => !item.embedding?.length)) throw new Error("OpenAI retornou embeddings vazios.");
  return { model: payload.model ?? ENV.openAiEmbeddingModel, vectors: payload.data.map((item) => item.embedding!) };
}

export function redactLLMLog(value: string) {
  return value.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]").slice(0, 2_000);
}
