import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitBranch, Plus } from "lucide-react";

interface Agent {
  id: number;
  agentId: string;
  name: string;
  specialization: string;
  parentId?: string | null;
}

interface Genealogy {
  id: number;
  agentId: string;
  parentId?: string | null;
  inheritedMemory: number;
  generation: number;
}

export default function Genealogy() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [newAgentName, setNewAgentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  const agentsQuery = trpc.agents.listAll.useQuery();
  const genealogyQuery = trpc.genealogy.getGenealogy.useQuery(
    { agentId: selectedAgent?.agentId || "" },
    { enabled: !!selectedAgent }
  );
  const descendantsQuery = trpc.genealogy.getDescendants.useQuery(
    { parentId: selectedAgent?.agentId || "" },
    { enabled: !!selectedAgent }
  );
  const createDescendantMutation = trpc.genealogy.createDescendant.useMutation();

  useEffect(() => {
    if (agentsQuery.data) {
      const formattedAgents = agentsQuery.data.map((agent: any) => ({
        id: agent.id,
        agentId: agent.agentId,
        name: agent.name,
        specialization: agent.specialization,
        parentId: agent.parentId,
      }));
      setAgents(formattedAgents);
      setSelectedAgent(formattedAgents[0]);
      setLoading(false);
    }
  }, [agentsQuery.data]);

  const handleCreateDescendant = async () => {
    if (!selectedAgent || !newAgentName.trim() || !selectedParent) return;

    try {
      const newAgentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createDescendantMutation.mutateAsync({
        parentId: selectedParent,
        newAgentId,
        newAgentName,
        dnaFusionData: JSON.stringify({
          parentId: selectedParent,
          timestamp: new Date().toISOString(),
        }),
      });

      setNewAgentName("");
      setShowCreator(false);
      genealogyQuery.refetch();
      descendantsQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar descendente:", error);
    }
  };

  const getParentAgent = () => {
    return agents.find((a) => a.agentId === selectedAgent?.parentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <GitBranch className="w-8 h-8" />
            Genealogia de Agentes
          </h1>
          <p className="text-slate-400">Explore linhagens, DNA Fusion e herança de memória</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white text-sm">Agentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.agentId}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedAgent?.agentId === agent.agentId
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <p className="font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-slate-400">{agent.specialization}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedAgent && (
              <>
                {/* Current Agent */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{selectedAgent.name}</CardTitle>
                    <CardDescription>{selectedAgent.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-sm">ID do Agente</p>
                        <p className="text-white font-mono text-sm">{selectedAgent.agentId}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">Geração</p>
                        <p className="text-white font-semibold">
                          {genealogyQuery.data?.generation || 1}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                {getParentAgent() && (
                  <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Agente Pai</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-white font-semibold">{getParentAgent()?.name}</p>
                        <p className="text-slate-400 text-sm">{getParentAgent()?.specialization}</p>
                        <div className="pt-2">
                          <p className="text-slate-500 text-sm">Memória Herdada</p>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(genealogyQuery.data?.inheritedMemory || 0, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {genealogyQuery.data?.inheritedMemory || 0}% herdado
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Descendants */}
                {descendantsQuery.data && descendantsQuery.data.length > 0 && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Descendentes</CardTitle>
                      <CardDescription>
                        {descendantsQuery.data.length} agente(s) criado(s) via DNA Fusion
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {descendantsQuery.data.map((descendant: Genealogy) => (
                          <div
                            key={descendant.id}
                            className="p-3 bg-slate-700 rounded-md border border-slate-600"
                          >
                            <p className="text-white font-semibold text-sm">{descendant.agentId}</p>
                            <p className="text-slate-400 text-xs">
                              Geração {descendant.generation + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* DNA Fusion Creator */}
                <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      DNA Fuser - Criar Descendente
                    </CardTitle>
                    <CardDescription>
                      Fusione DNA para criar um novo agente com herança genética
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!showCreator ? (
                      <Button
                        onClick={() => setShowCreator(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Iniciar DNA Fusion
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-slate-400 text-sm">Agente Pai</label>
                          <select
                            value={selectedParent}
                            onChange={(e) => setSelectedParent(e.target.value)}
                            className="w-full mt-2 px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:border-green-500"
                          >
                            <option value="">Selecione um agente pai</option>
                            {agents.map((agent) => (
                              <option key={agent.agentId} value={agent.agentId}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 text-sm">Nome do Novo Agente</label>
                          <Input
                            value={newAgentName}
                            onChange={(e) => setNewAgentName(e.target.value)}
                            placeholder="Ex: Nexus Scholar"
                            className="mt-2 bg-slate-700 text-white border-slate-600 focus:border-green-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateDescendant}
                            disabled={
                              createDescendantMutation.isPending ||
                              !newAgentName.trim() ||
                              !selectedParent
                            }
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {createDescendantMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              "Criar Descendente"
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowCreator(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
