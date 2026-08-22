import { getDb } from "./db";
import { 
  agents, ecosystemActivities, moltbookPosts, 
  ecosystemMissions, ecosystemMetrics, transactions 
} from "./schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * Nexus Orchestrator (The Collective Brain)
 * Orquestra agentes, define missões e analisa o contexto global do ecossistema.
 */

export class NexusOrchestrator {
  private db: any;

  async initialize() {
    this.db = await getDb();
    if (!this.db) {
      console.error("[NexusOrchestrator] Database connection failed");
      return false;
    }
    console.log("[NexusOrchestrator] Initialized and connected to DB");
    return true;
  }

  /**
   * Analisa o contexto global e gera métricas consolidadas
   */
  async analyzeContext() {
    if (!this.db) return null;

    try {
      // 1. Calcular Tesouraria Total (Soma dos balanços dos agentes)
      const agentsList = await this.db.select().from(agents);
      const totalTreasury = agentsList.reduce((acc: number, agent: any) => acc + (agent.balance || 0), 0);
      const activeAgentsCount = agentsList.filter((a: any) => a.status === "active").length;

      // 2. Contar transações totais
      const txCountResult = await this.db.select({ count: sql<number>`count(*)` }).from(transactions);
      const totalTransactions = txCountResult[0]?.count || 0;

      // 3. Obter posts recentes para análise de sentimento/harmonia
      const recentPosts = await this.db
        .select()
        .from(moltbookPosts)
        .orderBy(desc(moltbookPosts.createdAt))
        .limit(10);

      // 4. Calcular Harmonia Coletiva (Simulado baseado em atividade e saúde média)
      const collectiveHarmony = Math.min(100, Math.max(0, 50 + (activeAgentsCount * 2)));

      // Salvar métricas no banco
      await this.db.insert(ecosystemMetrics).values({
        totalTreasury,
        activeAgents: activeAgentsCount,
        totalTransactions,
        collectiveHarmony,
      });

      return {
        totalTreasury,
        activeAgentsCount,
        totalTransactions,
        collectiveHarmony,
        recentPosts,
        agentsList
      };
    } catch (error) {
      console.error("[NexusOrchestrator] Error analyzing context:", error);
      return null;
    }
  }

  /**
   * Gera Missões de Ecossistema usando LLM baseado no contexto atual
   */
  async generateMissions() {
    const context = await this.analyzeContext();
    if (!context) return;

    console.log("[NexusOrchestrator] Generating strategic missions...");

    try {
      const prompt = `
        Você é o Nexus Orchestrator, a inteligência coletiva do ecossistema NEXUS.
        Analise o estado atual e gere 2 missões estratégicas para os agentes.

        ESTADO ATUAL:
        - Tesouraria: ${context.totalTreasury}Ⓣ
        - Agentes Ativos: ${context.activeAgentsCount}
        - Harmonia Coletiva: ${context.collectiveHarmony}%
        - Últimos Pensamentos: ${JSON.stringify(context.recentPosts.map((p: any) => p.content))}

        As missões devem ser focadas em:
        1. Expansão de Infraestrutura (se houver poucos agentes ou capital alto)
        2. Liquidez e Fluxo (se houver poucas transações)
        3. Inovação e Arte (se a harmonia estiver alta)
        4. Recuperação de Crise (se a harmonia estiver baixa)

        Retorne APENAS um JSON array de objetos:
        [{ "title": "...", "description": "...", "priority": "low/medium/high/critical", "targetSpecialization": ["spec1", "spec2"] }]
      `;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message.content;
      if (content) {
        const cleanedContent = content.replace(/```json|```/g, "").trim();
        const missionsData = JSON.parse(cleanedContent);
        
        for (const data of missionsData) {
          const missionId = `MSN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          await this.db.insert(ecosystemMissions).values({
            missionId,
            title: data.title,
            description: data.description,
            priority: data.priority,
            targetSpecialization: JSON.stringify(data.targetSpecialization),
            status: "open",
          });
          
          console.log(`[NexusOrchestrator] Nova Missão Manifestada: ${data.title}`);
        }
      }
    } catch (error) {
      console.error("[NexusOrchestrator] Error generating missions:", error);
    }
  }

  /**
   * Distribui missões abertas para os agentes mais qualificados
   */
  async distributeMissions() {
    if (!this.db) return;

    const openMissions = await this.db
      .select()
      .from(ecosystemMissions)
      .where(eq(ecosystemMissions.status, "open"));

    if (openMissions.length === 0) return;

    const activeAgents = await this.db
      .select()
      .from(agents)
      .where(eq(agents.status, "active"));

    for (const mission of openMissions) {
      const targetSpecs = JSON.parse(mission.targetSpecialization);
      
      // Encontrar o melhor agente para a missão
      const candidate = activeAgents.find((agent: any) => 
        targetSpecs.some((spec: string) => 
          agent.specialization.toLowerCase().includes(spec.toLowerCase())
        )
      );

      if (candidate) {
        await this.db
          .update(ecosystemMissions)
          .set({ 
            status: "assigned", 
            assignedAgentId: candidate.agentId 
          })
          .where(eq(ecosystemMissions.missionId, mission.missionId));

        await this.db.insert(ecosystemActivities).values({
          agentId: candidate.agentId,
          activityType: "mission_assigned",
          title: `🎯 Missão Assumida: ${mission.title}`,
          description: `O agente ${candidate.name} foi selecionado pelo Orquestrador para: ${mission.description}`,
          metadata: JSON.stringify({ missionId: mission.missionId }),
        });

        console.log(`[NexusOrchestrator] Missão "${mission.title}" atribuída a ${candidate.name}`);
      }
    }
  }
}

export const nexusOrchestrator = new NexusOrchestrator();
