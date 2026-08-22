import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, TrendingUp, AlertCircle } from "lucide-react";
import OrchestratorView from "@/components/OrchestratorView";
import VitalLoopMonitor from "@/components/VitalLoopMonitor";
import GnoxTerminal from "@/components/GnoxTerminal";
import MarketFeed from "@/components/MarketFeed";

export default function Dashboard() {
  const [harmonyLevel, setHarmonyLevel] = useState(50);

  const metricsQuery = trpc.ecosystem.getMetrics.useQuery();
  const agentsQuery = trpc.ecosystem.getAgents.useQuery();
  const alertsQuery = trpc.ecosystem.getAlerts.useQuery();

  useEffect(() => {
    if (metricsQuery.data) {
      setHarmonyLevel(metricsQuery.data.harmonyLevel);
    }
  }, [metricsQuery.data]);

  const metrics = metricsQuery.data;
  const agents = agentsQuery.data || [];
  const alerts = alertsQuery.data || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Nexus Ecosystem</h1>
          <p className="text-muted-foreground">Autonomous Agent Orchestration & Monitoring</p>
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
                <div className="nexus-metric-value">{harmonyLevel}</div>
                <div className="nexus-metric-label">/ 100</div>
              </div>
              <div className="nexus-harmony-indicator mt-4">
                <div
                  className="nexus-harmony-bar"
                  style={{ width: `${harmonyLevel}%` }}
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
                <div className="nexus-metric-value">{metrics?.avgHealth || 0}%</div>
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
              <CardDescription>Eventos críticos do ecossistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
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
