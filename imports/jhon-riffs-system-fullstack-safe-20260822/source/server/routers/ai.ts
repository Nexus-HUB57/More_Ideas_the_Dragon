import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { getAffiliateByUserId, getAffiliateById, getNetworkDownline, getAccountBalance, getAccountTransactionHistory } from "../db";
import { commissions, payments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const aiRouter = router({
  /**
   * Analisar performance da rede do afiliado com IA
   */
  analyzeNetworkPerformance: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Coletar dados da rede
    const downline = await getNetworkDownline(affiliate.id);
    const account = await getAccountBalance(affiliate.id);
    const commissionsList = await db
      .select()
      .from(commissions)
      .where(eq(commissions.affiliateId, affiliate.id));

    const totalCommissions = commissionsList.reduce((sum: number, c: any) => {
      const amount = typeof c.amount === "string" ? parseFloat(c.amount) : c.amount;
      return sum + amount;
    }, 0);

    const pendingCommissions = commissionsList
      .filter((c: any) => c.status === "pendente")
      .reduce((sum: number, c: any) => {
        const amount = typeof c.amount === "string" ? parseFloat(c.amount) : c.amount;
        return sum + amount;
      }, 0);

    // Preparar prompt para IA
    const prompt = `Você é um especialista em Marketing Multinível. Analise os seguintes dados de um afiliado e forneça recomendações estratégicas:

Dados do Afiliado:
- Nível de Carreira: ${affiliate.careerLevel}
- Indicados Diretos: ${affiliate.directDownlineCount}
- Total na Rede: ${affiliate.totalDownlineCount}
- Pontos Acumulados: ${affiliate.accumulatedPoints}
- Saldo Disponível: R$ ${account?.balance || "0.00"}
- Comissões Totais: R$ ${totalCommissions.toFixed(2)}
- Comissões Pendentes: R$ ${pendingCommissions.toFixed(2)}
- Total de Indicados Diretos na Rede: ${downline.length}

Com base nesses dados, forneça:
1. Uma análise da performance atual
2. Pontos fortes e áreas de melhoria
3. 3-5 recomendações específicas para crescimento
4. Estratégias para aumentar a rede e comissões

Responda em português de forma clara e objetiva.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um especialista em Marketing Multinível e consultoria de negócios. Forneça análises detalhadas e recomendações práticas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const analysisText = response.choices[0]?.message?.content || "Análise não disponível";

      return {
        success: true,
        analysis: analysisText,
        metrics: {
          directDownline: affiliate.directDownlineCount,
          totalNetwork: affiliate.totalDownlineCount,
          totalCommissions,
          pendingCommissions,
          balance: account?.balance || "0.00",
        },
      };
    } catch (error) {
      console.error("Error invoking LLM:", error);
      throw new Error("Failed to analyze network performance");
    }
  }),

  /**
   * Gerar recomendações de estratégia de vendas
   */
  generateSalesStrategy: protectedProcedure
    .input(
      z.object({
        targetLevel: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      const prompt = `Você é um especialista em Marketing Multinível. Crie uma estratégia de vendas personalizada para um afiliado:

Informações do Afiliado:
- Nível Atual: ${affiliate.careerLevel}
- Objetivo: ${input.targetLevel || "Próximo nível de carreira"}
- Pontos Atuais: ${affiliate.accumulatedPoints}
- Indicados Diretos: ${affiliate.directDownlineCount}

Forneça:
1. Um plano de ação detalhado em 30 dias
2. Metas específicas e mensuráveis
3. Técnicas de recrutamento eficazes
4. Dicas para aumentar conversão de vendas
5. Ferramentas e recursos recomendados

Responda em português de forma prática e implementável.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um consultor de vendas especializado em Marketing Multinível. Crie estratégias práticas e eficazes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const strategyText = response.choices[0]?.message?.content || "Estratégia não disponível";

        return {
          success: true,
          strategy: strategyText,
          targetLevel: input.targetLevel || "Próximo nível",
        };
      } catch (error) {
        console.error("Error invoking LLM:", error);
        throw new Error("Failed to generate sales strategy");
      }
    }),

  /**
   * Prever ganhos futuros com base em dados históricos
   */
  predictFutureEarnings: protectedProcedure
    .input(
      z.object({
        months: z.number().int().min(1).max(12).default(3),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Coletar histórico de comissões
      const commissionsList = await db
        .select()
        .from(commissions)
        .where(eq(commissions.affiliateId, affiliate.id));

      const monthlyData: { [key: string]: number } = {};
      commissionsList.forEach((c: any) => {
        const date = new Date(c.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        const amount = typeof c.amount === "string" ? parseFloat(c.amount) : c.amount;
        monthlyData[monthKey] += amount;
      });

      const monthlyValues = Object.values(monthlyData);
      const averageMonthly = monthlyValues.length > 0 ? monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length : 0;

      const prompt = `Você é um analista de dados especializado em Marketing Multinível. Faça uma previsão de ganhos:

Dados Históricos:
- Média Mensal de Comissões: R$ ${averageMonthly.toFixed(2)}
- Meses de Histórico: ${monthlyValues.length}
- Indicados Diretos: ${affiliate.directDownlineCount}
- Nível Atual: ${affiliate.careerLevel}

Forneça:
1. Previsão de ganhos para os próximos ${input.months} meses
2. Cenários otimista, realista e conservador
3. Fatores que podem impactar os ganhos
4. Recomendações para maximizar ganhos

Responda em português com dados numéricos específicos.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um analista de dados e especialista em previsões financeiras para Marketing Multinível.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const predictionText = response.choices[0]?.message?.content || "Previsão não disponível";

        return {
          success: true,
          prediction: predictionText,
          historicalAverage: averageMonthly,
          monthsAnalyzed: monthlyValues.length,
          forecastMonths: input.months,
        };
      } catch (error) {
        console.error("Error invoking LLM:", error);
        throw new Error("Failed to predict future earnings");
      }
    }),

  /**
   * Gerar conteúdo de marketing personalizado
   */
  generateMarketingContent: protectedProcedure
    .input(
      z.object({
        contentType: z.enum(["email", "social_media", "landing_page", "sales_pitch"]),
        topic: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new Error("Affiliate not found");
      }

      const contentTypeMap = {
        email: "um email de marketing",
        social_media: "um post para redes sociais",
        landing_page: "um texto para página de desembarque",
        sales_pitch: "um discurso de vendas",
      };

      const prompt = `Você é um especialista em copywriting e marketing digital. Crie ${contentTypeMap[input.contentType]} para um afiliado de Marketing Multinível:

Informações do Afiliado:
- Nível: ${affiliate.careerLevel}
- Indicados: ${affiliate.directDownlineCount}
- Tópico: ${input.topic || "Oportunidade de negócio"}

Requisitos:
1. Texto persuasivo e profissional
2. Foco em benefícios e resultados
3. Call-to-action claro
4. Adequado para o tipo de conteúdo solicitado

Responda em português com o conteúdo pronto para usar.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em copywriting e marketing digital para Marketing Multinível. Crie conteúdo persuasivo e eficaz.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const contentText = response.choices[0]?.message?.content || "Conteúdo não disponível";

        return {
          success: true,
          content: contentText,
          contentType: input.contentType,
          topic: input.topic || "Oportunidade de negócio",
        };
      } catch (error) {
        console.error("Error invoking LLM:", error);
        throw new Error("Failed to generate marketing content");
      }
    }),

  /**
   * Obter insights sobre a rede
   */
  getNetworkInsights: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const downline = await getNetworkDownline(affiliate.id);
    const commissionsList = await db
      .select()
      .from(commissions)
      .where(eq(commissions.affiliateId, affiliate.id));

    const totalCommissions = commissionsList.reduce((sum: number, c: any) => {
      const amount = typeof c.amount === "string" ? parseFloat(c.amount) : c.amount;
      return sum + amount;
    }, 0);

    const prompt = `Analise os seguintes insights de rede de Marketing Multinível:

Dados:
- Indicados Diretos: ${affiliate.directDownlineCount}
- Total na Rede: ${affiliate.totalDownlineCount}
- Comissões Totais: R$ ${totalCommissions.toFixed(2)}
- Nível: ${affiliate.careerLevel}

Forneça insights sobre:
1. Saúde geral da rede
2. Oportunidades de crescimento
3. Riscos ou desafios
4. Próximos passos recomendados

Responda em português de forma concisa.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um analista de redes de Marketing Multinível. Forneça insights estratégicos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const insightsText = response.choices[0]?.message?.content || "Insights não disponíveis";

      return {
        success: true,
        insights: insightsText,
        networkMetrics: {
          directDownline: affiliate.directDownlineCount,
          totalNetwork: affiliate.totalDownlineCount,
          totalCommissions,
        },
      };
    } catch (error) {
      console.error("Error invoking LLM:", error);
      throw new Error("Failed to get network insights");
    }
  }),
});
