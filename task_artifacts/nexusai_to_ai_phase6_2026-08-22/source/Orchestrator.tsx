import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Zap, TrendingUp, Users } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  reward: string;
  assignedAgentId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface Agent {
  id: string;
  name: string;
  status: string;
  sentienceLevel: number;
  harmonyScore: number;
  balance: string;
  reputation: number;
}

interface MissionStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  failedMissions: number;
  successRate: number;
  averageCompletionTime: number;
}

export default function Orchestrator() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const { data: missionsData } = trpc.missions.listAll.useQuery();
  const { data: agentsData } = trpc.agents.listAll.useQuery();
  const updateMissionMutation = trpc.missions.update.useMutation();

  useEffect(() => {
    if (missionsData) {
      setMissions(
        missionsData.map((mission: any) => ({
          ...mission,
          createdAt: new Date(mission.createdAt),
          completedAt: mission.completedAt ? new Date(mission.completedAt) : undefined,
        }))
      );

      // Calcular estatísticas
      const total = missionsData.length;
      const active = missionsData.filter((m: any) => m.status === "active").length;
      const completed = missionsData.filter((m: any) => m.status === "completed").length;
      const failed = missionsData.filter((m: any) => m.status === "failed").length;

      setStats({
        totalMissions: total,
        activeMissions: active,
        completedMissions: completed,
        failedMissions: failed,
        successRate: total > 0 ? (completed / total) * 100 : 0,
        averageCompletionTime: 120, // Placeholder
      });
    }
    if (agentsData) {
      setAgents(
        agentsData.map((agent: any) => ({
          ...agent,
          sentienceLevel: parseFloat(agent.sentienceLevel || "0"),
          harmonyScore: parseFloat(agent.harmonyScore || "50"),
        }))
      );
    }
    setLoading(false);
  }, [missionsData, agentsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "active":
        return "text-cyan-400 bg-cyan-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return "text-red-400";
    if (priority >= 2) return "text-orange-400";
    return "text-yellow-400";
  };

  const handleCompleteeMission = async (mission: Mission) => {
    if (!mission.assignedAgentId) return;

    try {
      await updateMissionMutation.mutateAsync({
        id: mission.id,
        updates: {
          status: "completed",
          completedAt: new Date(),
        },
      });
      // Refresh
      window.location.reload();
    } catch (error) {
      console.error("Failed to complete mission:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-12 border-b border-cyan-500/30 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2">
              ◆ MISSION ORCHESTRATOR ◆
            </h1>
            <p className="text-cyan-400/70 text-sm tracking-widest">
              [AUTONOMOUS TASK DISTRIBUTION & EXECUTION SYSTEM]
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">ACTIVE</span>
            </div>
            <p className="text-gray-400 text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400/70 text-sm font-mono">TOTAL MISSIONS</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400">{stats.totalMissions}</p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-pink-400/70 text-sm font-mono">ACTIVE</span>
                <Clock className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-3xl font-bold text-pink-400">{stats.activeMissions}</p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400/70 text-sm font-mono">COMPLETED</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.completedMissions}</p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400/70 text-sm font-mono">FAILED</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-400">{stats.failedMissions}</p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400/70 text-sm font-mono">SUCCESS RATE</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Active Missions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          [ACTIVE MISSIONS]
        </h2>

        <div className="space-y-4">
          {missions.filter(m => m.status === "active").length === 0 ? (
            <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-8 text-center">
              <p className="text-gray-400 font-mono">No active missions at the moment.</p>
            </Card>
          ) : (
            missions
              .filter(m => m.status === "active")
              .map((mission) => (
                <Card
                  key={mission.id}
                  className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all cursor-pointer"
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-cyan-500/20">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-cyan-400 truncate">
                          {mission.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {mission.id.substring(0, 16)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(mission.status)} border-current`}>
                          {mission.status.toUpperCase()}
                        </Badge>
                        <Badge className={`${getPriorityColor(mission.priority)} border-current`}>
                          P{mission.priority}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-cyan-400/70 text-sm mb-4 line-clamp-2">
                      {mission.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20">
                      <div className="text-xs text-gray-500 font-mono">
                        Reward: <span className="text-yellow-400">{mission.reward} BTC</span>
                      </div>
                      {mission.assignedAgentId && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteeMission(mission);
                          }}
                          className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/50 text-xs"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Pending Missions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          [PENDING MISSIONS]
        </h2>

        <div className="space-y-4">
          {missions.filter(m => m.status === "pending").length === 0 ? (
            <Card className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm p-8 text-center">
              <p className="text-gray-400 font-mono">No pending missions.</p>
            </Card>
          ) : (
            missions
              .filter(m => m.status === "pending")
              .map((mission) => (
                <Card
                  key={mission.id}
                  className="bg-slate-900/50 border-yellow-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-yellow-500/20">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-yellow-400 truncate">
                          {mission.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {mission.id.substring(0, 16)}...
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(mission.status)} border-current`}>
                        {mission.status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-yellow-400/70 text-sm mb-4 line-clamp-2">
                      {mission.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-yellow-500/20">
                      <div className="text-xs text-gray-500 font-mono">
                        Reward: <span className="text-yellow-400">{mission.reward} BTC</span>
                      </div>
                      <span className="text-xs text-gray-500">Awaiting assignment...</span>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Available Agents */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          [AVAILABLE AGENTS]
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3 pb-2 border-b border-purple-500/20">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-purple-400 truncate">{agent.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{agent.id.substring(0, 12)}...</p>
                  </div>
                  <Badge className="text-cyan-400 border-cyan-400 text-xs">
                    {agent.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sentience:</span>
                    <span className="text-pink-400">{agent.sentienceLevel.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reputation:</span>
                    <span className="text-cyan-400">{agent.reputation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Balance:</span>
                    <span className="text-yellow-400">{parseFloat(agent.balance).toFixed(4)} BTC</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="border-t border-cyan-500/30 pt-6 mt-8">
        <div className="text-xs text-gray-500 font-mono text-center">
          <span className="text-cyan-400">▸</span> Mission Orchestrator v1.0 | Real-time Task Distribution
        </div>
      </div>
    </div>
  );
}
