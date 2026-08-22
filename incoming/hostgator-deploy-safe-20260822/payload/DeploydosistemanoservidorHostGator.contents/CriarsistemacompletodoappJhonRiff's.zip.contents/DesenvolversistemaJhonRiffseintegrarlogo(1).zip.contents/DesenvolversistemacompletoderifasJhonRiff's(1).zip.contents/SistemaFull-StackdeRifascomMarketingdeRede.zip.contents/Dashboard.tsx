import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, Gift, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user data
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: balance, isLoading: balanceLoading } = trpc.user.getBalance.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: careerInfo, isLoading: careerLoading } = trpc.user.getCareerInfo.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: mySales, isLoading: salesLoading } = trpc.sales.getMySales.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: myCommissions, isLoading: commissionsLoading } = trpc.commission.getMyCommissions.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { data: myNetwork, isLoading: networkLoading } = trpc.affiliate.getDirectReferrals.useQuery(undefined, {
    enabled: !!user?.id,
  });

  if (authLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const totalBalance = balance?.totalBalance ? parseFloat(balance.totalBalance.toString()) : 0;
  const directCommission = balance?.directSalesCommission ? parseFloat(balance.directSalesCommission.toString()) : 0;
  const teamCommission = balance?.teamCommissionBalance ? parseFloat(balance.teamCommissionBalance.toString()) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo, {user.name || "Afiliado"}!</h1>
          <p className="text-muted-foreground mt-2">Aqui está um resumo do seu desempenho</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalBalance.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Saldo disponível para saque</p>
            </CardContent>
          </Card>

          {/* Direct Commission */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Direta</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {directCommission.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">10% de suas vendas</p>
            </CardContent>
          </Card>

          {/* Team Commission */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão de Equipe</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {teamCommission.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Ganhos da sua rede</p>
            </CardContent>
          </Card>

          {/* Career Level */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível de Carreira</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{careerInfo?.currentLevel || 0}</div>
              <p className="text-xs text-muted-foreground">
                {careerInfo?.levelInfo?.title || "Iniciante"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>Últimas transações de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6" />
                </div>
              ) : mySales && mySales.length > 0 ? (
                <div className="space-y-4">
                  {mySales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">
                          Venda #{sale.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          R$ {parseFloat(sale.amount.toString()).toFixed(2).replace(".", ",")}
                        </p>
                        <p className={`text-xs ${sale.status === "confirmed" ? "text-green-600" : "text-yellow-600"}`}>
                          {sale.status === "confirmed" ? "Confirmada" : "Pendente"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma venda ainda</p>
              )}
              <Button className="w-full mt-4" variant="outline">
                Ver Todas as Vendas
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Registrar Venda
              </Button>
              <Button className="w-full" variant="outline">
                Convidar Afiliado
              </Button>
              <Button className="w-full" variant="outline">
                Comprar Ticket de Rifa
              </Button>
              <Button className="w-full" variant="outline">
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Network and Commissions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Network */}
          <Card>
            <CardHeader>
              <CardTitle>Sua Rede</CardTitle>
              <CardDescription>Afiliados diretos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {networkLoading ? <Loader2 className="animate-spin w-6 h-6" /> : myNetwork?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Você tem {myNetwork?.length || 0} afiliado(s) direto(s) na sua rede
              </p>
              <Button className="w-full" variant="outline">
                Gerenciar Rede
              </Button>
            </CardContent>
          </Card>

          {/* Recent Commissions */}
          <Card>
            <CardHeader>
              <CardTitle>Comissões Recentes</CardTitle>
              <CardDescription>Últimas comissões recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {commissionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin w-6 h-6" />
                </div>
              ) : myCommissions && myCommissions.length > 0 ? (
                <div className="space-y-3">
                  {myCommissions.slice(0, 3).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">
                          {commission.commissionType === "direct"
                            ? "Comissão Direta"
                            : `Nível ${commission.commissionType.replace("level", "")}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commission.commissionRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          R$ {parseFloat(commission.commissionAmount.toString()).toFixed(2).replace(".", ",")}
                        </p>
                        <p className={`text-xs ${commission.status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                          {commission.status === "paid" ? "Paga" : "Pendente"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma comissão ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Career Progress */}
        {careerInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Carreira</CardTitle>
              <CardDescription>
                Nível {careerInfo.currentLevel}: {careerInfo.levelInfo?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Pontos Acumulados</span>
                    <span className="text-sm font-bold">{careerInfo.careerPoints}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (careerInfo.careerPoints / (careerInfo.levelInfo?.pointsRequired || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {careerInfo.levelInfo?.pointsRequired
                      ? careerInfo.levelInfo.pointsRequired - careerInfo.careerPoints
                      : 0}{" "}
                    pontos para o próximo nível
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
