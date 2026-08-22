import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: startups, isLoading: startupsLoading } = trpc.startups.list.useQuery();
  const { data: agents, isLoading: agentsLoading } = trpc.agents.list.useQuery();
  const { data: vault, isLoading: vaultLoading } = trpc.finance.vault.useQuery();
  const { data: opportunities, isLoading: oppLoading } = trpc.arbitrage.opportunities.useQuery({ status: "identified" });

  const activeStartups = startups?.filter((s) => s.status !== "archived").length || 0;
  const totalRevenue = startups?.reduce((sum, s) => sum + (s.revenue || 0), 0) || 0;
  const arbitrageCount = opportunities?.length || 0;

  const metricsData = [
    { name: "Jan", startups: 4, agents: 12, revenue: 50000 },
    { name: "Feb", startups: 5, agents: 14, revenue: 65000 },
    { name: "Mar", startups: 6, agents: 16, revenue: 78000 },
    { name: "Apr", startups: 7, agents: 18, revenue: 92000 },
    { name: "May", startups: 8, agents: 20, revenue: 110000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Executivo</h1>
        <p className="text-slate-400">Visão geral do ecossistema Nexus-HUB em tempo real</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Startups Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {startupsLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-white">{activeStartups}</div>}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Agentes IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentsLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-white">{agents?.length || 0}</div>}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {startupsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold text-white">${(totalRevenue / 1000).toFixed(0)}K</div>}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Arbitragens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {oppLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-white">{arbitrageCount}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Crescimento do Ecossistema</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Legend />
                <Line type="monotone" dataKey="startups" stroke="#fbbf24" strokeWidth={2} />
                <Line type="monotone" dataKey="agents" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="revenue" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Alertas e Eventos Críticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-sm">
              ⚠️ Proposta de investimento em GreenAsset DAO aguardando votação do conselho
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-200 text-sm">
              ✅ Arbitragem executada com sucesso: Lucro de $5,200 entre exchanges
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-200 text-sm">
              ℹ️ Novo agente IA ativado: INNOVATION-NEXUS com especialização em inovação
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
