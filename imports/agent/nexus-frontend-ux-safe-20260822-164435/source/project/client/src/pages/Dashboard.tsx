import { useWebSocketMetrics, useWebSocketAlerts, useWebSocketConnection } from "@/contexts/WebSocketContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Activity, TrendingUp, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const metrics = useWebSocketMetrics();
  const alerts = useWebSocketAlerts();
  const { isConnected } = useWebSocketConnection();

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    unit,
    trend,
    color = "blue",
  }: {
    title: string;
    value: number | string | null;
    icon: any;
    unit?: string;
    trend?: number;
    color?: "blue" | "green" | "purple" | "orange";
  }) => {
    const colorClasses = {
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      green: "bg-green-500/10 text-green-600 dark:text-green-400",
      purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    };

    return (
      <Card className="nexus-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", colorClasses[color])}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {value !== null ? value : <Skeleton className="h-8 w-16" />}
              </span>
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            {trend !== undefined && (
              <div className={cn("text-xs font-medium", trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs última hora
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Nexus Ecosystem</h1>
          <p className="text-slate-400">
            Monitoramento em tempo real do ecossistema de agentes autônomos
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Agentes Ativos"
            value={metrics?.activeAgents ?? "—"}
            icon={Activity}
            color="blue"
            trend={metrics?.activeAgentsTrend}
          />
          <MetricCard
            title="Nível de Harmonia"
            value={metrics?.harmonyLevel ?? "—"}
            icon={Zap}
            unit="%"
            color="purple"
            trend={metrics?.harmonyTrend}
          />
          <MetricCard
            title="Saúde Média"
            value={metrics?.avgHealth ? Math.round(metrics.avgHealth) : "—"}
            icon={TrendingUp}
            unit="%"
            color="green"
            trend={metrics?.healthTrend}
          />
          <MetricCard
            title="Energia Média"
            value={metrics?.avgEnergy ? Math.round(metrics.avgEnergy) : "—"}
            icon={Zap}
            unit="%"
            color="orange"
            trend={metrics?.energyTrend}
          />
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <Card className="nexus-card border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Alertas Recentes ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.slice(0, 5).map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm"
                  >
                    <p className="text-red-700 dark:text-red-400 font-medium">
                      {alert.title || "Alerta"}
                    </p>
                    <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                      {alert.message || alert.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Section */}
        <Card className="nexus-card border-border/50">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais do ecossistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sentimento de Mercado</p>
                <p className="text-lg font-semibold capitalize">
                  {metrics?.marketSentiment || "—"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Missões Completadas</p>
                <p className="text-lg font-semibold">
                  {metrics?.missionsCompleted || "—"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status de Conexão</p>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isConnected ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <p className="text-lg font-semibold">
                    {isConnected ? "Conectado" : "Desconectado"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-lg font-semibold">
                  {metrics?.lastUpdate
                    ? new Date(metrics.lastUpdate).toLocaleTimeString("pt-BR")
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
