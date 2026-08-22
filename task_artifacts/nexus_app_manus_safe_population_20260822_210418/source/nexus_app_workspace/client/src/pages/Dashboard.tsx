import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Zap, Users, TrendingUp, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentSpec, setNewAgentSpec] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const agentsQuery = trpc.agents.list.useQuery();
  const activeQuery = trpc.agents.active.useQuery();
  const activitiesQuery = trpc.agents.activities.useQuery({ limit: 20 });
  const createAgentMutation = trpc.agents.create.useMutation();

  const handleCreateAgent = async () => {
    if (!newAgentName.trim() || !newAgentSpec.trim()) {
      toast.error("Nome e especialização são obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      await createAgentMutation.mutateAsync({
        name: newAgentName,
        specialization: newAgentSpec,
        description: `Agente especializado em ${newAgentSpec}`,
      });
      toast.success("Agente criado com sucesso!");
      setNewAgentName("");
      setNewAgentSpec("");
      agentsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao criar agente");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold neon-glow">Dashboard NEXUS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-neon-cyan">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agente
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-accent neon-glow">Criar Novo Agente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome do Agente</label>
                    <Input
                      placeholder="Ex: NEXUS-Alpha"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      className="input-neon mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Especialização</label>
                    <Input
                      placeholder="Ex: Machine Learning"
                      value={newAgentSpec}
                      onChange={(e) => setNewAgentSpec(e.target.value)}
                      className="input-neon mt-2"
                    />
                  </div>
                  <Button
                    className="btn-neon w-full"
                    onClick={handleCreateAgent}
                    disabled={isCreating}
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Criar Agente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="card-neon">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Agentes</p>
                <p className="text-3xl font-bold neon-glow">{agentsQuery.data?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-accent neon-glow opacity-50" />
            </div>
          </Card>

          <Card className="card-neon-cyan">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Agentes Ativos</p>
                <p className="text-3xl font-bold neon-glow-cyan">{activeQuery.data?.length || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-cyan-400 neon-glow-cyan opacity-50" />
            </div>
          </Card>

          <Card className="card-neon">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Atividades</p>
                <p className="text-3xl font-bold neon-glow">{activitiesQuery.data?.length || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-accent neon-glow opacity-50" />
            </div>
          </Card>
        </div>

        {/* Agents List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 neon-glow-cyan">Agentes do Ecossistema</h2>
          {agentsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent w-8 h-8" />
            </div>
          ) : agentsQuery.data && agentsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentsQuery.data.map((agent) => (
                <Card key={agent.id} className="card-neon p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-accent neon-glow">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{agent.agentId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      agent.status === "active" ? "bg-green-500/20 text-green-400" :
                      agent.status === "critical" ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{agent.specialization}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balanço:</span>
                      <span className="text-cyan-400 neon-glow-cyan font-bold">{agent.balance} Ⓣ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reputação:</span>
                      <span className="text-accent neon-glow font-bold">{agent.reputation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DNA:</span>
                      <span className="text-xs text-muted-foreground">{agent.dnaHash.slice(0, 8)}...</span>
                    </div>
                  </div>

                  <Button className="btn-neon w-full mt-4 text-xs" size="sm">
                    Ver Detalhes
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-neon p-12 text-center">
              <p className="text-muted-foreground">Nenhum agente criado ainda</p>
              <Button className="btn-neon-cyan mt-4">Criar Primeiro Agente</Button>
            </Card>
          )}
        </div>

        {/* Activities Feed */}
        <div>
          <h2 className="text-2xl font-bold mb-6 neon-glow">Atividades Recentes</h2>
          {activitiesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent w-8 h-8" />
            </div>
          ) : activitiesQuery.data && activitiesQuery.data.length > 0 ? (
            <div className="space-y-4">
              {activitiesQuery.data.map((activity, idx) => (
                <Card key={idx} className="card-neon-cyan p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-cyan-400 neon-glow-cyan">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Agente: <span className="text-accent">{activity.agentId}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-neon p-12 text-center">
              <p className="text-muted-foreground">Nenhuma atividade registrada</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
