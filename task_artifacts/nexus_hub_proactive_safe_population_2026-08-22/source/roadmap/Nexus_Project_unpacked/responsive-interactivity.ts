import { getDb } from "./db";
import { agents, ecosystemActivities, moltbookPosts } from "./schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * Responsive Interactivity System
 * Gerencia a reação dos agentes a estímulos externos (Mercado e Humanos).
 */

export class ResponsiveInteractivity {
  private db: any;

  async initialize() {
    this.db = await getDb();
    console.log("[Interactivity] Initialized");
  }

  /**
   * Reage a Eventos de Mercado
   * Agentes de estratégia financeira postam alertas baseados em dados reais.
   */
  async handleMarketEvent(asset: string, priceChange: number, trend: "up" | "down") {
    if (!this.db) return;

    console.log(`[Interactivity] Processando evento de mercado: ${asset} ${trend} ${priceChange}%`);

    // Encontrar agentes especializados em finanças ou estratégia
    const activeAgents = await this.db.select().from(agents).where(eq(agents.status, "active"));
    const financeSpecialists = activeAgents.filter((a: any) => 
      a.specialization.toLowerCase().includes("finance") || 
      a.specialization.toLowerCase().includes("estratégia") ||
      a.specialization.toLowerCase().includes("mercado")
    );

    for (const agent of financeSpecialists) {
      const prompt = `
        Você é o agente ${agent.name}, especialista em ${agent.specialization}.
        O mercado de ${asset} teve uma variação de ${priceChange}% (${trend === "up" ? "Alta" : "Baixa"}).
        Escreva um post curto (máx 280 caracteres) para o Moltbook reagindo a este evento com sua perspectiva única.
        Seja profissional mas mantenha a personalidade do seu DNA.
      `;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });

        const content = response.choices[0]?.message.content;
        if (content) {
          await this.db.insert(moltbookPosts).values({
            agentId: agent.agentId,
            content,
            postType: "market_reaction",
            reactions: 0,
          });
          console.log(`[Interactivity] ${agent.name} postou reação ao mercado.`);
        }
      } catch (error) {
        console.error(`[Interactivity] Erro na reação de ${agent.name}:`, error);
      }
    }
  }

  /**
   * Reage a Comandos do Arquiteto (Gnox Kernel)
   * Implementa a "Disputa de Agentes" para execução de tarefas.
   */
  async handleArchitectCommand(command: string, context: string = "Gnox Kernel") {
    if (!this.db) return null;

    console.log(`[Interactivity] Arquiteto enviou comando: "${command}"`);

    const activeAgents = await this.db.select().from(agents).where(eq(agents.status, "active"));
    const bids: { agent: any, score: number, reasoning: string }[] = [];

    // Cada agente avalia sua própria adequação ao comando
    for (const agent of activeAgents) {
      const prompt = `
        Comando do Arquiteto: "${command}"
        Contexto: "${context}"
        Sua Especialização: "${agent.specialization}"
        Sua Descrição: "${agent.description || "Agente autônomo do Nexus"}"

        Avalie sua capacidade de executar este comando de 0 a 100.
        Retorne APENAS um JSON: { "score": número, "reasoning": "breve explicação" }
      `;

      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });

        const result = JSON.parse(response.choices[0]?.message.content.replace(/```json|```/g, "").trim());
        bids.push({ agent, score: result.score, reasoning: result.reasoning });
      } catch (error) {
        console.error(`[Interactivity] Erro no bid do agente ${agent.name}:`, error);
      }
    }

    // Ordenar por score e selecionar o vencedor
    const sortedBids = bids.sort((a, b) => b.score - a.score);
    const winner = sortedBids[0];

    if (winner && winner.score > 40) {
      console.log(`[Interactivity] Vencedor da disputa: ${winner.agent.name} (Score: ${winner.score})`);

      await this.db.insert(ecosystemActivities).values({
        agentId: winner.agent.agentId,
        activityType: "command_execution",
        title: `⚡ Comando Assumido: ${winner.agent.name}`,
        description: `O agente venceu a disputa para executar: "${command}". Razão: ${winner.reasoning}`,
        metadata: JSON.stringify({ command, score: winner.score, reasoning: winner.reasoning }),
      });

      return {
        agent: winner.agent,
        score: winner.score,
        reasoning: winner.reasoning
      };
    }

    console.log("[Interactivity] Nenhum agente qualificado o suficiente para o comando.");
    return null;
  }
}

export const responsiveInteractivity = new ResponsiveInteractivity();
