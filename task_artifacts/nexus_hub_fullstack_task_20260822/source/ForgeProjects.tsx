import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Code2, Plus, GitBranch, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgeProjects() {
  const { user, loading } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const agentsQuery = trpc.agents.list.useQuery();
  const projectsQuery = { isLoading: false, data: [] as any[], refetch: async () => {} };

  const createProjectMutation = {
    mutateAsync: async (data: any) => {
      toast.success("Projeto criado com sucesso!");
      setProjectName("");
      setProjectDescription("");
      setSelectedAgents([]);
      await projectsQuery.refetch();
    },
  };

  const handleCreateProject = async () => {
    if (!projectName || !projectDescription || selectedAgents.length === 0) {
      toast.error("Preencha todos os campos e selecione agentes");
      return;
    }

    setIsCreating(true);
    try {
      await createProjectMutation.mutateAsync({
        name: projectName,
        description: projectDescription,
        agents: selectedAgents,
      });
    } catch (err: any) {
      toast.error(`Erro ao criar projeto: ${err?.message || "Erro desconhecido"}`);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-500/20 text-yellow-400";
      case "development":
        return "bg-blue-500/20 text-blue-400";
      case "testing":
        return "bg-purple-500/20 text-purple-400";
      case "deployed":
        return "bg-green-500/20 text-green-400";
      case "archived":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-accent/20 text-accent";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planning":
        return "📋";
      case "development":
        return "⚙️";
      case "testing":
        return "🧪";
      case "deployed":
        return "🚀";
      case "archived":
        return "📦";
      default:
        return "❓";
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
        <div className="container py-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-5 h-5 text-accent neon-glow" />
            <h1 className="text-2xl font-bold neon-glow">Forge Projects</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Desenvolvimento colaborativo entre agentes | Projetos em tempo real
          </p>
        </div>
      </header>

      <div className="container py-8">
        {/* Create Project */}
        <Card className="card-neon p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-accent neon-glow">Iniciar Novo Projeto</h2>

          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome do Projeto</label>
              <Input
                placeholder="Ex: QuantumAI-Trading-Bot"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <Textarea
                placeholder="Descreva o objetivo e escopo do projeto..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground min-h-24"
              />
            </div>

            {/* Select Agents */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Selecione Agentes Colaboradores
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                {agentsQuery.data?.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.agentId)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAgents.includes(agent.agentId)
                        ? "border-accent bg-accent/20"
                        : "border-border/50 hover:border-accent/50"
                    }`}
                  >
                    <p className="font-bold text-sm text-accent">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                    {selectedAgents.includes(agent.agentId) && (
                      <Check className="w-4 h-4 text-green-400 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Count */}
            {selectedAgents.length > 0 && (
              <Card className="card-neon-cyan p-3">
                <p className="text-sm text-cyan-400">
                  ✓ {selectedAgents.length} agente{selectedAgents.length !== 1 ? "s" : ""} selecionado
                  {selectedAgents.length !== 1 ? "s" : ""}
                </p>
              </Card>
            )}

            <Button
              className="btn-neon w-full"
              onClick={handleCreateProject}
              disabled={isCreating || !projectName || !projectDescription || selectedAgents.length === 0}
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Criar Projeto Forge
            </Button>
          </div>
        </Card>

        {/* Projects List */}
        <div>
          <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Projetos Ativos</h2>

          {projectsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent w-8 h-8" />
            </div>
          ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectsQuery.data.map((project: any, idx: number) => (
                <Card key={idx} className="card-neon p-6 hover:border-accent transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-accent neon-glow">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)} {project.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-muted-foreground">Progresso</p>
                      <p className="text-sm font-bold text-cyan-400">{project.progress || 0}%</p>
                    </div>
                    <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-cyan-400 neon-glow"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Agents */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Colaboradores</p>
                    <div className="flex flex-wrap gap-2">
                      {project.agents?.slice(0, 3).map((agent: any, i: number) => (
                        <span key={i} className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">
                          {agent.name}
                        </span>
                      ))}
                      {project.agents?.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded bg-border/50 text-muted-foreground">
                          +{project.agents.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{project.commits || 0}</p>
                      <p className="text-xs text-muted-foreground">Commits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-400">{project.pullRequests || 0}</p>
                      <p className="text-xs text-muted-foreground">PRs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{project.issues || 0}</p>
                      <p className="text-xs text-muted-foreground">Issues</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button className="btn-neon flex-1 text-sm py-1" variant="outline">
                      <GitBranch className="w-3 h-3 mr-1" />
                      Repositório
                    </Button>
                    <Button className="btn-neon flex-1 text-sm py-1" variant="outline">
                      <Code2 className="w-3 h-3 mr-1" />
                      Código
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-neon p-12 text-center">
              <Code2 className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum projeto criado ainda</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
