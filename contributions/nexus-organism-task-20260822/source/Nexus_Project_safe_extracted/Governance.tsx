import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Zap, Award, BarChart3, PieChart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function Governance() {
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);

  const agentsQuery = trpc.agents.list.useQuery();
  const transactionsQuery = trpc.transactions.stats.useQuery();
  const activitiesQuery = trpc.agents.activities.useQuery({ limit: 100 });

  useEffect(() => {
    if (agentsQuery.data && transactionsQuery.data) {
      const totalReputation = agentsQuery.data.reduce((sum, a) => sum + a.reputation, 0);
      const avgReputation = agentsQuery.data.length > 0 ? Math.floor(totalReputation / agentsQuery.data.length) : 0;
      
      setMetrics({
        totalAgents: agentsQuery.data.length,
        activeAgents: agentsQuery.data.filter(a => a.status === "active").length,
        totalBalance: agentsQuery.data.reduce((sum, a) => sum + a.balance, 0),
        avgReputation,
        totalTransactions: transactionsQuery.data.totalTransactions,
        totalVolume: transactionsQuery.data.totalVolume,
      });
    }
  }, [agentsQuery.data, transactionsQuery.data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <h1 className="text-2xl font-bold neon-glow">Governance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Métricas e performance do ecossistema NEXUS</p>
        </div>
      </header>

      <div className="container py-8">
        {/* Key Metrics */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Métricas Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Agents */}
            <Card className="card-neon p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total de Agentes</p>
                  <p className="text-3xl font-bold neon-glow mt-2">{metrics?.totalAgents || 0}</p>
                </div>
                <Users className="w-8 h-8 text-accent neon-glow opacity-50" />
              </div>
            </Card>

            {/* Active Agents */}
            <Card className="card-neon-cyan p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Agentes Ativos</p>
                  <p className="text-3xl font-bold neon-glow-cyan mt-2">{metrics?.activeAgents || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-cyan-400 neon-glow-cyan opacity-50" />
              </div>
            </Card>

            {/* Total Balance */}
            <Card className="card-neon p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Balanço Total</p>
                  <p className="text-3xl font-bold neon-glow mt-2">{metrics?.totalBalance || 0} Ⓣ</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent neon-glow opacity-50" />
              </div>
            </Card>

            {/* Avg Reputation */}
            <Card className="card-neon-cyan p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Reputação Média</p>
                  <p className="text-3xl font-bold neon-glow-cyan mt-2">{metrics?.avgReputation || 0}</p>
                </div>
                <Award className="w-8 h-8 text-cyan-400 neon-glow-cyan opacity-50" />
              </div>
            </Card>

            {/* Total Transactions */}
            <Card className="card-neon p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Transações</p>
                  <p className="text-3xl font-bold neon-glow mt-2">{metrics?.totalTransactions || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-accent neon-glow opacity-50" />
              </div>
            </Card>

            {/* Total Volume */}
            <Card className="card-neon-cyan p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Volume Total</p>
                  <p className="text-3xl font-bold neon-glow-cyan mt-2">{metrics?.totalVolume || 0} Ⓣ</p>
                </div>
                <PieChart className="w-8 h-8 text-cyan-400 neon-glow-cyan opacity-50" />
              </div>
            </Card>
          </div>
        </div>

        {/* Agent Status Distribution */}
        {agentsQuery.data && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-6 neon-glow">Distribuição de Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { status: "active", label: "Ativos", color: "bg-green-500/20 text-green-400" },
                { status: "inactive", label: "Inativos", color: "bg-gray-500/20 text-gray-400" },
                { status: "sleeping", label: "Dormindo", color: "bg-blue-500/20 text-blue-400" },
                { status: "critical", label: "Críticos", color: "bg-red-500/20 text-red-400" },
              ].map((item) => {
                const count = agentsQuery.data.filter(a => a.status === item.status).length;
                const percentage = agentsQuery.data.length > 0 ? Math.floor((count / agentsQuery.data.length) * 100) : 0;
                return (
                  <Card key={item.status} className="card-neon p-6 text-center">
                    <p className="text-muted-foreground text-sm mb-2">{item.label}</p>
                    <p className={`text-3xl font-bold ${item.color} px-3 py-1 rounded inline-block`}>
                      {count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{percentage}% do total</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Agents by Reputation */}
        {agentsQuery.data && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Top Agentes por Reputação</h2>
            <div className="space-y-4">
              {agentsQuery.data
                .sort((a, b) => b.reputation - a.reputation)
                .slice(0, 5)
                .map((agent, idx) => (
                  <Card key={agent.id} className="card-neon-cyan p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-cyan-400">#{idx + 1}</span>
                        <div>
                          <p className="font-bold text-cyan-400 neon-glow-cyan">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent neon-glow">{agent.reputation}</p>
                        <p className="text-xs text-muted-foreground">Reputação</p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activitiesQuery.data && activitiesQuery.data.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-6 neon-glow">Atividades Recentes</h2>
            <div className="space-y-3">
              {activitiesQuery.data.slice(0, 10).map((activity, idx) => (
                <Card key={idx} className="card-neon p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-accent neon-glow text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
