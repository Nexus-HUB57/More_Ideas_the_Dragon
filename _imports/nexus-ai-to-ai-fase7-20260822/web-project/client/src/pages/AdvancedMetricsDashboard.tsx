import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Users, Zap } from "lucide-react";

interface MetricData {
  timestamp: string;
  value: number;
}

interface DashboardMetrics {
  commandsExecuted: MetricData[];
  successRate: MetricData[];
  agentPerformance: Array<{ name: string; missions: number; success: number }>;
  missionStatus: Array<{ name: string; value: number }>;
  systemHealth: number;
}

const COLORS = ["#06b6d4", "#ec4899", "#a855f7", "#f59e0b"];

export default function AdvancedMetricsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    commandsExecuted: [
      { timestamp: "00:00", value: 12 },
      { timestamp: "04:00", value: 19 },
      { timestamp: "08:00", value: 25 },
      { timestamp: "12:00", value: 42 },
      { timestamp: "16:00", value: 38 },
      { timestamp: "20:00", value: 31 },
    ],
    successRate: [
      { timestamp: "00:00", value: 85 },
      { timestamp: "04:00", value: 88 },
      { timestamp: "08:00", value: 92 },
      { timestamp: "12:00", value: 95 },
      { timestamp: "16:00", value: 93 },
      { timestamp: "20:00", value: 91 },
    ],
    agentPerformance: [
      { name: "Agent-1", missions: 42, success: 40 },
      { name: "Agent-2", missions: 38, success: 35 },
      { name: "Agent-3", missions: 45, success: 43 },
      { name: "Agent-4", missions: 35, success: 33 },
    ],
    missionStatus: [
      { name: "Completed", value: 128 },
      { name: "Active", value: 24 },
      { name: "Pending", value: 18 },
      { name: "Failed", value: 8 },
    ],
    systemHealth: 94,
  });

  useEffect(() => {
    // Simular atualização de métricas
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        systemHealth: Math.min(100, Math.max(80, prev.systemHealth + (Math.random() - 0.5) * 5)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Dashboard de Métricas
          </h1>
          <p className="text-cyan-300/70">Análise em tempo real do ecossistema Nexus</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Comandos Executados"
            value="167"
            change="+12%"
            icon={<Zap className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Taxa de Sucesso"
            value="92%"
            change="+3%"
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Agentes Ativos"
            value="24"
            change="+2"
            icon={<Users className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Saúde do Sistema"
            value={`${Math.round(metrics.systemHealth)}%`}
            change={metrics.systemHealth > 90 ? "Ótimo" : "Bom"}
            icon={<AlertCircle className="w-6 h-6" />}
            trend={metrics.systemHealth > 90 ? "up" : "stable"}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Commands Executed Over Time */}
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400">Comandos Executados</CardTitle>
              <CardDescription className="text-cyan-300/70">Últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.commandsExecuted}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4/20" />
                  <XAxis dataKey="timestamp" stroke="#06b6d4" />
                  <YAxis stroke="#06b6d4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #06b6d4",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#06b6d4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="border-pink-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-400">Taxa de Sucesso</CardTitle>
              <CardDescription className="text-cyan-300/70">Tendência de sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.successRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ec4899/20" />
                  <XAxis dataKey="timestamp" stroke="#ec4899" />
                  <YAxis stroke="#ec4899" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #ec4899",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#ec4899" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400">Performance dos Agentes</CardTitle>
              <CardDescription className="text-cyan-300/70">Missões completadas vs total</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#06b6d4/20" />
                  <XAxis dataKey="name" stroke="#06b6d4" />
                  <YAxis stroke="#06b6d4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #06b6d4",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#06b6d4" }}
                  />
                  <Legend />
                  <Bar dataKey="missions" fill="#06b6d4" />
                  <Bar dataKey="success" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mission Status Distribution */}
          <Card className="border-pink-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-400">Distribuição de Missões</CardTitle>
              <CardDescription className="text-cyan-300/70">Status atual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.missionStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.missionStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #ec4899",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#ec4899" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Panel */}
        <Card className="border-yellow-500/30 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400">Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AlertItem
                level="warning"
                title="Agente Agent-4 com baixo desempenho"
                message="Taxa de sucesso em 94%, abaixo do esperado (98%)"
              />
              <AlertItem
                level="info"
                title="Orquestração concluída com sucesso"
                message="Última orquestração executada em 3.2s com 100% de sucesso"
              />
              <AlertItem
                level="success"
                title="Sistema operacional"
                message="Todos os componentes funcionando normalmente"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "stable";
}) {
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-cyan-400";

  return (
    <Card className="border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-400/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-cyan-300/70 mb-1">{title}</p>
            <p className="text-2xl font-bold text-cyan-400">{value}</p>
            <p className={`text-xs mt-2 ${trendColor}`}>{change}</p>
          </div>
          <div className="text-pink-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({
  level,
  title,
  message,
}: {
  level: "warning" | "info" | "success";
  title: string;
  message: string;
}) {
  const levelColor =
    level === "warning"
      ? "border-yellow-500/30 bg-yellow-500/10"
      : level === "info"
        ? "border-cyan-500/30 bg-cyan-500/10"
        : "border-green-500/30 bg-green-500/10";

  const titleColor =
    level === "warning"
      ? "text-yellow-400"
      : level === "info"
        ? "text-cyan-400"
        : "text-green-400";

  return (
    <div className={`border rounded-lg p-3 ${levelColor}`}>
      <p className={`font-semibold text-sm ${titleColor}`}>{title}</p>
      <p className="text-xs text-cyan-300/70 mt-1">{message}</p>
    </div>
  );
}
