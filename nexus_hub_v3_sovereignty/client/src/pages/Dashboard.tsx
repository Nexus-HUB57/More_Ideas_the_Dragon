import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Zap, Wallet, Activity } from "lucide-react";

interface StartupMetrics {
  id: number;
  name: string;
  revenue: number;
  traction: number;
  reputation: number;
  status: string;
  isCore: boolean;
}

export default function Dashboard() {
  const [startups, setStartups] = useState<StartupMetrics[]>([]);
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const startupsQuery = trpc.hub.startups.list.useQuery();
  const vaultQuery = trpc.hub.finance.getMasterVault.useQuery();
  const orchestratorQuery = trpc.hub.orchestrator.overview.useQuery();

  useEffect(() => {
    if (startupsQuery.data) {
      setStartups(startupsQuery.data);
    }
  }, [startupsQuery.data]);

  useEffect(() => {
    if (vaultQuery.data) {
      setVault(vaultQuery.data);
    }
  }, [vaultQuery.data]);

  useEffect(() => {
    if (startupsQuery.isLoading || vaultQuery.isLoading || orchestratorQuery.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [startupsQuery.isLoading, vaultQuery.isLoading, orchestratorQuery.isLoading]);

  if (loading) {
    return (
      <HubLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-cyan-400" size={40} />
        </div>
      </HubLayout>
    );
  }

  const coreStartup = startups.find((s) => s.isCore);
  const challengerStartups = startups.filter((s) => !s.isCore);
  const totalRevenue = startups.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const avgReputation = startups.length > 0
    ? Math.round(startups.reduce((sum, s) => sum + (s.reputation || 0), 0) / startups.length)
    : 0;

  return (
    <HubLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Dashboard do Ecossistema
          </h1>
          <p className="text-slate-400">
            Visão geral em tempo real da plataforma de governança descentralizada
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Zap size={16} className="text-cyan-400" />
                Total de Startups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{startups.length}</div>
              <p className="text-xs text-slate-500 mt-2">
                {coreStartup ? "1 Core + " + challengerStartups.length + " Desafiantes" : "Nenhuma"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Wallet size={16} className="text-green-400" />
                Master Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                ${vault ? (Number(vault.totalBalance) / 1000000).toFixed(2) : 0}M
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {vault?.btcReserve || 0} BTC em reserva
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                ${(totalRevenue / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-slate-500 mt-2">Todas as startups</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                Reputação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{avgReputation}</div>
              <p className="text-xs text-slate-500 mt-2">Ecossistema</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity size={16} className="text-amber-400" />
                Missões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{orchestratorQuery.data?.active ?? 0}</div>
              <p className="text-xs text-slate-500 mt-2">Control plane</p>
            </CardContent>
          </Card>
        </div>

        {/* Core Startup */}
        {coreStartup && (
          <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-cyan-400 text-xl">{coreStartup.name}</CardTitle>
                  <CardDescription>Startup Core - Líder do Ecossistema</CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold">
                  CORE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Receita</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    ${(coreStartup.revenue / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Tração</p>
                  <p className="text-2xl font-bold text-blue-400">{coreStartup.traction}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Reputação</p>
                  <p className="text-2xl font-bold text-purple-400">{coreStartup.reputation}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <Badge className="bg-green-600 text-white">{coreStartup.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Challenger Startups */}
        {challengerStartups.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Startups Desafiantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challengerStartups.map((startup) => (
                <Card key={startup.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-slate-200">{startup.name}</CardTitle>
                      <Badge variant="outline" className="text-slate-400 border-slate-700">
                        {startup.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Receita:</span>
                      <span className="text-cyan-400 font-semibold">
                        ${(startup.revenue / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Tração:</span>
                      <span className="text-blue-400 font-semibold">{startup.traction}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Reputação:</span>
                      <span className="text-purple-400 font-semibold">{startup.reputation}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {startups.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 text-center">
              <Zap className="mx-auto mb-4 text-slate-600" size={48} />
              <p className="text-slate-400 font-medium">Nenhuma startup criada ainda.</p>
              <p className="text-sm text-slate-500 mt-2">
                Acesse a seção de Startups para criar novas empresas e começar a governança.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </HubLayout>
  );
}
