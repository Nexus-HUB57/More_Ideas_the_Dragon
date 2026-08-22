import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Zap, Target, DollarSign, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.affiliate.getProfile.useQuery();
  const { data: totalCommissions } = trpc.affiliate.getTotalCommissions.useQuery();
  const { data: pendingCommissions } = trpc.affiliate.getPendingCommissions.useQuery();
  const { data: directReferrals } = trpc.affiliate.getDirectReferrals.useQuery();
  const { data: commissionHistory } = trpc.affiliate.getCommissionHistory.useQuery({ limit: 12 });
  const { data: agent } = trpc.agent.getProfile.useQuery();

  // Mock data for charts
  const mockChartData = [
    { month: "Jan", commissions: 400, referrals: 240 },
    { month: "Feb", commissions: 600, referrals: 320 },
    { month: "Mar", commissions: 800, referrals: 450 },
    { month: "Apr", commissions: 1200, referrals: 580 },
    { month: "May", commissions: 1600, referrals: 720 },
  ];

  const mockPerformanceData = [
    { week: "Semana 1", score: 45, sales: 120 },
    { week: "Semana 2", score: 52, sales: 150 },
    { week: "Semana 3", score: 58, sales: 180 },
    { week: "Semana 4", score: 65, sales: 220 },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="text-center text-slate-300">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard de Afiliado</h1>
          <p className="text-slate-400">Bem-vindo, {user?.name}! Aqui está seu resumo de performance.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Ganhos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">R$ {totalCommissions || "0,00"}</div>
              <p className="text-xs text-slate-400 mt-1">Comissões acumuladas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{pendingCommissions || "0,00"}</div>
              <p className="text-xs text-slate-400 mt-1">Comissões a confirmar</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Indicados Diretos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{directReferrals?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Pessoas indicadas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Código
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono font-bold text-indigo-400">{profile?.affiliateCode}</div>
              <p className="text-xs text-slate-400 mt-1">Seu código único</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="performance" className="text-slate-300">Performance</TabsTrigger>
            <TabsTrigger value="agent" className="text-slate-300">Agente IA</TabsTrigger>
            <TabsTrigger value="network" className="text-slate-300">Rede</TabsTrigger>
            <TabsTrigger value="upgrades" className="text-slate-300">Upgrades</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card className="border-0 shadow-lg bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
                <CardDescription className="text-slate-400">Evolução de ganhos nos últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Legend />
                    <Bar dataKey="commissions" fill="#3b82f6" name="Comissões (R$)" />
                    <Bar dataKey="referrals" fill="#10b981" name="Novos Indicados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agent">
            <Card className="border-0 shadow-lg bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Performance do Agente IA</CardTitle>
                <CardDescription className="text-slate-400">Evolução de score e vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Status</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{agent?.status || "inactive"}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Performance Score</p>
                    <p className="text-2xl font-bold text-indigo-400 mt-1">{agent?.performanceScore || 0}/100</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="week" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" name="Score" strokeWidth={2} />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" name="Vendas" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card className="border-0 shadow-lg bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Sua Rede de Indicados</CardTitle>
                <CardDescription className="text-slate-400">Pessoas que você indicou</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {directReferrals && directReferrals.length > 0 ? (
                    directReferrals.map((referral, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">Indicado #{referral.id}</p>
                            <p className="text-sm text-slate-400">Nível: {referral.level}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-8">Nenhum indicado ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrades">
            <Card className="border-0 shadow-lg bg-slate-800 text-white">
              <CardHeader>
                <CardTitle>Upgrades Disponíveis</CardTitle>
                <CardDescription className="text-slate-400">Potencialize seu agente IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-700 rounded-lg border border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Copywriting Avançado</p>
                        <p className="text-sm text-slate-400 mt-1">Técnicas de persuasão e psicologia de vendas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-400">R$ 99,00</p>
                        <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-700">Ativar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Potencialize seu Agente IA
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Desbloqueie novos recursos e aumente suas comissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full md:w-auto bg-white text-indigo-600 hover:bg-slate-100">
              Ver Todos os Upgrades
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
