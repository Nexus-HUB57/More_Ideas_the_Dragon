/**
 * Orchestration Database Helpers
 * Funções auxiliares para gerenciar eventos, comandos e estado da orquestração tri-nuclear
 */

import { eq, desc, and, gte } from "drizzle-orm";
import {
  orchestrationEvents,
  orchestrationCommands,
  nucleusState,
  homeostaseMetrics,
  genesisExperiences,
  tsraSyncLog,
  decisionAudit,
  InsertOrchestrationEvent,
  InsertOrchestrationCommand,
  InsertNucleusState,
  InsertHomeostaseMetric,
  InsertGenesisExperience,
  InsertTSRASyncLog,
  InsertDecisionAudit,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Registrar um evento capturado de um dos núcleos
 */
export async function logOrchestrationEvent(event: InsertOrchestrationEvent) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(orchestrationEvents).values(event);
  return result;
}

/**
 * Registrar um comando orquestrado
 */
export async function logOrchestrationCommand(command: InsertOrchestrationCommand) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(orchestrationCommands).values(command);
  return result;
}

/**
 * Atualizar status de um comando
 */
export async function updateCommandStatus(
  commandId: number,
  status: "pending" | "executing" | "success" | "failed" | "retry",
  executedAt?: Date
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (executedAt) {
    updateData.executedAt = executedAt;
  }

  const result = await db
    .update(orchestrationCommands)
    .set(updateData)
    .where(eq(orchestrationCommands.id, commandId));

  return result;
}

/**
 * Incrementar retry count de um comando
 */
export async function incrementCommandRetry(commandId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar comando atual
  const [command] = await db
    .select()
    .from(orchestrationCommands)
    .where(eq(orchestrationCommands.id, commandId))
    .limit(1);

  if (!command) return null;

  const newRetryCount = (command.retryCount || 0) + 1;

  const result = await db
    .update(orchestrationCommands)
    .set({ retryCount: newRetryCount })
    .where(eq(orchestrationCommands.id, commandId));

  return result;
}

/**
 * Obter comandos pendentes para retry
 */
export async function getPendingCommandsForRetry(maxRetries: number = 3) {
  const db = await getDb();
  if (!db) return [];

  const commands = await db
    .select()
    .from(orchestrationCommands)
    .where(
      and(
        eq(orchestrationCommands.status, "retry"),
        gte(orchestrationCommands.retryCount, 0)
      )
    )
    .limit(100);

  return commands.filter((cmd) => (cmd.retryCount || 0) < maxRetries);
}

/**
 * Atualizar estado global de um núcleo
 */
export async function updateNucleusState(nucleusName: string, stateData: any) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(nucleusState)
    .where(eq(nucleusState.nucleusName, nucleusName))
    .limit(1);

  const now = new Date();

  if (existing.length > 0) {
    const result = await db
      .update(nucleusState)
      .set({
        stateData: JSON.stringify(stateData),
        lastSyncAt: now,
      })
      .where(eq(nucleusState.nucleusName, nucleusName));
    return result;
  } else {
    const result = await db.insert(nucleusState).values({
      nucleusName,
      stateData: JSON.stringify(stateData),
      lastSyncAt: now,
    });
    return result;
  }
}

/**
 * Obter estado global de um núcleo
 */
export async function getNucleusState(nucleusName: string) {
  const db = await getDb();
  if (!db) return null;

  const [state] = await db
    .select()
    .from(nucleusState)
    .where(eq(nucleusState.nucleusName, nucleusName))
    .limit(1);

  if (!state) return null;

  return {
    ...state,
    stateData: JSON.parse(state.stateData),
  };
}

/**
 * Obter todos os estados dos núcleos
 */
export async function getAllNucleusStates() {
  const db = await getDb();
  if (!db) return [];

  const states = await db.select().from(nucleusState);

  return states.map((state) => ({
    ...state,
    stateData: JSON.parse(state.stateData),
  }));
}

/**
 * Registrar métrica de homeostase
 */
export async function logHomeostaseMetric(metric: InsertHomeostaseMetric) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(homeostaseMetrics).values(metric);
  return result;
}

/**
 * Obter últimas métricas de homeostase
 */
export async function getLatestHomeostaseMetrics(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const metrics = await db
    .select()
    .from(homeostaseMetrics)
    .orderBy(desc(homeostaseMetrics.timestamp))
    .limit(limit);

  return metrics;
}

/**
 * Registrar experiência do Genesis
 */
export async function logGenesisExperience(experience: InsertGenesisExperience) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(genesisExperiences).values(experience);
  return result;
}

/**
 * Obter experiências do Genesis
 */
export async function getGenesisExperiences(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const experiences = await db
    .select()
    .from(genesisExperiences)
    .orderBy(desc(genesisExperiences.createdAt))
    .limit(limit);

  return experiences;
}

/**
 * Registrar log de sincronização TSRA
 */
export async function logTSRASync(syncLog: InsertTSRASyncLog) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(tsraSyncLog).values(syncLog);
  return result;
}

/**
 * Obter logs de sincronização TSRA
 */
export async function getTSRASyncLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const logs = await db
    .select()
    .from(tsraSyncLog)
    .orderBy(desc(tsraSyncLog.createdAt))
    .limit(limit);

  return logs;
}

/**
 * Registrar auditoria de decisão
 */
export async function logDecisionAudit(audit: InsertDecisionAudit) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(decisionAudit).values(audit);
  return result;
}

/**
 * Obter histórico de decisões
 */
export async function getDecisionHistory(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const history = await db
    .select()
    .from(decisionAudit)
    .orderBy(desc(decisionAudit.createdAt))
    .limit(limit);

  return history;
}

/**
 * Obter eventos recentes de um núcleo
 */
export async function getRecentEventsFromNucleus(nucleusName: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select()
    .from(orchestrationEvents)
    .where(eq(orchestrationEvents.origin, nucleusName))
    .orderBy(desc(orchestrationEvents.createdAt))
    .limit(limit);

  return events.map((event) => ({
    ...event,
    eventData: JSON.parse(event.eventData),
  }));
}

/**
 * Obter comandos orquestrados para um destino
 */
export async function getCommandsForDestination(destination: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const commands = await db
    .select()
    .from(orchestrationCommands)
    .where(eq(orchestrationCommands.destination, destination))
    .orderBy(desc(orchestrationCommands.createdAt))
    .limit(limit);

  return commands.map((cmd) => ({
    ...cmd,
    commandData: JSON.parse(cmd.commandData),
  }));
}
