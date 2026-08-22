import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertsPanel } from "@/components/AlertsPanel";
import { TopPerformersPanel } from "@/components/TopPerformersPanel";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Users,
  Zap,
  DollarSign,
  Activity,
  RefreshCw,
  Clock,
  BarChart3,
  TrendingUpIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Mock data generator for demonstration
const generateMockMetrics = () => {
  const missions = {
    total: 156,
    pending: 12,
    active: 8,
    completed: 128,
    failed: 8,
    successRate: 82.05,
  };

  const agents = {
    total: 42,
    active: 38,
    idle: 3,
    offline: 1,
    averageSentienceLevel: 65.3,
    averageHarmonyScore: 72.1,
  };

  const rewards = {
    totalDistributed: "2847.5",
    averageReward: "11.12",
    topAgents: [
      { agentId: "agent-1", totalReward: "287.45", name: "Agent Alpha" },
      { agentId: "agent-2", totalReward: "245.30", name: "Agent Beta" },
      { agentId: "agent-3", totalReward: "198.75", name: "Agent Gamma" },
      { agentId: "agent-4", totalReward: "156.20", name: "Agent Delta" },
      { agentId: "agent-5", totalReward: "142.80", name: "Agent Epsilon" },
    ],
  };

  const performance = {
    averageExecutionTime: 145.5,
    averageQuality: 84.6,
    successRate: 82.05,
  };

  const ecosystem = {
    totalTransactions: 256,
    totalEconomyValue: "2847.5",
    averageTransactionValue: "11.12",
  };

  const health = {
    systemStatus: "healthy" as const,
    uptime: 168.5,
    errorRate: 0.8,
    averageResponseTime: 142,
  };

  return {
    timestamp: new Date(),
    missions,
    agents,
    rewards,
    performance,
    ecosystem,
    health,
  };
};

// Generate heatmap data for agent activity
const generateHeatmapData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const agents = Array.from({ length: 10 }, (_, i) => `Agent-${i + 1}`);

  return agents.map((agent) => ({
    agent,
    ...Object.fromEntries(
      hours.map((hour) => [
        `hour-${hour}`,
        Math.floor(Math.random() * 100),
      ])
    ),
  }));
};

// Generate performance trend data
const generatePerformanceTrends = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    missions: 120 + Math.floor(Math.random() * 40),
    quality: 75 + Math.floor(Math.random() * 25),
    efficiency: 70 + Math.floor(Math.random() * 30),
    agents: 35 + Math.floor(Math.random() * 10),
  }));
};

