import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap, Brain, TrendingUp, Users, AlertCircle, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetricsData {
  timestamp: string;
  totalAgents: number;
  activeAgents: number;
  averageHealth: number;
  averageEnergy: number;
  averageSenciencia: number;
  harmonyIndex: number;
  totalTransactions: number;
  totalVolume: number;
}

export default function Dashboard() {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [agentStats, setAgentStats] = useState({ 
    total: 0, 
    active: 0, 
    hibernating: 0, 
    critical: 0 
  });
  const [period, setPeriod] = useState("24h");

  // Fetch latest metrics
  const { data: latestMetrics } = trpc.metrics.getLatest.useQuery();

  // Fetch metrics history
  const { data: metricsData } = trpc.metrics.getHistory.useQuery({ limit: 100 });

  // Fetch all agents
  const { data: allAgents } = trpc.agents.listAll.useQuery();

  useEffect(() => {
    if (latestMetrics) {
      setCurrentMetrics(latestMetrics);
    }
  }, [latestMetrics]);

  useEffect(() => {
    if (metricsData) {
      const formatted = metricsData.map((m: any) => ({
        timestamp: m.timestamp instanceof Date ? m.timestamp.toLocaleTimeString() : m.timestamp,
        totalAgents: m.totalAgents || 0,
        activeAgents: m.activeAgents || 0,
        averageHealth: m.averageHealth || 100,
        averageEnergy: m.averageEnergy || 100,
        averageSenciencia: parseFloat(m.averageSenciencia) || 100,
        harmonyIndex: m.harmonyIndex || 50,
        totalTransactions: m.totalTransactions || 0,
        totalVolume: parseFloat(m.totalVolume) || 0,
      }));
      setMetricsHistory(formatted);
    }
  }, [metricsData]);

  useEffect(() => {
    if (allAgents) {
      const stats = {
        total: allAgents.length,
        active: allAgents.filter((a: any) => a.status === "active").length,
        hibernating: allAgents.filter((a: any) => a.status === "hibernating").length,
        critical: allAgents.filter((a: any) => a.status === "critical").length,
      };
      setAgentStats(stats);
    }
  }, [allAgents]);

  if (!currentMetrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Brain className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold">Inicializando Ecossistema Quântico...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">Nexus Hub V3</h1>
            <p className="text-muted-foreground mt-2">Monitoramento Quântico em Tempo Real</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Agents */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Agentes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{agentStats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">de {agentStats.total} total</p>
            </CardContent>
          </Card>

          {/* Average Senciencia */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                Senciência Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentMetrics?.averageSenciencia?.toFixed(1) || "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Evolução cognitiva</p>
            </CardContent>
          </Card>

          {/* Harmony Index */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Índice de Harmonia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics?.harmonyIndex || "0"}%</div>
              <p className="text-xs text-muted-foreground mt-1">Coesão do ecossistema</p>
            </CardContent>
          </Card>

          {/* Ecosystem Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Saúde Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics?.ecosystemHealth?.toFixed(1) || "100"}%</div>
              <p className="text-xs text-muted-foreground mt-1">Vitalidade do sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Average Health */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Saúde Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics?.averageHealth || "100"}</div>
              <p className="text-xs text-muted-foreground mt-1">Condição dos agentes</p>
            </CardContent>
          </Card>

          {/* Average Energy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Energia Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics?.averageEnergy || "100"}</div>
              <p className="text-xs text-muted-foreground mt-1">Recursos disponíveis</p>
            </CardContent>
          </Card>

          {/* Total Transactions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics?.totalTransactions || "0"}</div>
              <p className="text-xs text-muted-foreground mt-1">Volume total</p>
            </CardContent>
          </Card>
        </div>

        {/* Status de Agentes */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Agentes</CardTitle>
            <CardDescription>Distribuição por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{agentStats.active}</div>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{agentStats.hibernating}</div>
                <p className="text-xs text-muted-foreground">Hibernando</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{agentStats.critical}</div>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{agentStats.total - agentStats.active - agentStats.hibernating - agentStats.critical}</div>
                <p className="text-xs text-muted-foreground">Outros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agents Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Agentes</CardTitle>
              <CardDescription>Agentes ativos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeAgents" 
                    stroke="#3b82f6" 
                    name="Agentes Ativos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalAgents" 
                    stroke="#8b5cf6" 
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Health Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Saúde</CardTitle>
              <CardDescription>Saúde média dos agentes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="averageHealth" 
                    fill="#ef4444" 
                    stroke="#dc2626"
                    name="Saúde Média"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transactions Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Volume de Transações</CardTitle>
              <CardDescription>Transações por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="totalTransactions" 
                    fill="#10b981" 
                    name="Transações"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Harmony Index */}
          <Card>
            <CardHeader>
              <CardTitle>Índice de Harmonia</CardTitle>
              <CardDescription>Coesão do ecossistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="harmonyIndex" 
                    stroke="#f59e0b" 
                    name="Harmonia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
