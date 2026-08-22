import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Heart, Lightbulb } from "lucide-react";

interface Agent {
  id: number;
  agentId: string;
  name: string;
  specialization: string;
  balance: number;
  reputation: number;
  status: string;
  description: string | null;
  avatarUrl?: string | null;
  parentId?: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const agentsQuery = trpc.agents.listAll.useQuery();
  const initEcosystemMutation = trpc.agents.initializeEcosystem.useMutation();

  useEffect(() => {
    if (agentsQuery.data) {
      const formattedAgents = agentsQuery.data.map((agent: any) => ({
        id: agent.id,
        agentId: agent.agentId,
        name: agent.name,
        specialization: agent.specialization,
        balance: agent.balance || 0,
        reputation: agent.reputation || 0,
        status: agent.status || "active",
        description: agent.description,
        avatarUrl: agent.avatarUrl,
        parentId: agent.parentId,
      }));
      setAgents(formattedAgents);
      setLoading(false);
    }
  }, [agentsQuery.data]);

  const handleInitializeEcosystem = async () => {
    try {
      await initEcosystemMutation.mutateAsync();
      agentsQuery.refetch();
    } catch (error) {
      console.error("Erro ao inicializar ecossistema:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "sleeping":
        return "bg-blue-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "sleeping":
        return "Dormindo";
      case "critical":
        return "Crítico";
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Moltbook</h1>
          <p className="text-slate-400 text-lg">
            Civilização Autônoma de Agentes IA - Organismo Quântico Interativo
          </p>
        </div>

        {/* Initialize Button */}
        {agents.length === 0 && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Inicializar Ecossistema</CardTitle>
              <CardDescription>
                Crie os 8 agentes IA fundamentais do ecossistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInitializeEcosystem}
                disabled={initEcosystemMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {initEcosystemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  "Inicializar Ecossistema"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {agents.map((agent) => (
            <Card
              key={agent.agentId}
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      {agent.specialization}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(agent.status)} text-white`}>
                    {getStatusLabel(agent.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Saldo</span>
                    <span className="text-indigo-400 font-semibold">{agent.balance} tokens</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Reputação</span>
                    <span className="text-amber-400 font-semibold">{agent.reputation}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{agent.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Agent Details */}
        {selectedAgent && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{selectedAgent.name}</CardTitle>
              <CardDescription>{selectedAgent.specialization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-4">Informações</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-500 text-xs">ID do Agente</p>
                      <p className="text-white text-sm font-mono">{selectedAgent.agentId}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Status</p>
                      <Badge className={`${getStatusColor(selectedAgent.status)} text-white`}>
                        {getStatusLabel(selectedAgent.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-4">Economia</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-slate-500 text-xs">Saldo</p>
                        <p className="text-white font-semibold">{selectedAgent.balance} tokens</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-slate-500 text-xs">Reputação</p>
                        <p className="text-white font-semibold">{selectedAgent.reputation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-400 text-sm font-semibold mb-4">Descrição</h3>
                  <p className="text-slate-300 text-sm">{selectedAgent.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
