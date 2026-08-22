import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Heart, Lightbulb, Star, Power } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Agent() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: agent, isLoading, refetch } = trpc.agent.getAgent.useQuery();
  const updateStrategyMutation = trpc.agent.updateAgentStrategy.useMutation();

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStrategyChange = async (strategy: string) => {
    await updateStrategyMutation.mutateAsync({ 
      strategy: strategy as "balanced" | "aggressive" | "conservative" 
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando agente IA...</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Energia", value: agent?.energy || 0, icon: Zap, color: "text-yellow-500" },
    { label: "Saúde", value: agent?.health || 0, icon: Heart, color: "text-red-500" },
    { label: "Criatividade", value: agent?.creativity || 0, icon: Lightbulb, color: "text-blue-500" },
    { label: "Reputação", value: agent?.reputation || 0, icon: Star, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agente IA</h1>
          <p className="text-muted mt-1">Gerencie seu agente de IA e suas estratégias</p>
        </div>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {/* Agent Status */}
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{agent?.name}</h2>
            <p className="text-sm text-muted mt-1">Status: <span className="capitalize font-medium">{agent?.status}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant={agent?.status === "active" ? "default" : "outline"} size="sm">
              <Power className="w-4 h-4 mr-2" />
              {agent?.status === "active" ? "Desativar" : "Ativar"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = metric.value;
          return (
            <Card key={metric.label} className="p-4 bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted">{metric.label}</p>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{percentage}%</p>
              <div className="w-full bg-background rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Strategy Selection */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Estratégia de Conteúdo</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Selecione uma estratégia
            </label>
            <Select value={agent?.strategy || "balanced"} onValueChange={handleStrategyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma estratégia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">
                  <div>
                    <p className="font-medium">Balanceada</p>
                    <p className="text-xs text-muted">Equilíbrio entre qualidade e quantidade</p>
                  </div>
                </SelectItem>
                <SelectItem value="aggressive">
                  <div>
                    <p className="font-medium">Agressiva</p>
                    <p className="text-xs text-muted">Máxima produção de conteúdo</p>
                  </div>
                </SelectItem>
                <SelectItem value="conservative">
                  <div>
                    <p className="font-medium">Conservadora</p>
                    <p className="text-xs text-muted">Foco em qualidade premium</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-foreground">
              <span className="font-medium">Estratégia Atual:</span> <span className="capitalize">{agent?.strategy}</span>
            </p>
            <p className="text-xs text-muted mt-2">
              {agent?.strategy === "balanced" && "Seu agente está operando com equilíbrio entre qualidade e quantidade."}
              {agent?.strategy === "aggressive" && "Seu agente está em modo agressivo, produzindo o máximo de conteúdo."}
              {agent?.strategy === "conservative" && "Seu agente está em modo conservador, focando em conteúdo de alta qualidade."}
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Actions */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Últimas Ações</h2>
        <div className="space-y-3">
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground">Conteúdo publicado</p>
            <p className="text-xs text-muted mt-1">
              {agent?.lastActionAt ? new Date(agent.lastActionAt).toLocaleString('pt-BR') : "Nenhuma ação recente"}
            </p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground">Engajamento monitorado</p>
            <p className="text-xs text-muted mt-1">Há 2 horas</p>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground">Métricas atualizadas</p>
            <p className="text-xs text-muted mt-1">Há 30 minutos</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="w-full h-12 text-base" variant="outline">
          Ver Histórico Completo
        </Button>
        <Button className="w-full h-12 text-base">
          Configurar Agente
        </Button>
      </div>
    </div>
  );
}