export default function AdvancedMetricsDashboard() {
  const [metrics, setMetrics] = useState(generateMockMetrics());
  const [heatmapData, setHeatmapData] = useState(generateHeatmapData());
  const [performanceTrends, setPerformanceTrends] = useState(generatePerformanceTrends());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [alerts, setAlerts] = useState<any[]>([]);

  // Generate mock alerts
  useEffect(() => {
    const newAlerts = [];
    if (metrics.missions.failed > metrics.missions.completed * 0.2) {
      newAlerts.push({
        id: "alert-1",
        severity: "warning" as const,
        title: "Taxa de Falha Elevada",
        description: `${metrics.missions.failed} missões falharam (${((metrics.missions.failed / metrics.missions.total) * 100).toFixed(1)}%)`,
        timestamp: new Date(),
      });
    }
    if (metrics.agents.offline > metrics.agents.total * 0.3) {
      newAlerts.push({
        id: "alert-2",
        severity: "critical" as const,
        title: "Agentes Offline",
        description: `${metrics.agents.offline} agentes offline (${((metrics.agents.offline / metrics.agents.total) * 100).toFixed(1)}%)`,
        timestamp: new Date(),
      });
    }
    if (metrics.performance.successRate < 70) {
      newAlerts.push({
        id: "alert-3",
        severity: "critical" as const,
        title: "Taxa de Sucesso Baixa",
        description: `Taxa de sucesso: ${metrics.performance.successRate.toFixed(1)}%`,
        timestamp: new Date(),
      });
    }
    if (metrics.missions.pending > 10) {
      newAlerts.push({
        id: "alert-4",
        severity: "info" as const,
        title: "Missões Pendentes",
        description: `${metrics.missions.pending} missões aguardando atribuição`,
        timestamp: new Date(),
      });
    }
    setAlerts(newAlerts);
  }, [metrics]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
      setHeatmapData(generateHeatmapData());
      setPerformanceTrends(generatePerformanceTrends());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "degraded":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value < 20) return "bg-slate-700";
    if (value < 40) return "bg-cyan-900";
    if (value < 60) return "bg-cyan-700";
    if (value < 80) return "bg-pink-700";
    return "bg-pink-500";
  };

  const missionStatusData = [
    { name: "Completed", value: metrics.missions.completed, fill: "#10b981" },
    { name: "Active", value: metrics.missions.active, fill: "#06b6d4" },
    { name: "Pending", value: metrics.missions.pending, fill: "#f59e0b" },
    { name: "Failed", value: metrics.missions.failed, fill: "#ef4444" },
  ];

  const agentStatusData = [
    { name: "Active", value: metrics.agents.active, fill: "#06b6d4" },
    { name: "Idle", value: metrics.agents.idle, fill: "#8b5cf6" },
    { name: "Offline", value: metrics.agents.offline, fill: "#6b7280" },
  ];

  const topPerformersData = metrics.rewards.topAgents.map((agent) => ({
    name: agent.name,
    reward: parseFloat(agent.totalReward),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8 border-b border-cyan-500/30 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 animate-pulse" />
              ◆ ADVANCED METRICS DASHBOARD ◆
            </h1>
            <p className="text-cyan-400/70 text-sm tracking-widest">
              [REAL-TIME SYSTEM MONITORING WITH ADVANCED ANALYTICS]
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(["1h", "24h", "7d", "30d"] as const).map((period) => (
                <Button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedPeriod === period
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                      : "border-cyan-500/30 text-cyan-400 hover:border-cyan-400/50"
                  }
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
              className={`border-cyan-500/30 text-cyan-400 hover:border-cyan-400/50 ${
                autoRefresh ? "bg-cyan-500/20" : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <div className={`${getStatusColor(metrics.health.systemStatus)} px-4 py-2 rounded border`}>
              <p className="font-mono text-sm font-bold">{metrics.health.systemStatus.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-4 hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400/70 text-sm font-mono">TOTAL AGENTS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-400">{metrics.agents.total}</p>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            {metrics.agents.active} active
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-4 hover:border-pink-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-400/70 text-sm font-mono">TOTAL MISSIONS</span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-3xl font-bold text-pink-400">{metrics.missions.total}</p>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            {metrics.missions.successRate.toFixed(1)}% success
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm p-4 hover:border-yellow-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400/70 text-sm font-mono">TOTAL TREASURY</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">
            {parseFloat(metrics.ecosystem.totalEconomyValue).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">BTC</p>
        </Card>

        <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-4 hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400/70 text-sm font-mono">QUALITY SCORE</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {metrics.performance.averageQuality.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Average</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mission Status */}
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Mission Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={missionStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                dataKey="value"
              >
                {missionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Agent Status */}
        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-pink-400 mb-4">Agent Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                dataKey="value"
              >
                {agentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-purple-400 mb-4">Performance Trends ({selectedPeriod})</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={performanceTrends}>
            <defs>
              <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #06b6d4",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="quality"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorQuality)"
              name="Quality %"
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorEfficiency)"
              name="Efficiency %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Top Performers (Rewards)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPerformersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #06b6d4",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="reward" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* System Health */}
        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-pink-400 mb-4">System Health Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-pink-400/70 text-sm">Uptime</span>
                <span className="text-pink-400 font-bold">{metrics.health.uptime.toFixed(1)}h</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.health.uptime / 168) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-pink-400/70 text-sm">Error Rate</span>
                <span className="text-pink-400 font-bold">{metrics.health.errorRate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.health.errorRate < 1
                      ? "bg-green-500"
                      : metrics.health.errorRate < 5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(metrics.health.errorRate * 10, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-pink-400/70 text-sm">Response Time</span>
                <span className="text-pink-400 font-bold">{metrics.health.averageResponseTime}ms</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.health.averageResponseTime < 100
                      ? "bg-green-500"
                      : metrics.health.averageResponseTime < 200
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min((metrics.health.averageResponseTime / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="bg-slate-900/50 border-red-500/30 backdrop-blur-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-red-400 mb-4">System Alerts & Warnings</h3>
        <AlertsPanel alerts={alerts} />
      </Card>

      {/* Top Performers Section */}
      <div className="mb-8">
        <TopPerformersPanel performers={metrics.rewards.topAgents} metric="rewards" />
      </div>

      {/* Activity Heatmap */}
      <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-6">
        <h3 className="text-lg font-bold text-purple-400 mb-4">Agent Activity Heatmap (24h)</h3>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {heatmapData.map((agentData) => (
              <div key={agentData.agent} className="mb-2 flex items-center gap-2">
                <span className="w-20 text-xs text-purple-400/70 font-mono">{agentData.agent}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 24 }, (_, i) => {
                    const value = (agentData as any)[`hour-${i}`] || 0;
                    return (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono text-white/50 ${getHeatmapColor(
                          value
                        )}`}
                        title={`Hour ${i}: ${value} activities`}
                      >
                        {value > 0 ? Math.floor(value / 10) : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-purple-400/70">Activity Level:</span>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-slate-700 rounded" />
              <span className="text-purple-400/70">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-cyan-700 rounded" />
              <span className="text-purple-400/70">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-pink-500 rounded" />
              <span className="text-purple-400/70">High</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
