import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, DollarSign, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { data: sales, isLoading: salesLoading } = trpc.sales.getUserSales.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: commissions, isLoading: commissionsLoading } = trpc.commissions.getUserCommissions.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: downline, isLoading: downlineLoading } = trpc.affiliates.getDownline.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Bem-vindo ao Jhon Riff's</h1>
        <p className="text-gray-600">Faça login para acessar seu dashboard</p>
        <Button asChild>
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    );
  }

  const totalSales = sales?.reduce((sum, sale) => sum + parseFloat(sale.amount), 0) || 0;
  const totalCommissions = commissions?.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0) || 0;
  const downlineCount = downline?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{sales?.length || 0} vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{commissions?.length || 0} comissões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Rede Direta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{downlineCount}</div>
              <p className="text-xs text-gray-500 mt-1">afiliados diretos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Nível de Carreira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Nível {user.careerLevel}</div>
              <p className="text-xs text-gray-500 mt-1">{user.careerPoints} pontos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/products">Ver Produtos</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/sales">Registrar Venda</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/lotteries">Ver Rifas</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saldo JR Bank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {user.totalBalance}</div>
              <p className="text-sm text-gray-600 mt-2">Saldo disponível para saque</p>
              <Button asChild className="w-full mt-4" variant="default">
                <Link href="/payments">Gerenciar Saldo</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sua Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Afiliados Diretos</p>
                  <p className="text-2xl font-bold">{downlineCount}</p>
                </div>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/network">Ver Rede Completa</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        {sales && sales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Últimas Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Venda #{sale.id}</p>
                      <p className="text-sm text-gray-600">{new Date(sale.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {parseFloat(sale.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{sale.status}</p>
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
