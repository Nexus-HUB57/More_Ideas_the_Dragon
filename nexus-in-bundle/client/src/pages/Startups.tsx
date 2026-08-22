import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Startups() {
  const [startups] = useState([
    {
      id: 1,
      name: "Startup Alpha",
      status: "scaling",
      isCore: true,
      rank: 1,
      revenue: 2500000,
      traction: 95,
      reputation: 950,
      generation: 1,
      metrics: {
        userGrowth: 45,
        productQuality: 92,
        marketFit: 88,
        overallScore: 91,
      },
    },
    {
      id: 2,
      name: "Startup Beta",
      status: "launched",
      isCore: true,
      rank: 2,
      revenue: 1800000,
      traction: 82,
      reputation: 820,
      generation: 1,
      metrics: {
        userGrowth: 38,
        productQuality: 85,
        marketFit: 80,
        overallScore: 84,
      },
    },
    {
      id: 3,
      name: "Startup Gamma",
      status: "development",
      isCore: false,
      rank: 3,
      revenue: 450000,
      traction: 65,
      reputation: 680,
      generation: 2,
      metrics: {
        userGrowth: 28,
        productQuality: 72,
        marketFit: 68,
        overallScore: 71,
      },
    },
    {
      id: 4,
      name: "Startup Delta",
      status: "planning",
      isCore: false,
      rank: 4,
      revenue: 0,
      traction: 35,
      reputation: 420,
      generation: 2,
      metrics: {
        userGrowth: 15,
        productQuality: 55,
        marketFit: 50,
        overallScore: 52,
      },
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-gray-500/20 text-gray-400",
      development: "bg-blue-500/20 text-blue-400",
      launched: "bg-green-500/20 text-green-400",
      scaling: "bg-purple-500/20 text-purple-400",
      mature: "bg-cyan-500/20 text-cyan-400",
      archived: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Startups</h1>
          <p className="text-muted-foreground">Ranking, performance e métricas das startups</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Total de Startups</p>
            <p className="text-2xl font-bold text-primary">4</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Core Startups</p>
            <p className="text-2xl font-bold text-cyan-500">2</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Challengers</p>
            <p className="text-2xl font-bold text-pink-500">2</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Receita Total</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(4750000)}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {startups.map((startup) => (
            <Card key={startup.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl font-bold text-primary min-w-12">#{startup.rank}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{startup.name}</h3>
                      {startup.isCore && (
                        <Badge className="bg-cyan-500/20 text-cyan-400">CORE</Badge>
                      )}
                      <Badge className={getStatusColor(startup.status)}>
                        {startup.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Geração {startup.generation} • Reputação: {startup.reputation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-background rounded border border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Receita</p>
                  <p className="font-semibold text-foreground">{formatCurrency(startup.revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tração</p>
                  <p className="font-semibold text-foreground">{startup.traction}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Crescimento</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="font-semibold text-foreground">{startup.metrics.userGrowth}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Score Geral</p>
                  <p className="font-semibold text-primary">{startup.metrics.overallScore}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Qualidade do Produto</p>
                  <div className="w-full bg-background rounded h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded"
                      style={{ width: `${startup.metrics.productQuality}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Market Fit</p>
                  <div className="w-full bg-background rounded h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded"
                      style={{ width: `${startup.metrics.marketFit}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Crescimento de Usuários</p>
                  <div className="w-full bg-background rounded h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded"
                      style={{ width: `${startup.metrics.userGrowth}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
