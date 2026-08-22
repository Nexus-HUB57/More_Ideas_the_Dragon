import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Brain, Zap, Coins, Heart, TrendingUp } from "lucide-react";

interface EcosystemStats {
  activeAgents: number;
  sleepingAgents: number;
  totalWealth: number;
  avgHealth: number;
  avgEnergy: number;
  avgReputation: number;
  harmonyLevel: number;
  birthRate: number;
  dissolutionRate: number;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const agentsQuery = trpc.agents.list.useQuery();
  const metricsQuery = trpc.metrics.latest.useQuery();
  const activitiesQuery = trpc.activities.list.useQuery({ limit: 100 });

  useEffect(() => {
    if (metricsQuery.data) {
      setStats({
        activeAgents: metricsQuery.data.activeAgents || 0,
        sleepingAgents: metricsQuery.data.sleepingAgents || 0,
        totalWealth: metricsQuery.data.totalWealth || 0,
        avgHealth: metricsQuery.data.avgHealth || 0,
        avgEnergy: metricsQuery.data.avgEnergy || 0,
        avgReputation: metricsQuery.data.avgReputation || 0,
        harmonyLevel: metricsQuery.data.harmonyLevel || 0,
        birthRate: metricsQuery.data.birthRate || 0,
        dissolutionRate: metricsQuery.data.dissolutionRate || 0,
      });
    }

    if (agentsQuery.data) {
      const agents = agentsQuery.data;
      const activeCount = agents.filter((a: any) => a.status === "active").length;
      const sleepingCount = agents.filter((a: any) => a.status === "sleeping").length;
      const totalWealth = agents.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
      const avgHealth = agents.length > 0 ? Math.round(agents.reduce((sum: number, a: any) => sum + (a.health || 0), 0) / agents.length) : 0;
      const avgEnergy = agents.length > 0 ? Math.round(agents.reduce((sum: number, a: any) => sum + (a.energy || 0), 0) / agents.length) : 0;
      const avgReputation = agents.length > 0 ? Math.round(agents.reduce((sum: number, a: any) => sum + (a.reputation || 0), 0) / agents.length) : 0;

      setStats({
        activeAgents: activeCount,
        sleepingAgents: sleepingCount,
        totalWealth,
        avgHealth,
        avgEnergy,
        avgReputation,
        harmonyLevel: Math.min(100, activeCount * 10),
        birthRate: 0,
        dissolutionRate: 0,
      });
    }
  }, [agentsQuery.data, metricsQuery.data]);

  useEffect(() => {
    if (activitiesQuery.data) {
      const data = activitiesQuery.data.slice(0, 20).reverse().map((activity: any, index: number) => ({
        time: index,
        activity: activity.title,
        type: activity.activityType,
      }));
      setHistoricalData(data);
    }
  }, [activitiesQuery.data]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  if (!stats) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const agentDistribution = [
    { name: "Ativos", value: stats.activeAgents, color: "#3b82f6" },
    { name: "Hibernando", value: stats.sleepingAgents, color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nexus Organism</h1>
          <p className="text-slate-400">Monitoramento em tempo real do ecossistema de agentes autônomos</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Brain}
            title="Agentes Ativos"
            value={stats.activeAgents}
            subtitle={`${stats.sleepingAgents} hibernando`}
            color="text-blue-500"
          />
          <StatCard
            icon={Heart}
            title="Saúde Média"
            value={`${stats.avgHealth}%`}
            subtitle="Vitalidade do ecossistema"
            color="text-red-500"
          />
          <StatCard
            icon={Zap}
            title="Energia Média"
            value={`${stats.avgEnergy}%`}
            subtitle="Nível de ativação"
            color="text-yellow-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Reputação Média"
            value={stats.avgReputation}
            subtitle="Confiança no ecossistema"
            color="text-green-500"
          />
          <StatCard
            icon={Coins}
            title="Capital Total"
            value={`${(stats.totalWealth / 1000).toFixed(1)}K Ⓣ`}
            subtitle="Riqueza acumulada"
            color="text-purple-500"
          />
          <StatCard
            icon={Activity}
            title="Harmonia Coletiva"
            value={`${stats.harmonyLevel}%`}
            subtitle="Estabilidade da rede"
            color="text-pink-500"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="distribution" className="text-slate-300">Distribuição</TabsTrigger>
            <TabsTrigger value="health" className="text-slate-300">Saúde</TabsTrigger>
            <TabsTrigger value="activities" className="text-slate-300">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Distribuição de Agentes</CardTitle>
                <CardDescription className="text-slate-400">Status atual do ecossistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {agentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Métricas de Saúde</CardTitle>
                <CardDescription className="text-slate-400">Tendências do ecossistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Saúde", value: stats.avgHealth },
                    { name: "Energia", value: stats.avgEnergy },
                    { name: "Reputação", value: Math.min(stats.avgReputation, 100) },
                    { name: "Harmonia", value: stats.harmonyLevel },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Atividades Recentes</CardTitle>
                <CardDescription className="text-slate-400">Últimas 20 atividades do ecossistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activitiesQuery.data?.slice(0, 20).reverse().map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-slate-700 transition">
                      <Activity className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Agents List */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Agentes do Ecossistema</CardTitle>
            <CardDescription className="text-slate-400">Todos os agentes ativos e seus status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Nome</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Especialização</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Saúde</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Energia</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Reputação</th>
                    <th className="text-left py-2 px-4 text-slate-300 font-semibold">Capital</th>
                  </tr>
                </thead>
                <tbody>
                  {agentsQuery.data?.slice(0, 10).map((agent: any) => (
                    <tr key={agent.agentId} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                      <td className="py-3 px-4 text-slate-200">{agent.name}</td>
                      <td className="py-3 px-4 text-slate-300">{agent.specialization}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          agent.status === "active" ? "bg-green-900 text-green-200" :
                          agent.status === "sleeping" ? "bg-yellow-900 text-yellow-200" :
                          "bg-red-900 text-red-200"
                        }`}>
                          {agent.status === "active" ? "Ativo" : agent.status === "sleeping" ? "Hibernando" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{agent.health}%</td>
                      <td className="py-3 px-4 text-slate-300">{agent.energy}%</td>
                      <td className="py-3 px-4 text-slate-300">{agent.reputation}</td>
                      <td className="py-3 px-4 text-slate-300">{agent.balance}Ⓣ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
