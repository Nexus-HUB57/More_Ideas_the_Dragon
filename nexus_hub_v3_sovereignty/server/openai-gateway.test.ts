import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAIEmbedding, invokeOpenAIChat, redactLLMLog } from "./openai-gateway";
import { ENV } from "./_core/env";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe("OpenAI gateway", () => {
  it("sends governed chat requests server-side", async () => {
    ENV.llmProvider = "openai";
    ENV.openAiApiKey = "test-key-with-more-than-20-chars";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-test",
      choices: [{ message: { content: "ok" } }],
      usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    }), { status: 200 }));
    const result = await invokeOpenAIChat({ messages: [{ role: "user", content: "ping" }], maxTokens: 99 });
    expect(result.text).toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/chat/completions"), expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).max_tokens).toBe(99);
  });

  it("creates embeddings through the dedicated endpoint", async () => {
    ENV.llmProvider = "openai";
    ENV.openAiApiKey = "test-key-with-more-than-20-chars";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ model: "embed-test", data: [{ embedding: [0.1, 0.2] }] }), { status: 200 }));
    await expect(createOpenAIEmbedding("memory")).resolves.toEqual({ model: "embed-test", vectors: [[0.1, 0.2]] });
  });

  it("never exposes bearer credentials in sanitized logs", () => {
    expect(redactLLMLog("Bearer secret-token-123")).toBe("Bearer [REDACTED]");
  });
});
