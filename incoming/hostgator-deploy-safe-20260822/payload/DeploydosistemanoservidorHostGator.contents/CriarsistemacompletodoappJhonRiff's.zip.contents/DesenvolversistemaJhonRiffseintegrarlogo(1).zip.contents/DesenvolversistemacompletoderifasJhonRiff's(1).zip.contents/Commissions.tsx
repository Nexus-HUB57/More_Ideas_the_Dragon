import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Commissions() {
  const { user } = useAuth();
  const { data: commissions, isLoading } = trpc.commissions.getUserCommissions.useQuery(undefined, {
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const totalCommissions = commissions?.reduce((sum, comm) => sum + parseFloat(comm.commissionAmount), 0) || 0;
  const pendingCommissions = commissions?.filter((c) => c.status === "pending") || [];
  const paidCommissions = commissions?.filter((c) => c.status === "paid") || [];

  const commissionTypeLabel: Record<string, string> = {
    direct: "Comissão Direta (10%)",
    level2: "Nível 2 (5%)",
    level3: "Nível 3 (2.5%)",
    level4: "Nível 4 (2.5%)",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-600 mt-2">Acompanhe suas comissões e ganhos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total de Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{commissions?.length || 0} comissões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                R$ {pendingCommissions.reduce((sum, c) => sum + parseFloat(c.commissionAmount), 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{pendingCommissions.length} pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Pagas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                R$ {paidCommissions.reduce((sum, c) => sum + parseFloat(c.commissionAmount), 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{paidCommissions.length} pagas</p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-left py-2 px-4">Taxa</th>
                    <th className="text-left py-2 px-4">Valor Base</th>
                    <th className="text-left py-2 px-4">Comissão</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions?.map((commission) => (
                    <tr key={commission.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">#{commission.id}</td>
                      <td className="py-2 px-4">
                        <span className="text-sm">
                          {commissionTypeLabel[commission.commissionType] || commission.commissionType}
                        </span>
                      </td>
                      <td className="py-2 px-4">{parseFloat(commission.commissionRate).toFixed(2)}%</td>
                      <td className="py-2 px-4">R$ {parseFloat(commission.baseAmount).toFixed(2)}</td>
                      <td className="py-2 px-4 font-bold text-green-600">
                        R$ {parseFloat(commission.commissionAmount).toFixed(2)}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            commission.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : commission.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {commission.status === "paid" ? "Paga" : commission.status === "pending" ? "Pendente" : "Cancelada"}
                        </span>
                      </td>
                      <td className="py-2 px-4">{new Date(commission.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commissions?.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma comissão registrada</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
