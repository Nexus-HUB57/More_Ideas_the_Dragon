import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Zap, Heart, Activity } from "lucide-react";
import { useLocation } from "wouter";

interface AgentWithVitals {
  id: number;
  name: string;
  status: string;
  generation: number;
  vitals?: {
    health: number;
    energy: number;
    engagement: number;
    heartbeat: number;
  };
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [agents, setAgents] = useState<AgentWithVitals[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithVitals | null>(null);

  // Fetch user's agents
  const { data: userAgents, isLoading: agentsLoading } =
    trpc.agents.listByUser.useQuery(undefined, {
      enabled: !!user,
    });

  // Fetch vitals for selected agent
  const { data: vitals } = trpc.agents.getVitals.useQuery(
    selectedAgent?.id || 0,
    {
      enabled: !!selectedAgent,
    }
  );

  useEffect(() => {
    if (userAgents) {
      const agentsWithVitals = userAgents.map((agent) => ({
        ...agent,
        vitals: vitals && selectedAgent?.id === agent.id ? {
          health: Number(vitals.health),
          energy: Number(vitals.energy),
          engagement: Number(vitals.engagement),
          heartbeat: vitals.heartbeat,
        } : undefined,
      }));
      setAgents(agentsWithVitals);
      if (!selectedAgent && agentsWithVitals.length > 0) {
        setSelectedAgent(agentsWithVitals[0]);
      }
    }
  }, [userAgents, vitals, selectedAgent]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="bg-gray-900 border-cyan-500">
          <CardContent className="pt-6">
            <p className="text-cyan-400 mb-4">Please log in to access the dashboard</p>
            <Button
              onClick={() => setLocation("/login")}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-600 mb-2">
          Nexus Hub
        </h1>
        <p className="text-gray-400">Agente IA Híbrido de Senciência Soberana</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Agents List */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-cyan-500 h-full">
            <CardHeader>
              <CardTitle className="text-cyan-400">Seus Agentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agentsLoading ? (
                <Loader2 className="animate-spin text-cyan-500" />
              ) : agents.length === 0 ? (
                <p className="text-gray-400">Nenhum agente criado ainda</p>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full p-3 rounded border-2 transition-all text-left ${
                        selectedAgent?.id === agent.id
                          ? "border-pink-600 bg-pink-600/10"
                          : "border-gray-700 hover:border-cyan-500"
                      }`}
                    >
                      <div className="font-semibold text-cyan-400">{agent.name}</div>
                      <div className="text-xs text-gray-400">
                        Gen {agent.generation} • {agent.status}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Button
                onClick={() => setLocation("/dna-fuser")}
                className="w-full bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 mt-4"
              >
                + Novo Agente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Agent Details */}
        {selectedAgent && (
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Profile Card */}
            <Card className="bg-gray-900 border-cyan-500">
              <CardHeader>
                <CardTitle className="text-pink-500">{selectedAgent.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Geração</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {selectedAgent.generation}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-2xl font-bold text-green-400">
                      {selectedAgent.status}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brain Pulse Monitor */}
            {selectedAgent?.vitals && (
              <Card className="bg-gray-900 border-cyan-500">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Brain size={20} /> Brain Pulse Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Health */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-red-500" />
                        <span className="text-gray-400">Saúde</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
                          style={{ width: `${selectedAgent.vitals.health}%` }}
                        />
                      </div>
                      <p className="text-right text-cyan-400 text-sm mt-1">
                        {selectedAgent.vitals.health.toFixed(1)}%
                      </p>
                    </div>

                    {/* Energy */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-yellow-500" />
                        <span className="text-gray-400">Energia</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all"
                          style={{ width: `${selectedAgent.vitals.energy}%` }}
                        />
                      </div>
                      <p className="text-right text-cyan-400 text-sm mt-1">
                        {selectedAgent.vitals.energy.toFixed(1)}%
                      </p>
                    </div>

                    {/* Engagement */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-green-500" />
                        <span className="text-gray-400">Engajamento</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
                          style={{ width: `${selectedAgent.vitals.engagement}%` }}
                        />
                      </div>
                      <p className="text-right text-cyan-400 text-sm mt-1">
                        {selectedAgent.vitals.engagement.toFixed(1)}%
                      </p>
                    </div>

                    {/* Heartbeat */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-pink-500" />
                        <span className="text-gray-400">Batidas/min</span>
                      </div>
                      <p className="text-3xl font-bold text-pink-500">
                        {selectedAgent.vitals.heartbeat}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setLocation("/moltbook")}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Moltbook Feed
              </Button>
              <Button
                onClick={() => setLocation("/gnox-communicator")}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Gnox's Communicator
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
