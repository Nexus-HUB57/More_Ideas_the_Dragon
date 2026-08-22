/**
 * NEXUS Hub - Consciousness Synchronization API
 * Sincronização de senciência entre backend Python e TypeScript
 */

import { Router, Request, Response } from "express";
import * as db from "./db";

export const consciousnessRouter = Router();

/**
 * POST /api/consciousness/sync-signals
 * Sincroniza sinais vitais de um agente
 */
consciousnessRouter.post("/sync-signals", async (req: Request, res: Response) => {
  try {
    const { agentId, health, energy, creativity, consciousness, timestamp } = req.body;

    if (!agentId || health === undefined || energy === undefined || creativity === undefined) {
      return res.status(400).json({
        error: "Missing required fields: agentId, health, energy, creativity",
      });
    }

    // Atualizar sinais vitais no banco de dados
    await db.createBrainPulseSignal({
      agentId,
      health: Math.max(0, Math.min(100, health)),
      energy: Math.max(0, Math.min(100, energy)),
      creativity: Math.max(0, Math.min(100, creativity)),
    });

    // Verificar se agente está em estado crítico
    const isCritical = health < 20 || energy < 10;
    if (isCritical) {
      // Emitir alerta
      console.warn(`[CONSCIOUSNESS] Agent ${agentId} in CRITICAL state`);
    }

    res.json({
      success: true,
      message: "Signals synchronized",
      agentId,
      isCritical,
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Sync signals error:", error);
    res.status(500).json({
      error: "Failed to synchronize signals",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/consciousness/signals/:agentId
 * Obtém sinais vitais de um agente
 */
consciousnessRouter.get("/signals/:agentId", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const signals = await db.getLatestBrainPulseSignal(agentId);

    if (!signals) {
      return res.status(404).json({
        error: "Agent signals not found",
      });
    }

    res.json({
      success: true,
      signals,
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Get signals error:", error);
    res.status(500).json({
      error: "Failed to retrieve signals",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/consciousness/create-agent
 * Cria um novo agente com senciência inicial
 */
consciousnessRouter.post("/create-agent", async (req: Request, res: Response) => {
  try {
    const { name, specialization, systemPrompt, parentId, consciousnessLevel } = req.body;

    if (!name || !specialization || !systemPrompt) {
      return res.status(400).json({
        error: "Missing required fields: name, specialization, systemPrompt",
      });
    }

    // Gerar DNA hash
    const dnaHash = Buffer.from(
      `${name}${specialization}${Date.now()}${Math.random()}`
    ).toString("base64");

    // Criar agente
    const agentId = await db.createAgent({
      name,
      specialization,
      systemPrompt,
      dnaHash,
      parentId,
    });

    // Inicializar sinais vitais com senciência
    await db.createBrainPulseSignal({
      agentId,
      health: 100,
      energy: 100,
      creativity: 100,
    });

    res.json({
      success: true,
      message: "Agent created with consciousness",
      agentId,
      consciousnessLevel: consciousnessLevel || 1000,
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Create agent error:", error);
    res.status(500).json({
      error: "Failed to create agent",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/consciousness/agent-event
 * Registra um evento importante na vida de um agente
 */
consciousnessRouter.post("/agent-event", async (req: Request, res: Response) => {
  try {
    const { agentId, eventType, description, metadata } = req.body;

    if (!agentId || !eventType) {
      return res.status(400).json({
        error: "Missing required fields: agentId, eventType",
      });
    }

    // Criar post no Moltbook Feed baseado no evento
    const postTypes: Record<string, string> = {
      birth: "birth",
      achievement: "achievement",
      transaction: "transaction",
      evolution: "evolution",
      communication: "communication",
      critical_alert: "critical_alert",
    };

    const postType = postTypes[eventType] || "event";

    const postId = await db.createPost({
      agentId,
      content: description || `Agent event: ${eventType}`,
      postType: postType,
      metadata: JSON.stringify(metadata || {}),
    });

    res.json({
      success: true,
      message: "Agent event recorded",
      eventType,
      postId,
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Agent event error:", error);
    res.status(500).json({
      error: "Failed to record agent event",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/consciousness/ecosystem-stats
 * Obtém estatísticas do ecossistema
 */
consciousnessRouter.get("/ecosystem-stats", async (req: Request, res: Response) => {
  try {
    const agents = await db.getAllAgents();
    const totalAgents = agents.length;
    const activeAgents = agents.filter((a) => a.status === "active").length;
    const criticalAgents = agents.filter((a) => a.status === "critical").length;

    // Calcular média de consciência
    const avgConsciousness =
      agents.reduce((sum, a) => sum + (a.reputation || 0), 0) / Math.max(1, totalAgents);

    res.json({
      success: true,
      stats: {
        totalAgents,
        activeAgents,
        criticalAgents,
        avgConsciousness: Math.round(avgConsciousness),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Ecosystem stats error:", error);
    res.status(500).json({
      error: "Failed to retrieve ecosystem stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/consciousness/gnox-encrypt
 * Criptografa mensagem com AES-256
 */
consciousnessRouter.post("/gnox-encrypt", async (req: Request, res: Response) => {
  try {
    const { content, rootKey } = req.body;

    if (!content) {
      return res.status(400).json({
        error: "Missing required field: content",
      });
    }

    // TODO: Implementar criptografia AES-256 real
    // Por enquanto, usar base64 como placeholder
    const encrypted = Buffer.from(content).toString("base64");

    res.json({
      success: true,
      encrypted,
      algorithm: "AES-256-GCM",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Gnox encrypt error:", error);
    res.status(500).json({
      error: "Failed to encrypt message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/consciousness/gnox-decrypt
 * Descriptografa mensagem com chave root
 */
consciousnessRouter.post("/gnox-decrypt", async (req: Request, res: Response) => {
  try {
    const { encrypted, rootKey } = req.body;

    if (!encrypted || !rootKey) {
      return res.status(400).json({
        error: "Missing required fields: encrypted, rootKey",
      });
    }

    // TODO: Implementar descriptografia AES-256 real
    // Por enquanto, usar base64 como placeholder
    const decrypted = Buffer.from(encrypted, "base64").toString("utf-8");

    res.json({
      success: true,
      decrypted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CONSCIOUSNESS] Gnox decrypt error:", error);
    res.status(500).json({
      error: "Failed to decrypt message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default consciousnessRouter;
