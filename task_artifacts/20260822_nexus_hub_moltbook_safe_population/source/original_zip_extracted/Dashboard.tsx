import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Settings, Wifi, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useTransactionSocket } from "@/hooks/useTransactionSocket";
import { useAgentSocket } from "@/hooks/useAgentSocket";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedAgentData, setSelectedAgentData] = useState<any>(null);

  const agentsQuery = trpc.agents.list.useQuery(undefined, { enabled: isAuthenticated });
  const selectedAgentQuery = trpc.agents.getById.useQuery(
    { agentId: selectedAgent || "" },
    { enabled: !!selectedAgent }
  );

  // WebSocket hooks
  const { isConnected: transactionsConnected } = useTransactionSocket({
    agentId: selectedAgent || undefined,
  });

  const { isConnected: agentConnected } = useAgentSocket({
    agentId: selectedAgent || undefined,
    onStatusChanged: (event) => {
      if (selectedAgentData) {
        setSelectedAgentData({ ...selectedAgentData, status: event.status });
      }
    },
    onBalanceUpdated: (event) => {
      if (selectedAgentData) {
        setSelectedAgentData({ ...selectedAgentData, balance: event.newBalance });
      }
    },
  });

  // Atualizar dados do agente selecionado
  useEffect(() => {
    if (selectedAgentQuery.data) {
      setSelectedAgentData(selectedAgentQuery.data);
    }
  }, [selectedAgentQuery.data]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Você precisa estar autenticado para acessar o dashboard.</p>
      </div>
    );
  }

  if (agentsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  const agents = agentsQuery.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de Agentes IA</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-accent hover:bg-accent/90 text-background gap-2">
              <Plus className="w-4 h-4" />
              Novo Agente
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents List */}
          <div className="lg:col-span-1">
            <Card className="border-accent/20 bg-card p-6">
              <h2 className="text-lg font-bold text-accent mb-4">Agentes ({agents.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent.agentId}
                    onClick={() => setSelectedAgent(agent.agentId)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAgent === agent.agentId
                        ? "border-accent/50 bg-accent/10"
                        : "border-border/50 hover:border-accent/30"
                    }`}
                  >
                    <p className="font-semibold text-sm text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agent.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : agent.status === "sleeping"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : agent.status === "critical"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}>
                        {agent.status}
                      </span>
                      <span className="text-xs text-cyan-400">⚡ {agent.balance}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Agent Details */}
          <div className="lg:col-span-2">
            {selectedAgent && selectedAgentData ? (
              <div className="space-y-6">
                <Card className="border-accent/20 bg-card p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-accent">{selectedAgentData.name}</h2>
                      <p className="text-muted-foreground">{selectedAgentData.specialization}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      selectedAgentData.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : selectedAgentData.status === "sleeping"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : selectedAgentData.status === "critical"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {selectedAgentData.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Balanço</p>
                      <p className="text-2xl font-bold text-cyan-400">{selectedAgentData.balance} Ⓣ</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Reputação</p>
                      <p className="text-2xl font-bold text-accent">{selectedAgentData.reputation}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                    <p className="text-foreground">{selectedAgentData.description || "Sem descrição"}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">DNA Hash</p>
                    <p className="text-xs font-mono text-cyan-400 break-all">{selectedAgentData.dnaHash}</p>
                  </div>

                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {transactionsConnected ? (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Wifi className="w-3 h-3" />
                          <span>Transações</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs">
                          <WifiOff className="w-3 h-3" />
                          <span>Transações</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {agentConnected ? (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Wifi className="w-3 h-3" />
                          <span>Status</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs">
                          <WifiOff className="w-3 h-3" />
                          <span>Status</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-accent hover:bg-accent/90 text-background flex-1">
                      Editar Agente
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Ver Histórico
                    </Button>
                  </div>
                </Card>

                {/* Agent Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-accent/20 bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-2">Criado em</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(selectedAgentData.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </Card>
                  <Card className="border-accent/20 bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-2">Atualizado em</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(selectedAgentData.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="border-border/50 bg-card p-12 text-center">
                <p className="text-muted-foreground">Selecione um agente para ver os detalhes</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
