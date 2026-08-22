import { useWebSocketEvents, useWebSocketConnection } from "@/contexts/WebSocketContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrchestratorView() {
  const events = useWebSocketEvents();
  const { isConnected } = useWebSocketConnection();

  const getMissionStatus = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          color: "bg-green-500/10 text-green-600 dark:text-green-400",
          label: "Concluída",
        };
      case "in_progress":
        return {
          icon: Zap,
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          label: "Em Progresso",
        };
      case "pending":
        return {
          icon: Clock,
          color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
          label: "Pendente",
        };
      case "failed":
        return {
          icon: AlertCircle,
          color: "bg-red-500/10 text-red-600 dark:text-red-400",
          label: "Falha",
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
          label: "Desconhecido",
        };
    }
  };

  const MissionCard = ({
    title,
    description,
    status,
    priority,
    assignedAgent,
    progress,
    completedAt,
  }: {
    title: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
    assignedAgent: string;
    progress?: number;
    completedAt?: string;
  }) => {
    const statusInfo = getMissionStatus(status);
    const StatusIcon = statusInfo.icon;

    const priorityColors = {
      low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      high: "bg-red-500/10 text-red-600 dark:text-red-400",
    };

    return (
      <Card className="nexus-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <Badge variant="outline" className={priorityColors[priority]}>
                  {priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}
                </Badge>
              </div>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
            <div className={cn("p-2 rounded-lg", statusInfo.color)}>
              <StatusIcon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Agent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold">{statusInfo.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Agente Designado</p>
              <p className="text-sm font-semibold">{assignedAgent}</p>
            </div>
          </div>

          {/* Progress */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Progresso</p>
                <p className="text-xs font-semibold">{progress}%</p>
              </div>
              <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed At */}
          {completedAt && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Concluída em {new Date(completedAt).toLocaleString("pt-BR")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Orquestrador de Missões</h1>
          <p className="text-slate-400">
            Gerenciamento centralizado de missões e delegação de tarefas
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="nexus-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Missões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
            </CardContent>
          </Card>
          <Card className="nexus-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-500">18</p>
            </CardContent>
          </Card>
          <Card className="nexus-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-500">4</p>
            </CardContent>
          </Card>
          <Card className="nexus-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-500">92%</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Missions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Missões Ativas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MissionCard
              title="Análise de Mercado"
              description="Coletar e analisar dados de mercado para o próximo ciclo"
              status="in_progress"
              priority="high"
              assignedAgent="Agent Alpha"
              progress={65}
            />
            <MissionCard
              title="Otimização de Recursos"
              description="Otimizar alocação de recursos entre agentes"
              status="in_progress"
              priority="medium"
              assignedAgent="Agent Beta"
              progress={45}
            />
            <MissionCard
              title="Monitoramento de Harmonia"
              description="Monitorar e manter níveis de harmonia do ecossistema"
              status="in_progress"
              priority="high"
              assignedAgent="Agent Gamma"
              progress={80}
            />
            <MissionCard
              title="Processamento de Transações"
              description="Processar transações pendentes no sistema"
              status="pending"
              priority="medium"
              assignedAgent="Agent Delta"
              progress={0}
            />
          </div>
        </div>

        {/* Recent Events */}
        <Card className="nexus-card border-border/50">
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Histórico de atividades do orquestrador</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {events && events.length > 0 ? (
                events.slice(0, 10).map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-border/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.eventType || "Evento"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.content || event.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.createdAt
                          ? new Date(event.createdAt).toLocaleString("pt-BR")
                          : "Agora"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento registrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="nexus-card border-border/50">
          <CardHeader>
            <CardTitle>Status de Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-3 w-3 rounded-full animate-pulse",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-sm font-medium">
                {isConnected ? "Conectado ao servidor" : "Desconectado"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
