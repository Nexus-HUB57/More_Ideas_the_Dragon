import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";

export default function Sales() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: sales, isLoading: salesLoading } = trpc.sales.list.useQuery();

  const totalSales = sales?.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0) || 0;
  const totalCommissions = sales?.reduce((sum, s) => sum + parseFloat(s.commission.toString()), 0) || 0;
  const confirmedSales = sales?.filter((s) => s.status === "confirmed").length || 0;
  const pendingSales = sales?.filter((s) => s.status === "pending").length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/dashboard")}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Vendas</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalSales.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalCommissions.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{confirmedSales}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-amber-600">{pendingSales}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Histórico de Vendas
            </CardTitle>
            <CardDescription>
              Todas as suas vendas e comissões associadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Comissão</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale: any) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">#{sale.id}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          R$ {parseFloat(sale.amount.toString()).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          R$ {parseFloat(sale.commission.toString()).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(sale.status)}
                            <span className="text-gray-600">
                              {getStatusLabel(sale.status)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Você ainda não realizou nenhuma venda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            Voltar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setLocation("/products")}
          >
            Vender Produtos
          </Button>
        </div>
      </div>
    </div>
  );
}
