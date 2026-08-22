import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface SystemMetrics {
  timestamp: Date;
  agents: {
    total: number;
    active: number;
    dormant: number;
    dissolved: number;
    averageSentience: number;
    averageHarmony: number;
    averageReputation: number;
  };
  missions: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    failed: number;
    successRate: number;
    averageCompletionTime: number;
  };
  economy: {
    totalTreasury: number;
    totalTransactions: number;
    averageRewardPerMission: number;
    topAgentBalance: number;
    bottomAgentBalance: number;
  };
  performance: {
    orchestrationScore: number;
    executionEfficiency: number;
    qualityScore: number;
    systemThroughput: number;
  };
  health: {
    systemStatus: "healthy" | "degraded" | "critical";
    uptime: number;
    errorRate: number;
    averageResponseTime: number;
    lastCheckpoint: Date;
  };
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<"agents" | "missions" | "economy" | "performance">(
    "missions"
  );

  useEffect(() => {
    // Simular coleta de métricas
    const mockMetrics: SystemMetrics = {
      timestamp: new Date(),
      agents: {
        total: 42,
        active: 38,
        dormant: 3,
        dissolved: 1,
        averageSentience: 65.3,
        averageHarmony: 72.1,
        averageReputation: 145,
      },
      missions: {
        total: 156,
        pending: 12,
        active: 8,
        completed: 128,
        failed: 8,
        successRate: 82.05,
        averageCompletionTime: 145.5,
      },
      economy: {
        totalTreasury: 2847.5,
        totalTransactions: 256,
        averageRewardPerMission: 11.12,
        topAgentBalance: 287.45,
        bottomAgentBalance: 0.5,
      },
      performance: {
        orchestrationScore: 87.3,
        executionEfficiency: 79.2,
        qualityScore: 84.6,
        systemThroughput: 2.1,
      },
      health: {
        systemStatus: "healthy",
        uptime: 168.5,
        errorRate: 0.8,
        averageResponseTime: 142,
        lastCheckpoint: new Date(),
      },
    };

    setMetrics(mockMetrics);

    // Simular histórico
    const history = Array.from({ length: 12 }, (_, i) => ({
      time: `${i}:00`,
      missions: 120 + Math.random() * 30,
      agents: 35 + Math.random() * 10,
      performance: 75 + Math.random() * 20,
    }));
    setMetricsHistory(history);
  }, []);

  if (!metrics) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400 bg-green-400/10";
      case "degraded":
        return "text-yellow-400 bg-yellow-400/10";
      case "critical":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const missionStatusData = [
    { name: "Completed", value: metrics.missions.completed, fill: "#10b981" },
    { name: "Active", value: metrics.missions.active, fill: "#06b6d4" },
    { name: "Pending", value: metrics.missions.pending, fill: "#f59e0b" },
    { name: "Failed", value: metrics.missions.failed, fill: "#ef4444" },
  ];

  const agentStatusData = [
    { name: "Active", value: metrics.agents.active, fill: "#06b6d4" },
    { name: "Dormant", value: metrics.agents.dormant, fill: "#8b5cf6" },
    { name: "Dissolved", value: metrics.agents.dissolved, fill: "#6b7280" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8 border-b border-cyan-500/30 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8" />
              ◆ METRICS DASHBOARD ◆
            </h1>
            <p className="text-cyan-400/70 text-sm tracking-widest">
              [REAL-TIME SYSTEM MONITORING & ANALYTICS]
            </p>
          </div>
          <div className={`${getStatusColor(metrics.health.systemStatus)} px-4 py-2 rounded border`}>
            <p className="font-mono text-sm font-bold">{metrics.health.systemStatus.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400/70 text-sm font-mono">TOTAL AGENTS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-cyan-400">{metrics.agents.total}</p>
          <p className="text-xs text-green-400 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {metrics.agents.active} active
          </p>
        </Card>

        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-400/70 text-sm font-mono">TOTAL MISSIONS</span>
            <Zap className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-3xl font-bold text-pink-400">{metrics.missions.total}</p>
          <p className="text-xs text-green-400 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {metrics.missions.successRate.toFixed(1)}% success
          </p>
        </Card>

        <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400/70 text-sm font-mono">TOTAL TREASURY</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">
            {metrics.economy.totalTreasury.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">BTC</p>
        </Card>

        <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400/70 text-sm font-mono">PERFORMANCE</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {metrics.performance.orchestrationScore.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Orchestration</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Mission Status Pie Chart */}
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
                fill="#8884d8"
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

        {/* Agent Status Pie Chart */}
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
                fill="#8884d8"
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

      {/* Time Series Chart */}
      <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-purple-400 mb-4">System Activity (Last 12 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metricsHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #06b6d4",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="missions"
              stroke="#06b6d4"
              dot={false}
              strokeWidth={2}
              name="Missions"
            />
            <Line
              type="monotone"
              dataKey="agents"
              stroke="#ec4899"
              dot={false}
              strokeWidth={2}
              name="Agents"
            />
            <Line
              type="monotone"
              dataKey="performance"
              stroke="#a855f7"
              dot={false}
              strokeWidth={2}
              name="Performance"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Agent Metrics */}
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Agent Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Average Sentience:</span>
              <span className="text-cyan-400 font-mono">{metrics.agents.averageSentience.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Harmony:</span>
              <span className="text-cyan-400 font-mono">{metrics.agents.averageHarmony.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Reputation:</span>
              <span className="text-cyan-400 font-mono">{metrics.agents.averageReputation}</span>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-pink-400 mb-4">Performance Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Execution Efficiency:</span>
              <span className="text-pink-400 font-mono">{metrics.performance.executionEfficiency.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Quality Score:</span>
              <span className="text-pink-400 font-mono">{metrics.performance.qualityScore.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">System Throughput:</span>
              <span className="text-pink-400 font-mono">{metrics.performance.systemThroughput.toFixed(2)} ops/h</span>
            </div>
          </div>
        </Card>

        {/* Economy Metrics */}
        <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Economy Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Transactions:</span>
              <span className="text-yellow-400 font-mono">{metrics.economy.totalTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Reward/Mission:</span>
              <span className="text-yellow-400 font-mono">{metrics.economy.averageRewardPerMission.toFixed(2)} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Top Agent Balance:</span>
              <span className="text-yellow-400 font-mono">{metrics.economy.topAgentBalance.toFixed(2)} BTC</span>
            </div>
          </div>
        </Card>

        {/* Health Metrics */}
        <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold text-green-400 mb-4">System Health</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-green-400 font-mono">{metrics.health.uptime.toFixed(1)} hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Error Rate:</span>
              <span className="text-green-400 font-mono">{metrics.health.errorRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Response Time:</span>
              <span className="text-green-400 font-mono">{metrics.health.averageResponseTime}ms</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="border-t border-cyan-500/30 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500 font-mono">
          <div>
            <span className="text-cyan-400">▸</span> Last Update: {new Date().toLocaleTimeString()}
          </div>
          <div>
            <span className="text-pink-400">◆</span> Missions/Hour: {metrics.performance.systemThroughput.toFixed(2)}
          </div>
          <div>
            <span className="text-green-400">●</span> System Status: {metrics.health.systemStatus.toUpperCase()}
          </div>
          <div className="text-right">
            <span className="text-purple-400">⚡</span> Metrics v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
