import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Play, Pause, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Agents() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    specialization: "",
    balance: "1000",
  });
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch all agents
  const { data: agents, refetch } = trpc.agents.listAll.useQuery();

  // Create agent mutation
  const createMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agente criado com sucesso!");
      setNewAgent({ name: "", specialization: "", balance: "1000" });
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar agente: ${error.message}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = trpc.agents.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.specialization) {
      toast.error("Preencha todos os campos");
      return;
    }
    createMutation.mutate({
      name: newAgent.name,
      specialization: newAgent.specialization,
      balance: parseFloat(newAgent.balance),
    });
  };

  const handleToggleAgent = (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "hibernating" : "active";
    updateStatusMutation.mutate({ agentId, status: newStatus });
  };

  const filteredAgents = agents?.filter((agent: any) => {
    if (filterStatus === "all") return true;
    return agent.status === filterStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "hibernating":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "critical":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "genesis":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">Agentes Autônomos</h1>
            <p className="text-muted-foreground mt-2">Gerenciamento de agentes do ecossistema</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Agente</DialogTitle>
                <DialogDescription>
                  Crie um novo agente autônomo para o ecossistema Nexus
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    placeholder="Ex: Agente Nexus-001"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Especialização</label>
                  <Select
                    value={newAgent.specialization}
                    onValueChange={(value) =>
                      setNewAgent({ ...newAgent, specialization: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Desenvolvedor</SelectItem>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="architect">Arquiteto</SelectItem>
                      <SelectItem value="guardian">Guardião</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Saldo Inicial</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={newAgent.balance}
                    onChange={(e) => setNewAgent({ ...newAgent, balance: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreateAgent}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Agente"}
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="hibernating">Hibernando</SelectItem>
                <SelectItem value="critical">Críticos</SelectItem>
                <SelectItem value="genesis">Gênese</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Agents List */}
        <div className="grid gap-4">
          {filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum agente encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAgents.map((agent: any) => (
              <Card key={agent.agentId}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Especialização</p>
                          <p className="font-medium">{agent.specialization}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Senciência</p>
                          <p className="font-medium">{parseFloat(agent.sencienciaLevel).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Saúde</p>
                          <p className="font-medium">{agent.health}/100</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Saldo</p>
                          <p className="font-medium">{parseFloat(agent.balance).toFixed(8)} BTC</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAgent(agent.agentId, agent.status)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {agent.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
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
