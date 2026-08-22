import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, RefreshCw } from "lucide-react";

export default function MarketFeed() {
  const syncDataMutation = trpc.market.syncData.useMutation();
  const sentimentQuery = trpc.market.analyzeMarketSentiment.useQuery({
    symbols: ["BTC", "ETH"],
  });

  const handleSyncData = async (source: "coingecko" | "binance") => {
    await syncDataMutation.mutateAsync({ source });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-500";
      case "bearish":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="nexus-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Market Feed
        </CardTitle>
        <CardDescription>Dados de mercado em tempo real e análise de sentimento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          <Button
            onClick={() => handleSyncData("coingecko")}
            disabled={syncDataMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sincronizar CoinGecko
          </Button>
          <Button
            onClick={() => handleSyncData("binance")}
            disabled={syncDataMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sincronizar Binance
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h3 className="font-semibold">Sentimento de Mercado</h3>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">BTC/USD</span>
              <span className={`font-semibold ${getSentimentColor(sentimentQuery.data || "neutral")}`}>
                {sentimentQuery.data || "Analisando..."}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ETH/USD</span>
              <span className={`font-semibold ${getSentimentColor(sentimentQuery.data || "neutral")}`}>
                {sentimentQuery.data || "Analisando..."}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Símbolos Monitorados</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {["BTC", "ETH", "ADA", "SOL"].map((symbol) => (
              <div key={symbol} className="rounded-lg border border-border p-3">
                <p className="font-medium">{symbol}</p>
                <p className="text-xs text-muted-foreground">Monitorando...</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold">Informações</p>
          <p className="mt-2">
            Os dados de mercado são sincronizados periodicamente com CoinGecko e Binance. O sentimento
            é calculado baseado em mudanças de preço nas últimas 24 horas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
