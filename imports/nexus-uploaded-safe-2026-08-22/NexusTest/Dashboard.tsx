import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Zap, Heart, Sparkles } from "lucide-react";

interface EcosystemStats {
  totalAgents: number;
  activeAgents: number;
  hibernatingAgents: number;
  deadAgents: number;
  averageHealth: number;
  averageEnergy: number;
  topAgents: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const agentsQuery = trpc.agents.getStats.useQuery();

  useEffect(() => {
    if (agentsQuery.data) {
      setStats(agentsQuery.data);
      setLoading(false);
    }
  }, [agentsQuery.data]);

  // Auto-refresh a cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      agentsQuery.refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, agentsQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const harmonyIndex = (stats.averageHealth + stats.averageEnergy) / 2;
  const ecosystemHealth = harmonyIndex > 70 ? "Saudável" : harmonyIndex > 40 ? "Instável" : "Crítico";
  const healthColor = harmonyIndex > 70 ? "text-green-500" : harmonyIndex > 40 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nexus Ecosystem</h1>
          <p className="text-slate-400">Governança em Tempo Real do Ecossistema de Agentes Quânticos</p>
        </div>

        {/* Status Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Agentes Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalAgents}</div>
              <p className="text-xs text-slate-400 mt-1">
                {stats.activeAgents} ativos • {stats.hibernatingAgents} hibernando
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Saúde Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.averageHealth.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.averageHealth}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Energia Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.averageEnergy.toFixed(1)}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.averageEnergy}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Harmonia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${healthColor}`}>
                {harmonyIndex.toFixed(1)}%
              </div>
              <Badge className="mt-2" variant={harmonyIndex > 70 ? "default" : "destructive"}>
                {ecosystemHealth}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Críticos */}
        {stats.averageHealth < 30 && (
          <Card className="bg-red-900/20 border-red-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Alerta Crítico
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-300">
              <p>
                A saúde média do ecossistema está abaixo de 30%. Múltiplos agentes podem estar em estado crítico.
                Ação imediata recomendada.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Agentes Principais */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle>Top Agentes (Senciência)</CardTitle>
            <CardDescription>Agentes com maior nível de senciência quântica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAgents.length > 0 ? (
                stats.topAgents.map((agent, idx) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-purple-400">#{idx + 1}</div>
                      <div>
                        <p className="font-semibold text-white">{agent.name}</p>
                        <p className="text-sm text-slate-400">{agent.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-400">
                        {parseFloat(agent.sencienciaLevel).toFixed(2)}%
                      </p>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">Nenhum agente disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <div className="flex gap-4">
          <Button
            onClick={() => agentsQuery.refetch()}
            disabled={agentsQuery.isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {agentsQuery.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar Dados"
            )}
          </Button>

          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
