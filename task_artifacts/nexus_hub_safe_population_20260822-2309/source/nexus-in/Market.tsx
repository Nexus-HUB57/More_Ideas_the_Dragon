import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function Market() {
  const { data: marketData, isLoading: marketLoading } = trpc.market.getData.useQuery();
  const { data: insights, isLoading: insightsLoading } = trpc.market.getInsights.useQuery({ limit: 20 });
  const { data: arbitrage, isLoading: arbitrageLoading } = trpc.market.getArbitrage.useQuery();

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      bullish: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      bearish: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[sentiment] || colors.neutral;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Oráculo de Mercado</h1>

      {/* Market Data */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Dados de Mercado</h2>
        {marketLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : marketData && marketData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.map((data) => (
              <Card key={data.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{data.asset}</h3>
                      <p className="text-sm text-muted-foreground">{data.source}</p>
                    </div>
                    {data.priceChange24h && (
                      <div className="flex items-center gap-1">
                        {data.priceChange24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            data.priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {data.priceChange24h >= 0 ? "+" : ""}
                          {data.priceChange24h}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-foreground">${data.price.toLocaleString()}</p>
                    {data.volume24h && (
                      <p className="text-sm text-muted-foreground">
                        Volume 24h: ${data.volume24h.toLocaleString()}
                      </p>
                    )}
                    {data.sentiment && (
                      <Badge className={getSentimentColor(data.sentiment)}>
                        {data.sentiment.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum dado de mercado disponível</p>
        )}
      </div>

      {/* Market Insights */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Análise de Sentimento</h2>
        {insightsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{insight.content}</p>
                    </div>
                    <Badge className={getSentimentColor(insight.sentiment)}>
                      {insight.sentiment.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Confiança</p>
                      <p className="text-lg font-semibold text-foreground">{insight.confidence}%</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Fonte</p>
                      <p className="text-sm font-semibold text-foreground">{insight.source}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma análise disponível</p>
        )}
      </div>

      {/* Arbitrage Opportunities */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Oportunidades de Arbitragem</h2>
        {arbitrageLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : arbitrage && arbitrage.length > 0 ? (
          <div className="space-y-4">
            {arbitrage.map((opp) => (
              <Card key={opp.id} className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-foreground">{opp.asset}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {opp.exchangeFrom} → {opp.exchangeTo}
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {opp.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Diferença</p>
                      <p className="text-lg font-semibold text-foreground">
                        ${opp.priceDifference.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Lucro Potencial</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${opp.profitPotential.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Confiança</p>
                      <p className="text-lg font-semibold text-foreground">{opp.confidence}%</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma oportunidade de arbitragem identificada</p>
        )}
      </div>
    </div>
  );
}
