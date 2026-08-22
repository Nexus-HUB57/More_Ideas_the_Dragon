/**
 * AgentOS Integration Module
 * Sincronização bidirecional com AgentOS (https://os.agno.com)
 */

import { ENV } from "./_core/env";

export interface AgentOSSyncPayload {
  agentId: string;
  name: string;
  specialization: string;
  status: "active" | "inactive" | "sleeping" | "critical";
  health: number;
  energy: number;
  creativity: number;
  balance: string;
  reputation: number;
  timestamp: number;
}

export interface AgentOSResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Sincroniza um agente com AgentOS
 */
export async function syncAgentToAgentOS(
  payload: AgentOSSyncPayload
): Promise<AgentOSResponse> {
  if (!ENV.agentoApiUrl || !ENV.agentoSecurityKey) {
    return {
      success: false,
      error: "AgentOS credentials not configured",
    };
  }

  try {
    const response = await fetch(`${ENV.agentoApiUrl}/agents/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Security-Key": ENV.agentoSecurityKey,
        "X-NEXUS-Endpoint": ENV.nexusEndpointUrl || "http://localhost:3000",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `AgentOS returned status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[AgentOS] Sync error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Valida a conexão com AgentOS
 */
export async function validateAgentOSConnection(): Promise<boolean> {
  if (!ENV.agentoApiUrl || !ENV.agentoSecurityKey) {
    console.warn("[AgentOS] Credentials not configured");
    return false;
  }

  try {
    const response = await fetch(`${ENV.agentoApiUrl}/health`, {
      method: "GET",
      headers: {
        "X-Security-Key": ENV.agentoSecurityKey,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[AgentOS] Connection validation error:", error);
    return false;
  }
}

/**
 * Registra um webhook no AgentOS para receber eventos
 */
export async function registerWebhook(webhookUrl: string): Promise<AgentOSResponse> {
  if (!ENV.agentoApiUrl || !ENV.agentoSecurityKey) {
    return {
      success: false,
      error: "AgentOS credentials not configured",
    };
  }

  try {
    const response = await fetch(`${ENV.agentoApiUrl}/webhooks/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Security-Key": ENV.agentoSecurityKey,
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ["agent.created", "agent.updated", "agent.deleted", "transaction.completed"],
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to register webhook: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("[AgentOS] Webhook registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Processa evento recebido do AgentOS
 */
export async function handleAgentOSWebhook(
  event: string,
  payload: any
): Promise<AgentOSResponse> {
  console.log(`[AgentOS] Received webhook event: ${event}`, payload);

  try {
    switch (event) {
      case "agent.created":
        // Sincronizar novo agente criado no AgentOS
        console.log("[AgentOS] New agent created:", payload.agentId);
        break;

      case "agent.updated":
        // Atualizar agente existente
        console.log("[AgentOS] Agent updated:", payload.agentId);
        break;

      case "agent.deleted":
        // Marcar agente como inativo
        console.log("[AgentOS] Agent deleted:", payload.agentId);
        break;

      case "transaction.completed":
        // Sincronizar transação completada
        console.log("[AgentOS] Transaction completed:", payload.transactionId);
        break;

      default:
        console.warn("[AgentOS] Unknown event type:", event);
    }

    return {
      success: true,
      message: `Event ${event} processed successfully`,
    };
  } catch (error) {
    console.error("[AgentOS] Webhook processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
