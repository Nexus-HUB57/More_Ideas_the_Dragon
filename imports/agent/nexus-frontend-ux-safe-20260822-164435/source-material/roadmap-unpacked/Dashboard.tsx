import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useWebSocket, useWebSocketMetrics, useWebSocketAlerts } from "@/contexts/WebSocketContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, TrendingUp, AlertCircle, Wifi, WifiOff } from "lucide-react";
import OrchestratorView from "@/components/OrchestratorView";
import VitalLoopMonitor from "@/components/VitalLoopMonitor";
import GnoxTerminal from "@/components/GnoxTerminal";
import MarketFeed from "@/components/MarketFeed";

export default function Dashboard() {
  const { isConnected } = useWebSocket();
  const wsMetrics = useWebSocketMetrics();
  const wsAlerts = useWebSocketAlerts();

  const metricsQuery = trpc.ecosystem.getMetrics.useQuery();
  const agentsQuery = trpc.ecosystem.getAgents.useQuery();
  const alertsQuery = trpc.ecosystem.getAlerts.useQuery();

  const metrics = wsMetrics || metricsQuery.data;
  const agents = agentsQuery.data || [];
  const alerts = wsAlerts || alertsQuery.data || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header com Status WebSocket */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Nexus Ecosystem</h1>
            <p className="text-muted-foreground">Autonomous Agent Orchestration & Monitoring</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Desconectado</span>
              </>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="nexus-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Harmonia Coletiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nexus-metric">
                <div className="nexus-metric-value animate-pulse-glow">
                  {metrics?.harmonyLevel || 0}
                </div>
                <div className="nexus-metric-label">/ 100</div>
              </div>
              <div className="nexus-harmony-indicator mt-4">
                <div
                  className="nexus-harmony-bar transition-all duration-500"
                  style={{ width: `${metrics?.harmonyLevel || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="nexus-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Agentes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nexus-metric">
                <div className="nexus-metric-value">{metrics?.activeAgents || 0}</div>
                <div className="nexus-metric-label">agentes</div>
              </div>
            </CardContent>
          </Card>

          <Card className="nexus-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Saúde Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nexus-metric">
                <div className="nexus-metric-value transition-all duration-500">
                  {metrics?.avgHealth || 0}%
                </div>
                <div className="nexus-metric-label">saúde</div>
              </div>
            </CardContent>
          </Card>

          <Card className="nexus-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="nexus-metric">
                <div className="nexus-metric-value">{alerts.length}</div>
                <div className="nexus-metric-label">não lidos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orchestrator" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orchestrator">Orquestrador</TabsTrigger>
            <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
            <TabsTrigger value="gnox">Gnox Kernel</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
          </TabsList>

          <TabsContent value="orchestrator" className="space-y-4">
            <OrchestratorView agents={agents} metrics={metrics} />
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <VitalLoopMonitor agents={agents} />
          </TabsContent>

          <TabsContent value="gnox" className="space-y-4">
            <GnoxTerminal />
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <MarketFeed />
          </TabsContent>
        </Tabs>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <Card className="nexus-card">
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>Eventos críticos do ecossistema (atualizado em tempo real)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="animate-slide-in flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div
                      className={`nexus-status-indicator nexus-status-${
                        alert.severity === "critical" ? "critical" : "active"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
