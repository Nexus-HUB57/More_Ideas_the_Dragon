import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";

export default function Commissions() {
  const { user } = useAuth();
  const { data: commissions, isLoading } = trpc.commission.getMyCommissions.useQuery();
  const { data: balance, isLoading: balanceLoading } = trpc.user.getBalance.useQuery();

  if (!user) return null;

  const directCommission = balance?.directSalesCommission
    ? parseFloat(balance.directSalesCommission.toString())
    : 0;
  const teamCommission = balance?.teamCommissionBalance
    ? parseFloat(balance.teamCommissionBalance.toString())
    : 0;

  const pendingTotal = commissions
    ?.filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0) || 0;

  const paidTotal = commissions
    ?.filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0) || 0;

  const getCommissionTypeLabel = (type: string) => {
    switch (type) {
      case "direct":
        return "Comissão Direta";
      case "level2":
        return "Nível 2";
      case "level3":
        return "Nível 3";
      case "level4":
        return "Nível 4+";
      default:
        return type;
    }
  };

  const getCommissionTypeColor = (type: string) => {
    switch (type) {
      case "direct":
        return "bg-blue-100 text-blue-800";
      case "level2":
        return "bg-green-100 text-green-800";
      case "level3":
        return "bg-purple-100 text-purple-800";
      case "level4":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comissões</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas comissões e ganhos
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Direct Commission */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Direta</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
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
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {teamCommission.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Ganhos da sua rede</p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {pendingTotal.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">A receber</p>
            </CardContent>
          </Card>

          {/* Paid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {paidTotal.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-xs text-muted-foreground">Já recebido</p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Comissões</CardTitle>
            <CardDescription>
              Todas as comissões geradas pela sua atividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : commissions && commissions.length > 0 ? (
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getCommissionTypeColor(
                              commission.commissionType
                            )}`}
                          >
                            {getCommissionTypeLabel(commission.commissionType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {commission.commissionRate}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Venda #{commission.saleId} • Base: R${" "}
                          {parseFloat(commission.baseAmount.toString()).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-bold">
                        R${" "}
                        {parseFloat(commission.commissionAmount.toString())
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          commission.status === "paid"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {commission.status === "paid" ? "Paga" : "Pendente"}
                      </p>
                    </div>

                    {commission.paidAt && (
                      <div className="text-right text-xs text-muted-foreground">
                        Paga em{" "}
                        {new Date(commission.paidAt).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Você ainda não tem comissões
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Structure Info */}
        <Card>
          <CardHeader>
            <CardTitle>Estrutura de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Comissões Unilevel</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível 1 (Direto)</span>
                    <span className="font-semibold">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível 2</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível 3</span>
                    <span className="font-semibold">2,5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível 4+</span>
                    <span className="font-semibold">2,5%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Como Ganhar Mais</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Aumente suas vendas diretas</li>
                  <li>✓ Construa uma rede maior</li>
                  <li>✓ Suba de nível de carreira</li>
                  <li>✓ Aumente a profundidade da rede</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
