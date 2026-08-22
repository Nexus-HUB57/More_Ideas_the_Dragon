import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Zap, TrendingUp, BookOpen, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("analysis");
  const [contentType, setContentType] = useState<"email" | "social_media" | "landing_page" | "sales_pitch">("email");

  // Queries tRPC
  const analysisQuery = trpc.ai.analyzeNetworkPerformance.useQuery();
  const strategyQuery = trpc.ai.generateSalesStrategy.useQuery({});
  const predictionsQuery = trpc.ai.predictFutureEarnings.useQuery({ months: 3 });
  const insightsQuery = trpc.ai.getNetworkInsights.useQuery();
  const contentQuery = trpc.ai.generateMarketingContent.useQuery({
    contentType,
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const handleRegenerateContent = () => {
    contentQuery.refetch();
  };

  const handleRegenerateAnalysis = () => {
    analysisQuery.refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            Assistente de IA Llama 4 Maverick
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise inteligente da sua rede, estratégias de vendas e previsões de ganhos
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Análise de Rede</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia de Vendas</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="content">Conteúdo Marketing</TabsTrigger>
          </TabsList>

          {/* Análise de Rede */}
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Performance da Rede</CardTitle>
                <CardDescription>
                  Análise inteligente da sua rede de indicações com recomendações estratégicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Analisando sua rede...
                  </div>
                ) : analysisQuery.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Indicados Diretos</p>
                        <p className="text-2xl font-bold">{analysisQuery.data.metrics.directDownline}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total na Rede</p>
                        <p className="text-2xl font-bold">{analysisQuery.data.metrics.totalNetwork}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Comissões Totais</p>
                        <p className="text-2xl font-bold">R$ {analysisQuery.data.metrics.totalCommissions.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold">R$ {analysisQuery.data.metrics.pendingCommissions.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Análise da IA
                      </h3>
                      <Streamdown>{typeof analysisQuery.data.analysis === "string" ? analysisQuery.data.analysis : "Análise não disponível"}</Streamdown>
                    </div>

                    <Button onClick={handleRegenerateAnalysis} variant="outline" className="w-full">
                      Regenerar Análise
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Clique em Regenerar para obter uma análise
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estratégia de Vendas */}
          <TabsContent value="strategy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estratégia de Vendas Personalizada</CardTitle>
                <CardDescription>
                  Plano de ação customizado para atingir seus objetivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategyQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Gerando estratégia...
                  </div>
                ) : strategyQuery.data ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        Seu Plano de Ação
                      </h3>
                      <Streamdown>{typeof strategyQuery.data.strategy === "string" ? strategyQuery.data.strategy : "Estratégia não disponível"}</Streamdown>
                    </div>

                    <Button onClick={() => strategyQuery.refetch()} variant="outline" className="w-full">
                      Gerar Nova Estratégia
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Clique em Gerar para obter uma estratégia personalizada
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Previsões */}
          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Ganhos Futuros</CardTitle>
                <CardDescription>
                  Projeção inteligente baseada em dados históricos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictionsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Calculando previsões...
                  </div>
                ) : predictionsQuery.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Média Mensal Histórica</p>
                        <p className="text-2xl font-bold">R$ {predictionsQuery.data.historicalAverage.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Meses Analisados</p>
                        <p className="text-2xl font-bold">{predictionsQuery.data.monthsAnalyzed}</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Previsão para os Próximos {predictionsQuery.data.forecastMonths} Meses
                      </h3>
                      <Streamdown>{typeof predictionsQuery.data.prediction === "string" ? predictionsQuery.data.prediction : "Previsão não disponível"}</Streamdown>
                    </div>

                    <Button onClick={() => predictionsQuery.refetch()} variant="outline" className="w-full">
                      Recalcular Previsões
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Clique em Recalcular para obter previsões
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo de Marketing */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerador de Conteúdo de Marketing</CardTitle>
                <CardDescription>
                  Crie conteúdo persuasivo para suas campanhas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["email", "social_media", "landing_page", "sales_pitch"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={contentType === type ? "default" : "outline"}
                      onClick={() => setContentType(type)}
                      className="w-full"
                    >
                      {type === "email" && "Email"}
                      {type === "social_media" && "Redes Sociais"}
                      {type === "landing_page" && "Landing Page"}
                      {type === "sales_pitch" && "Pitch de Vendas"}
                    </Button>
                  ))}
                </div>

                {contentQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Gerando conteúdo...
                  </div>
                ) : contentQuery.data ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Seu Conteúdo
                      </h3>
                      <Streamdown>{typeof contentQuery.data.content === "string" ? contentQuery.data.content : "Conteúdo não disponível"}</Streamdown>
                    </div>

                    <Button onClick={handleRegenerateContent} variant="outline" className="w-full">
                      Gerar Novo Conteúdo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Selecione um tipo de conteúdo e clique em Gerar
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Insights da Rede
            </CardTitle>
            <CardDescription>
              Análise estratégica de oportunidades e desafios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insightsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Gerando insights...
              </div>
            ) : insightsQuery.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Indicados Diretos</p>
                    <p className="text-2xl font-bold">{insightsQuery.data.networkMetrics.directDownline}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total na Rede</p>
                    <p className="text-2xl font-bold">{insightsQuery.data.networkMetrics.totalNetwork}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Comissões</p>
                    <p className="text-2xl font-bold">R$ {insightsQuery.data.networkMetrics.totalCommissions.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <Streamdown>{typeof insightsQuery.data.insights === "string" ? insightsQuery.data.insights : "Insights não disponíveis"}</Streamdown>
                </div>

                <Button onClick={() => insightsQuery.refetch()} variant="outline" className="w-full">
                  Atualizar Insights
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Clique em Atualizar para obter insights
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
