import { useState } from "react";
import { useRealTimeMetrics, useMockMetrics } from "@/hooks/useRealTimeData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsChart } from "@/components/MetricsChart";
import { StatusBadge, ProgressBadge } from "@/components/StatusBadge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { CardSkeleton } from "@/components/SkeletonLoader";
import {
  Activity,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: realMetrics, loading, isConnected } = useRealTimeMetrics();
  const mockMetrics = useMockMetrics();
  const metrics = realMetrics || mockMetrics;

  // Dados simulados para gráficos
  const harmonyTrend = [
    { name: "00:00", value: 72 },
    { name: "04:00", value: 75 },
    { name: "08:00", value: 78 },
    { name: "12:00", value: 82 },
    { name: "16:00", value: 85 },
    { name: "20:00", value: 87 },
    { name: "Agora", value: metrics.harmonyLevel },
  ];

  const agentMetrics = [
    { name: "Seg", health: 92, energy: 85 },
    { name: "Ter", health: 88, energy: 78 },
    { name: "Qua", health: 95, energy: 92 },
    { name: "Qui", health: 91, energy: 88 },
    { name: "Sex", health: 93, energy: 90 },
    { name: "Sab", health: 96, energy: 94 },
    { name: "Dom", health: metrics.avgHealth, energy: metrics.avgEnergy },
  ];

  if (loading && !realMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Carregando dados em tempo real...</p>
          </div>
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">
            {isConnected ? "Dados em tempo real" : "Modo offline - dados simulados"}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agentes Ativos */}
          <Card className="nexus-card border-border/50 hover:border-blue-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Agentes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics.activeAgents}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics.activeAgents > 10 ? "✓ Ótimo" : "⚠ Baixo"}
              </p>
            </CardContent>
          </Card>

          {/* Nível de Harmonia */}
          <Card className="nexus-card border-border/50 hover:border-purple-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Harmonia
                <InfoTooltip content="Nível de sincronização entre agentes (0-100)" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Math.round(metrics.harmonyLevel)}%
              </div>
              <ProgressBadge
                value={metrics.harmonyLevel}
                max={100}
                showPercent={false}
              />
            </CardContent>
          </Card>

          {/* Saúde Média */}
          <Card className="nexus-card border-border/50 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Saúde Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Math.round(metrics.avgHealth)}%
              </div>
              <StatusBadge
                status={metrics.avgHealth > 80 ? "success" : "warning"}
                label={metrics.avgHealth > 80 ? "Saudável" : "Atenção"}
                size="sm"
              />
            </CardContent>
          </Card>

          {/* Taxa de Sucesso */}
          <Card className="nexus-card border-border/50 hover:border-orange-500/50 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Math.round(metrics.successRate)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics.missionsCompleted}/{metrics.totalMissions} missões
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsChart
            title="Tendência de Harmonia"
            description="Últimas 24 horas"
            data={harmonyTrend}
            type="area"
            dataKey="value"
            color="#a78bfa"
          />
          <MetricsChart
            title="Saúde vs Energia dos Agentes"
            description="Comparação semanal"
            data={agentMetrics}
            type="line"
            dataKey="health"
            dataKeySecondary="energy"
            color="#3b82f6"
            colorSecondary="#10b981"
          />
        </div>

        {/* Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentimento de Mercado */}
          <Card className="nexus-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Sentimento de Mercado</CardTitle>
              <CardDescription>Análise em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusBadge
                status={
                  metrics.marketSentiment === "altista"
                    ? "success"
                    : metrics.marketSentiment === "neutro"
                      ? "info"
                      : "warning"
                }
                label={metrics.marketSentiment.toUpperCase()}
                animated
              />
              <p className="text-sm text-slate-400">
                {metrics.marketSentiment === "altista"
                  ? "Mercado em alta. Bom momento para operações."
                  : metrics.marketSentiment === "neutro"
                    ? "Mercado neutro. Aguardando sinais."
                    : "Mercado em baixa. Cautela recomendada."}
              </p>
            </CardContent>
          </Card>

          {/* Energia Média */}
          <Card className="nexus-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Energia Média</CardTitle>
              <CardDescription>Recursos disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBadge
                value={metrics.avgEnergy}
                max={100}
                label="Energia dos Agentes"
              />
            </CardContent>
          </Card>

          {/* Missões */}
          <Card className="nexus-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Atividade de Missões</CardTitle>
              <CardDescription>Últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Concluídas</span>
                  <span className="font-semibold text-green-400">
                    {metrics.missionsCompleted}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pendentes</span>
                  <span className="font-semibold text-yellow-400">
                    {metrics.totalMissions - metrics.missionsCompleted}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
