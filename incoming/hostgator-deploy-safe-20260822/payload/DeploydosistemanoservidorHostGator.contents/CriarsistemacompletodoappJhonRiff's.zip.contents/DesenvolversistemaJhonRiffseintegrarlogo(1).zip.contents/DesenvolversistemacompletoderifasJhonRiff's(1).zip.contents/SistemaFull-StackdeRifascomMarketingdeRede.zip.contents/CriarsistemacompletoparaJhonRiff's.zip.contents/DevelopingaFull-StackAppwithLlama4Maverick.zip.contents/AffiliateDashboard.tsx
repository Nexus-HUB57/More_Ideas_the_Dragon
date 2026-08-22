import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, Users, TrendingUp, Gift, Copy } from "lucide-react";
import { useState } from "react";

const formatCurrency = (value: any): string => {
  if (!value) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : (typeof value === "number" ? value : 0);
  return num.toFixed(2);
};

export default function AffiliateDashboard() {
  const { user, loading } = useAuth();
  const [copied, setCopied] = useState(false);

  // Queries tRPC
  const profileQuery = trpc.affiliates.getProfile.useQuery();
  const balanceQuery = trpc.accounts.getBalance.useQuery();
  const commissionsQuery = trpc.commissions.getMyCommissions.useQuery({ limit: 50 });
  const pendingCommissionsQuery = trpc.commissions.getPendingCommissions.useQuery();
  const downlineQuery = trpc.network.getMyDownline.useQuery({});
  const statsQuery = trpc.commissions.getStats.useQuery();
  const networkStatsQuery = trpc.network.getNetworkStats.useQuery();
  const transactionHistoryQuery = trpc.accounts.getTransactionHistory.useQuery({ limit: 20 });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}?sponsor=${user?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo ao seu painel de afiliado, {user?.name}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {formatCurrency(balanceQuery.data?.balance)}</div>
              <p className="text-xs text-muted-foreground">Na sua conta virtual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {pendingCommissionsQuery.data && pendingCommissionsQuery.data.length > 0 ? formatCurrency(pendingCommissionsQuery.data.reduce((sum: number, c: any) => sum + (typeof c.amount === "string" ? parseFloat(c.amount) : 0), 0)) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">{pendingCommissionsQuery.data?.length || 0} comissões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indicados Diretos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStatsQuery.data?.directDownlineCount || 0}</div>
              <p className="text-xs text-muted-foreground">Pessoas que você indicou</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível de Carreira</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileQuery.data?.affiliate?.careerLevel.replace(/_/g, " ") || "Inscrito"}</div>
              <p className="text-xs text-muted-foreground">{profileQuery.data?.affiliate?.accumulatedPoints || 0} pontos acumulados</p>
            </CardContent>
          </Card>
        </div>

        {/* Link de Afiliação */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Link de Afiliação</CardTitle>
            <CardDescription>Compartilhe este link para indicar novas pessoas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}?sponsor=${user?.id}`}
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="commissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="network">Minha Rede</TabsTrigger>
            <TabsTrigger value="transactions">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Comissões</CardTitle>
                <CardDescription>Estatísticas das suas comissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold">R$ {statsQuery.data?.totalPending.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pagas</p>
                    <p className="text-2xl font-bold">R$ {statsQuery.data?.totalPaid.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">R$ {((statsQuery.data?.totalPending || 0) + (statsQuery.data?.totalPaid || 0)).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comissões</CardTitle>
                <CardDescription>Suas últimas comissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Data</th>
                        <th className="text-left py-2 px-4">Nível</th>
                        <th className="text-left py-2 px-4">Taxa</th>
                        <th className="text-left py-2 px-4">Valor</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionsQuery.data?.map((commission: any) => (
                        <tr key={commission.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{new Date(commission.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4">Nível {commission.level}</td>
                          <td className="py-2 px-4">{typeof commission.commissionRate === "string" ? commission.commissionRate : commission.commissionRate.toFixed(2)}%</td>
                          <td className="py-2 px-4">R$ {typeof commission.amount === "string" ? commission.amount : commission.amount.toFixed(2)}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              commission.status === "pago" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {commission.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Rede</CardTitle>
                <CardDescription>Informações sobre seus indicados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Indicados Diretos</p>
                    <p className="text-3xl font-bold">{networkStatsQuery.data?.directDownlineCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total na Rede</p>
                    <p className="text-3xl font-bold">{networkStatsQuery.data?.totalDownlineCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meus Indicados</CardTitle>
                <CardDescription>Pessoas que você indicou</CardDescription>
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
                      </tr>
                    </thead>
                    <tbody>
                      {downlineQuery.data?.map((record: any) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{record.affiliateId}</td>
                          <td className="py-2 px-4">Nível {record.level}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              record.affiliate?.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {record.affiliate?.status || "N/A"}
                            </span>
                          </td>
                          <td className="py-2 px-4">{record.affiliate?.accumulatedPoints || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>Todas as transações da sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Data</th>
                        <th className="text-left py-2 px-4">Tipo</th>
                        <th className="text-left py-2 px-4">Valor</th>
                        <th className="text-left py-2 px-4">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionHistoryQuery.data?.map((transaction: any) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.type === "comissao" ? "bg-green-100 text-green-800" :
                              transaction.type === "saque" ? "bg-red-100 text-red-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-2 px-4">R$ {typeof transaction.amount === "string" ? transaction.amount : transaction.amount.toFixed(2)}</td>
                          <td className="py-2 px-4">{transaction.description}</td>
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
