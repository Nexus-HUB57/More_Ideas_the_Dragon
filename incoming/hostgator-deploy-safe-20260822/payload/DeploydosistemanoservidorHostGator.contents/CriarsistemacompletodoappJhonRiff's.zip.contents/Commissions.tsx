import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, DollarSign } from "lucide-react";

export default function Commissions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: commissions, isLoading: commissionsLoading } = trpc.commissions.list.useQuery();
  const { data: summary, isLoading: summaryLoading } = trpc.commissions.getSummary.useQuery();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "direct":
        return "Comissão Direta";
      case "unilevel":
        return "Comissão Unilevel";
      case "bonus":
        return "Bônus";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "direct":
        return "bg-blue-50 border-blue-200";
      case "unilevel":
        return "bg-green-50 border-green-200";
      case "bonus":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-600 bg-amber-50";
      case "paid":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
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
          <h1 className="text-2xl font-bold text-gray-900">Minhas Comissões</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  R$ {summary?.total || "0,00"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-amber-600">
                  R$ {summary?.pending || "0,00"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  R$ {summary?.paid || "0,00"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Diretas</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  R$ {summary?.direct || "0,00"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">Estrutura de Comissões (Unilevel)</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-900">
              <div>
                <p className="font-medium">Comissão Direta: 10%</p>
                <p className="text-xs text-blue-800">Sobre suas vendas diretas</p>
              </div>
              <div>
                <p className="font-medium">1º Nível: 10%</p>
                <p className="text-xs text-blue-800">Sobre vendas da sua rede direta</p>
              </div>
              <div>
                <p className="font-medium">2º Nível: 5%</p>
                <p className="text-xs text-blue-800">Sobre vendas do 2º nível</p>
              </div>
              <div>
                <p className="font-medium">3º e 4º Nível: 2,5% cada</p>
                <p className="text-xs text-blue-800">Sobre vendas dos níveis 3 e 4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Histórico de Comissões
            </CardTitle>
            <CardDescription>
              Todas as suas comissões e bonificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : commissions && commissions.length > 0 ? (
              <div className="space-y-3">
                {commissions.map((commission: any) => (
                  <div
                    key={commission.id}
                    className={`rounded-lg p-4 border flex items-center justify-between ${getTypeColor(
                      commission.type
                    )}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getTypeLabel(commission.type)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(commission.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Nível: {commission.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        R$ {parseFloat(commission.amount.toString()).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded mt-2 ${getStatusColor(
                          commission.status
                        )}`}
                      >
                        {commission.status === "pending"
                          ? "Pendente"
                          : commission.status === "paid"
                            ? "Paga"
                            : "Cancelada"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Você ainda não recebeu nenhuma comissão
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
            onClick={() => setLocation("/network")}
          >
            Expandir Rede
          </Button>
        </div>
      </div>
    </div>
  );
}
