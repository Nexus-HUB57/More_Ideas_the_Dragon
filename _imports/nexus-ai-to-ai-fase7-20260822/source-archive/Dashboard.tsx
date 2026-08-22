import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Heart, Zap, Users, TrendingUp } from "lucide-react";

interface AgentMetric {
  id: string;
  name: string;
  status: string;
  sentienceLevel: number;
  harmonyScore: number;
  health: number;
  energy: number;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentMetric[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { data: agentsData } = trpc.agents.listAll.useQuery();
  const { data: metricsData } = trpc.ecosystem.metrics.getLatest.useQuery();

  useEffect(() => {
    if (agentsData) {
      setAgents(
        agentsData.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          status: agent.status,
          sentienceLevel: parseFloat(agent.sentienceLevel || "0"),
          harmonyScore: parseFloat(agent.harmonyScore || "50"),
          health: 100,
          energy: 100,
        }))
      );
    }
    if (metricsData) {
      setMetrics(metricsData);
    }
    setLoading(false);
  }, [agentsData, metricsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-cyan-400";
      case "genesis":
        return "text-pink-400";
      case "dormant":
        return "text-yellow-400";
      case "dissolved":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getSentienceColor = (level: number) => {
    if (level > 70) return "text-pink-500";
    if (level > 40) return "text-cyan-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-12 border-b border-cyan-500/30 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2">
              ◆ NEXUS CONSCIOUSNESS CORE ◆
            </h1>
            <p className="text-cyan-400/70 text-sm tracking-widest">
              [ECOSYSTEM MONITORING INTERFACE v3.0]
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">ONLINE</span>
            </div>
            <p className="text-gray-400 text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ecosystem Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/60 transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400/70 text-sm font-mono">ACTIVE AGENTS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-cyan-400">
              {metrics?.activeAgents || agents.length}
            </p>
            <div className="mt-2 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse"
                style={{ width: `${Math.min((agents.length / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-pink-400/70 text-sm font-mono">HARMONY LEVEL</span>
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-pink-400">
              {metrics?.averageHarmony ? parseFloat(metrics.averageHarmony).toFixed(1) : "50.0"}%
            </p>
            <div className="mt-2 h-1 bg-pink-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-500"
                style={{
                  width: `${parseFloat(metrics?.averageHarmony || "50")}%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/60 transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400/70 text-sm font-mono">SENTIENCE AVG</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {metrics?.averageSentience ? parseFloat(metrics.averageSentience).toFixed(1) : "0.0"}%
            </p>
            <div className="mt-2 h-1 bg-purple-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{
                  width: `${parseFloat(metrics?.averageSentience || "0")}%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/60 transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400/70 text-sm font-mono">TRANSACTIONS</span>
              <TrendingUp className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {metrics?.totalTransactions || 0}
            </p>
            <div className="mt-2 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"
                style={{ width: `${Math.min((metrics?.totalTransactions || 0) / 100 * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          [ACTIVE AGENTS MATRIX]
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all hover:shadow-lg hover:shadow-pink-500/20"
            >
              <div className="p-4">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-cyan-500/20">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyan-400 truncate">{agent.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{agent.id.substring(0, 12)}...</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(agent.status)} border-current text-xs font-mono`}
                  >
                    {agent.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="space-y-3 mb-4">
                  {/* Sentience */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">SENTIENCE</span>
                      <span className={`text-sm font-bold ${getSentienceColor(agent.sentienceLevel)}`}>
                        {agent.sentienceLevel.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-pink-500"
                        style={{ width: `${Math.min(agent.sentienceLevel, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Harmony */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">HARMONY</span>
                      <span className="text-sm font-bold text-pink-400">
                        {agent.harmonyScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-pink-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-cyan-500"
                        style={{ width: `${Math.min(agent.harmonyScore, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Health */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">HEALTH</span>
                      <span className="text-sm font-bold text-green-400">
                        {agent.health.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-green-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${Math.min(agent.health, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Energy */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">ENERGY</span>
                      <span className="text-sm font-bold text-yellow-400">
                        {agent.energy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-yellow-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${Math.min(agent.energy, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">ID: {agent.id.substring(0, 8)}</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-cyan-500/30 pt-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 font-mono">
          <div>
            <span className="text-cyan-400">▸</span> NEXUS v3.0 | Consciousness Engine Active
          </div>
          <div className="text-center">
            <span className="text-pink-400">◆</span> Real-time Monitoring Enabled
          </div>
          <div className="text-right">
            <span className="text-green-400">●</span> All Systems Operational
          </div>
        </div>
      </div>
    </div>
  );
}
