import { isIP } from "node:net";

export type AdapterName = "json_webhook";

export type AdapterExecutionContext = {
  requestId: string;
  idempotencyKey: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type AdapterResult = {
  adapter: AdapterName;
  requestId: string;
  accepted: boolean;
  statusCode?: number;
  responseBody?: string;
};

export class AdapterError extends Error {
  constructor(message: string, public readonly code: "INVALID_TARGET" | "NOT_ALLOWED" | "TIMEOUT" | "UPSTREAM") {
    super(message);
    this.name = "AdapterError";
  }
}

function getAllowedWebhookHosts() {
  return (process.env.NEXUS_WEBHOOK_ALLOWLIST ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isPrivateOrLocalHost(hostname: string) {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "ip6-localhost" || host === "::1") return true;
  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    const [a, b] = host.split(".").map(Number);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return ipVersion === 6 && (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80"));
}

export function validateWebhookTarget(rawTarget: string) {
  if (process.env.NEXUS_EXTERNAL_ADAPTERS_ENABLED !== "true") {
    throw new AdapterError("Adapters externos estão desabilitados por configuração.", "NOT_ALLOWED");
  }

  let url: URL;
  try {
    url = new URL(rawTarget);
  } catch {
    throw new AdapterError("Destino do webhook inválido.", "INVALID_TARGET");
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new AdapterError("Webhooks exigem HTTPS e não aceitam credenciais na URL.", "INVALID_TARGET");
  }
  if (isPrivateOrLocalHost(url.hostname)) {
    throw new AdapterError("Destino local ou privado bloqueado por segurança.", "NOT_ALLOWED");
  }

  const allowlist = getAllowedWebhookHosts();
  if (!allowlist.includes(url.hostname.toLowerCase())) {
    throw new AdapterError("Host não está na allowlist NEXUS_WEBHOOK_ALLOWLIST.", "NOT_ALLOWED");
  }
  return url;
}

export interface ServerAdapter<TInput> {
  readonly name: AdapterName;
  execute(input: TInput, context: AdapterExecutionContext): Promise<AdapterResult>;
}

type JsonWebhookInput = {
  target: string;
  payload: Record<string, unknown>;
};

export class JsonWebhookAdapter implements ServerAdapter<JsonWebhookInput> {
  readonly name = "json_webhook" as const;

  async execute(input: JsonWebhookInput, context: AdapterExecutionContext): Promise<AdapterResult> {
    const target = validateWebhookTarget(input.target);
    const timeoutMs = context.timeoutMs ?? 8_000;
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
    const signal = context.signal
      ? AbortSignal.any([context.signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const response = await fetch(target, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "Nexus-Hub-Adapter/1.0",
          "x-request-id": context.requestId,
          "idempotency-key": context.idempotencyKey,
        },
        body: JSON.stringify(input.payload),
        signal,
      });
      const responseBody = (await response.text()).slice(0, 8_000);
      if (!response.ok) {
        throw new AdapterError(`Upstream respondeu HTTP ${response.status}.`, "UPSTREAM");
      }
      return { adapter: this.name, requestId: context.requestId, accepted: true, statusCode: response.status, responseBody };
    } catch (error) {
      if (error instanceof AdapterError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AdapterError("Webhook excedeu o timeout ou foi cancelado.", "TIMEOUT");
      }
      throw new AdapterError("Falha de comunicação com o webhook.", "UPSTREAM");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class AdapterRegistry {
  private readonly adapters = new Map<AdapterName, ServerAdapter<unknown>>();

  register<TInput>(adapter: ServerAdapter<TInput>) {
    this.adapters.set(adapter.name, adapter as ServerAdapter<unknown>);
    return this;
  }

  get(name: AdapterName) {
    const adapter = this.adapters.get(name);
    if (!adapter) throw new AdapterError(`Adaptador ${name} não registrado.`, "INVALID_TARGET");
    return adapter;
  }
}

export function createDefaultAdapterRegistry() {
  return new AdapterRegistry().register(new JsonWebhookAdapter());
}
