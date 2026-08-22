import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function Market() {
  const [marketData] = useState([
    {
      id: 1,
      asset: "BTC",
      price: 45250,
      priceChange24h: 3.5,
      sentiment: "bullish",
      volume24h: 28500000,
      source: "Binance",
    },
    {
      id: 2,
      asset: "ETH",
      price: 2850,
      priceChange24h: 2.1,
      sentiment: "bullish",
      volume24h: 15200000,
      source: "Binance",
    },
    {
      id: 3,
      asset: "SOL",
      price: 185,
      priceChange24h: -1.2,
      sentiment: "neutral",
      volume24h: 8500000,
      source: "Binance",
    },
    {
      id: 4,
      asset: "NEXUS",
      price: 12.5,
      priceChange24h: 5.8,
      sentiment: "bullish",
      volume24h: 2300000,
      source: "Internal",
    },
  ]);

  const [arbitrage] = useState([
    {
      id: 1,
      asset: "BTC",
      exchangeFrom: "Binance",
      exchangeTo: "Kraken",
      priceDifference: 250,
      profitPotential: 125000,
      confidence: 92,
      status: "identified",
    },
    {
      id: 2,
      asset: "ETH",
      exchangeFrom: "Coinbase",
      exchangeTo: "Binance",
      priceDifference: 45,
      profitPotential: 35000,
      confidence: 85,
      status: "executing",
    },
  ]);

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      bullish: "bg-green-500/20 text-green-400",
      bearish: "bg-red-500/20 text-red-400",
      neutral: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[sentiment] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      identified: "bg-blue-500/20 text-blue-400",
      executing: "bg-purple-500/20 text-purple-400",
      completed: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Market Oracle</h1>
          <p className="text-muted-foreground">Dados de mercado, análise de sentimento e oportunidades de arbitragem</p>
        </div>

        {/* Market Data */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Dados de Mercado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.map((data) => (
              <Card key={data.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{data.asset}</h3>
                    <p className="text-xs text-muted-foreground">{data.source}</p>
                  </div>
                  <Badge className={getSentimentColor(data.sentiment)}>
                    {data.sentiment}
                  </Badge>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary mb-2">
                    {data.asset === "BTC" || data.asset === "ETH" 
                      ? `$${data.price.toLocaleString()}`
                      : `$${data.price.toFixed(2)}`
                    }
                  </p>
                  <div className="flex items-center gap-2">
                    {data.priceChange24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={data.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {data.priceChange24h >= 0 ? "+" : ""}{data.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Volume 24h: {formatCurrency(data.volume24h)}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Arbitrage Opportunities */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Oportunidades de Arbitragem</h2>
          <div className="space-y-4">
            {arbitrage.map((opp) => (
              <Card key={opp.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <BarChart3 className="h-6 w-6 text-cyan-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">{opp.asset}</h3>
                      <p className="text-sm text-muted-foreground">
                        {opp.exchangeFrom} → {opp.exchangeTo}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(opp.status)}>
                    {opp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded border border-border mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Diferença de Preço</p>
                    <p className="font-semibold text-foreground">${opp.priceDifference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lucro Potencial</p>
                    <p className="font-semibold text-green-500">{formatCurrency(opp.profitPotential)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Confiança</p>
                    <p className="font-semibold text-primary">{opp.confidence}%</p>
                  </div>
                </div>

                <div className="w-full bg-background rounded h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded"
                    style={{ width: `${opp.confidence}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
