import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, ShoppingCart, DollarSign, Ticket } from "lucide-react";

export default function AdminHome() {
  const { data: salesStats } = trpc.sales.getSalesStats.useQuery();
  const { data: paymentStats } = trpc.payments.getPaymentStats.useQuery();
  const { data: lotteryStats } = trpc.lotteries.getLotteryStats.useQuery();
  const { data: affiliates } = trpc.affiliates.getAllAffiliates.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema Jhon Riff's
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Membros da rede</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              {salesStats?.confirmedSales || 0} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesStats?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorteios Ativos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lotteryStats?.activeLotteries || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lotteryStats?.wonLotteries || 0} ganhadores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total de Vendas:</span>
              <span className="font-semibold">{salesStats?.totalSales || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Confirmadas:</span>
              <span className="font-semibold text-green-600">
                {salesStats?.confirmedSales || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pendentes:</span>
              <span className="font-semibold text-yellow-600">
                {salesStats?.pendingSales || 0}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <span className="text-sm font-semibold">Valor Total:</span>
              <span className="font-bold">
                {formatCurrency(salesStats?.totalAmount || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total de Pagamentos:</span>
              <span className="font-semibold">{paymentStats?.totalPayments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Processados:</span>
              <span className="font-semibold text-green-600">
                {paymentStats?.completedPayments || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Pendentes:</span>
              <span className="font-semibold text-yellow-600">
                {paymentStats?.pendingPayments || 0}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <span className="text-sm font-semibold">Valor Pago:</span>
              <span className="font-bold">
                {formatCurrency(paymentStats?.totalPaid || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
