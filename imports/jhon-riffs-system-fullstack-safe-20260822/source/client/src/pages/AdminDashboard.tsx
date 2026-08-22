import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  // Queries tRPC
  const affiliatesQuery = trpc.affiliates.listAll.useQuery({ limit: 100 });
  const accountsStatsQuery = trpc.accounts.getGlobalStats.useQuery();
  const paymentsQuery = trpc.payments.listAll.useQuery({ limit: 100 });
  const commissionsQuery = trpc.commissions.listAll.useQuery({ limit: 100 });

  // Verificar se é admin
  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      window.location.href = "/";
    }
  }, [user, loading]);

  // Processar dados para gráficos
  useEffect(() => {
    if (affiliatesQuery.data && accountsStatsQuery.data && paymentsQuery.data) {
      const affiliatesByLevel = {
        inscrito: 0,
        agente_autonomo: 0,
        consultor: 0,
        mentor: 0,
        executivo: 0,
        socio_investidor: 0,
        socio_gestor: 0,
        socio_jr_group: 0,
      };

      affiliatesQuery.data.forEach((aff: any) => {
        affiliatesByLevel[aff.careerLevel as keyof typeof affiliatesByLevel]++;
      });

      const paymentsData = [
        { name: "Confirmados", value: paymentsQuery.data.filter((p: any) => p.status === "confirmado").length },
        { name: "Identificados", value: paymentsQuery.data.filter((p: any) => p.status === "identificado").length },
        { name: "Pendentes", value: paymentsQuery.data.filter((p: any) => p.status === "pendente").length },
      ];

      setStats({
        affiliatesByLevel,
        paymentsData,
        totalAffiliates: affiliatesQuery.data.length,
        totalPayments: paymentsQuery.data.length,
        totalCommissions: commissionsQuery.data?.length || 0,
      });
    }
  }, [affiliatesQuery.data, accountsStatsQuery.data, paymentsQuery.data, commissionsQuery.data]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (user?.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Acesso Negado</div>;
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo ao painel de administração do Jhon Riff's</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAffiliates || 0}</div>
              <p className="text-xs text-muted-foreground">Membros ativos no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {accountsStatsQuery.data?.totalBalance.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Em contas virtuais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {accountsStatsQuery.data?.totalEarned.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Comissões geradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
              <p className="text-xs text-muted-foreground">Transações registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="affiliates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="affiliates">Afiliados por Nível</TabsTrigger>
            <TabsTrigger value="payments">Status de Pagamentos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Afiliados por Nível de Carreira</CardTitle>
                <CardDescription>Quantidade de membros em cada nível</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.affiliatesByLevel && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(stats.affiliatesByLevel).map(([level, count]) => ({
                      name: level.replace(/_/g, " "),
                      count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status de Pagamentos</CardTitle>
                <CardDescription>Distribuição de pagamentos por status</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.paymentsData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.paymentsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.paymentsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comissões Pendentes vs Pagas</CardTitle>
                <CardDescription>Evolução de comissões ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {commissionsQuery.data && (
                  <div className="text-center text-muted-foreground">
                    <p>Total de Comissões: {commissionsQuery.data.length}</p>
                    <p>Pendentes: {commissionsQuery.data.filter((c: any) => c.status === "pendente").length}</p>
                    <p>Pagas: {commissionsQuery.data.filter((c: any) => c.status === "pago").length}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Tables */}
        <Tabs defaultValue="affiliates-table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="affiliates-table">Afiliados</TabsTrigger>
            <TabsTrigger value="payments-table">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates-table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Afiliados</CardTitle>
                <CardDescription>Todos os membros do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">ID</th>
                        <th className="text-left py-2 px-4">Nível</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Pontos</th>
                        <th className="text-left py-2 px-4">Indicados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliatesQuery.data?.map((aff: any) => (
                        <tr key={aff.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{aff.id}</td>
                          <td className="py-2 px-4">{aff.careerLevel.replace(/_/g, " ")}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              aff.status === "ativo" ? "bg-green-100 text-green-800" :
                              aff.status === "inativo" ? "bg-gray-100 text-gray-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {aff.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{aff.accumulatedPoints}</td>
                          <td className="py-2 px-4">{aff.directDownlineCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments-table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">ID</th>
                        <th className="text-left py-2 px-4">Afiliado</th>
                        <th className="text-left py-2 px-4">Valor</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsQuery.data?.map((payment: any) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{payment.id}</td>
                          <td className="py-2 px-4">{payment.affiliateId}</td>
                          <td className="py-2 px-4">R$ {typeof payment.amount === "string" ? payment.amount : payment.amount.toFixed(2)}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              payment.status === "confirmado" ? "bg-green-100 text-green-800" :
                              payment.status === "identificado" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
