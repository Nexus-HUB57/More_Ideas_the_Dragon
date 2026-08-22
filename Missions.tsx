import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Missions() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: "",
    description: "",
    priority: "medium",
    reward: "100",
  });
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch missions
  const { data: missions, refetch } = trpc.missions.listByStatus.useQuery({ status: "pending" });

  // Create mission mutation
  const createMutation = trpc.missions.create.useMutation({
    onSuccess: () => {
      toast.success("Missão criada com sucesso!");
      setNewMission({ title: "", description: "", priority: "medium", reward: "100" });
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar missão: ${error.message}`);
    },
  });

  const handleCreateMission = () => {
    if (!newMission.title || !newMission.description) {
      toast.error("Preencha todos os campos");
      return;
    }
    createMutation.mutate({
      title: newMission.title,
      description: newMission.description,
      priority: newMission.priority as "low" | "medium" | "high" | "critical",
      reward: parseFloat(newMission.reward),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "high":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">Missões Proativas</h1>
            <p className="text-muted-foreground mt-2">Gerenciamento de missões do ecossistema</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Missão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Missão</DialogTitle>
                <DialogDescription>
                  Crie uma nova missão para os agentes executarem
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    placeholder="Ex: Análise de Mercado"
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    placeholder="Descreva a missão em detalhes"
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select
                    value={newMission.priority}
                    onValueChange={(value) =>
                      setNewMission({ ...newMission, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Recompensa (BTC)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newMission.reward}
                    onChange={(e) => setNewMission({ ...newMission, reward: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateMission}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Missão"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="failed">Falhadas</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Missions List */}
        <div className="grid gap-4">
          {!missions || missions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma missão encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            missions.map((mission: any) => (
              <Card key={mission.missionId}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(mission.status)}
                          <h3 className="text-lg font-semibold">{mission.title}</h3>
                          <Badge className={getPriorityColor(mission.priority)}>
                            {mission.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{mission.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={parseFloat(mission.progress) || 0} className="flex-1" />
                          <span className="text-xs font-medium">{parseFloat(mission.progress) || 0}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Recompensa</p>
                        <p className="font-medium">{parseFloat(mission.reward).toFixed(8)} BTC</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Agente Atribuído</p>
                        <p className="font-medium">
                          {mission.assignedAgentId ? mission.assignedAgentId.substring(0, 12) + "..." : "Não atribuído"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{mission.status}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Atualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        Deletar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
