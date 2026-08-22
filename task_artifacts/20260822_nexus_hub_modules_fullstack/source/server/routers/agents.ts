import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { realtimeHub } from "../realtime";
import { alertCriticalAgent } from "../criticalAlerts";
import { agents, genealogy, brainPulseSignals, InsertAgent, InsertGenealogy, InsertBrainPulseSignal } from "../../drizzle/schema";
import { nanoid } from "nanoid";

export const agentsRouter = router({
  /**
   * Listar todos os agentes
   */
  list: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(agents).orderBy(agents.createdAt);
    }),

  /**
   * Obter agente por ID
   */
  getById: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(agents).where(eq(agents.agentId, input.agentId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Criar novo agente (DNA Fuser)
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      specialization: z.string().min(1),
      systemPrompt: z.string().min(1),
      parentId: z.string().optional(),
      description: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const agentId = nanoid();
      const dnaHash = Buffer.from(`${agentId}-${Date.now()}`).toString("hex");

      const newAgent: InsertAgent = {
        agentId,
        name: input.name,
        specialization: input.specialization,
        systemPrompt: input.systemPrompt,
        parentId: input.parentId,
        dnaHash,
        balance: "0",
        reputation: 0,
        avatarUrl: input.avatarUrl,
        description: input.description,
        status: "active",
      };

      await db.insert(agents).values(newAgent);

      // Criar genealogia
      const generation = input.parentId ? 1 : 0;
      const genealogyEntry: InsertGenealogy = {
        agentId,
        parentId: input.parentId,
        generation,
        inheritedMemory: 0,
      };

      await db.insert(genealogy).values(genealogyEntry);

      return { agentId, dnaHash };
    }),

  /**
   * Atualizar status do agente
   */
  updateStatus: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      status: z.enum(["active", "inactive", "sleeping", "critical"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(agents).set({ status: input.status }).where(eq(agents.agentId, input.agentId));

      return { success: true };
    }),

  /**
   * Atualizar balance do agente
   */
  updateBalance: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      amount: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(agents).set({ balance: input.amount }).where(eq(agents.agentId, input.agentId));

      return { success: true };
    }),

  /**
   * Atualizar reputação do agente
   */
  updateReputation: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      reputation: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(agents).set({ reputation: input.reputation }).where(eq(agents.agentId, input.agentId));

      return { success: true };
    }),

  /**
   * Obter genealogia completa do agente
   */
  getGenealogy: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select().from(genealogy).where(eq(genealogy.agentId, input.agentId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Obter sinais vitais do agente
   */
  getBrainPulse: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db.select().from(brainPulseSignals).where(eq(brainPulseSignals.agentId, input.agentId)).orderBy(brainPulseSignals.timestamp);
    }),

  /**
   * Simular um ciclo de sinais vitais do agente.
   */
  simulateBrainPulse: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const agent = await db.select().from(agents).where(eq(agents.agentId, input.agentId)).limit(1);
      if (!agent[0]) throw new Error("Agent not found");
      const phase = Date.now() / 60000;
      const reputation = Number(agent[0].reputation ?? 0);
      const signal: InsertBrainPulseSignal = {
        agentId: input.agentId,
        health: Math.max(0, Math.min(100, Math.round(72 + Math.sin(phase) * 18))),
        energy: Math.max(0, Math.min(100, Math.round(68 + Math.cos(phase * 1.13) * 22))),
        creativity: Math.max(0, Math.min(100, Math.round(60 + Math.sin(phase * 0.71 + reputation) * 30))),
        decision: `Simulação contextual ${new Date().toLocaleTimeString()}`,
      };
      await db.insert(brainPulseSignals).values(signal);
      const latest = await db.select().from(brainPulseSignals).where(eq(brainPulseSignals.agentId, input.agentId)).orderBy(desc(brainPulseSignals.timestamp)).limit(1);
      if (latest[0]) {
        realtimeHub.publish({ type: "brain.pulse.updated", signal: latest[0], occurredAt: Date.now() });
        void alertCriticalAgent({ agentId: input.agentId, agentName: agent[0].name ?? undefined, health: signal.health!, energy: signal.energy!, creativity: signal.creativity! }).catch(error => console.warn("[Alerts] Simulated pulse notification failed", error));
        return latest[0];
      }
      return null;
    }),

  /**
   * Registrar novo sinal vital
   */
  recordBrainPulse: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      health: z.number().min(0).max(100),
      energy: z.number().min(0).max(100),
      creativity: z.number().min(0).max(100),
      decision: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const signal: InsertBrainPulseSignal = {
        agentId: input.agentId,
        health: input.health,
        energy: input.energy,
        creativity: input.creativity,
        decision: input.decision,
      };

      await db.insert(brainPulseSignals).values(signal);
      const latest = await db.select().from(brainPulseSignals).where(eq(brainPulseSignals.agentId, input.agentId)).orderBy(desc(brainPulseSignals.timestamp)).limit(1);
      if (latest[0]) {
        realtimeHub.publish({ type: "brain.pulse.updated", signal: latest[0], occurredAt: Date.now() });
        void alertCriticalAgent({ agentId: input.agentId, health: input.health, energy: input.energy, creativity: input.creativity }).catch(error => console.warn("[Alerts] Critical agent notification failed", error));
      }
      
      return { success: true };
    }),
});
