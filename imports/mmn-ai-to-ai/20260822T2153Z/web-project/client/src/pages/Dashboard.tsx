import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Zap, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: metrics, isLoading, refetch } = trpc.dashboard.getMetrics.useQuery();
  const { data: recentSales } = trpc.dashboard.getRecentSales.useQuery();

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Mock data for chart
  const chartData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 600 },
    { name: "Mar", value: 800 },
    { name: "Apr", value: 1000 },
    { name: "May", value: 1200 },
    { name: "Jun", value: 1500 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted mt-1">Bem-vindo de volta! Aqui está seu resumo de hoje.</p>
        </div>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Commissions */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Comissões Totais</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                R$ {metrics?.totalCommissions || "0,00"}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        {/* Available Balance */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Saldo Disponível</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                R$ {metrics?.availableBalance || "0,00"}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Agent Status */}
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Status do Agente IA</p>
              <p className="text-lg font-bold text-foreground mt-2 capitalize">
                {metrics?.agentStatus || "Inativo"}
              </p>
              <div className="flex gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-muted">Energia:</span>
                  <span className="font-bold text-foreground ml-1">{metrics?.agentEnergy || 0}%</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted">Saúde:</span>
                  <span className="font-bold text-foreground ml-1">{metrics?.agentHealth || 0}%</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <Card className="lg:col-span-2 p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ganhos Históricos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                formatter={(value) => `R$ ${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                dot={{ fill: "#3b82f6" }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Sales */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vendas Recentes</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentSales && recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        R$ {typeof sale.amount === 'string' ? sale.amount : sale.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted capitalize">{sale.status}</p>
                    </div>
                    <span className="text-xs text-muted">
                      {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted text-center py-8">Nenhuma venda recente</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="w-full h-12 text-base">Solicitar Saque</Button>
        <Button className="w-full h-12 text-base" variant="outline">Compartilhar Link</Button>
      </div>
    </div>
  );
}
