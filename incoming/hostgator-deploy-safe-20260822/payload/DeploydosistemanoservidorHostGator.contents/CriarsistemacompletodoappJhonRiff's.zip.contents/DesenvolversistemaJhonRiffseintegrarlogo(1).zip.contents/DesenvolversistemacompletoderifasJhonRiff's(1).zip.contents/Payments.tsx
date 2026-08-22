import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet, Send, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Payments() {
  const { user } = useAuth();
  const { data: payments, isLoading } = trpc.payments.getUserPayments.useQuery(undefined, {
    enabled: !!user,
  });
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const commissionPayments = payments?.filter((p) => p.type === "commission") || [];
  const bonusPayments = payments?.filter((p) => p.type === "bonus") || [];
  const withdrawalPayments = payments?.filter((p) => p.type === "withdrawal") || [];

  const totalCommissions = commissionPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalBonus = bonusPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalWithdrawals = withdrawalPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">JR Bank - Gerenciamento de Saldo</h1>
          <p className="text-gray-600 mt-2">Acompanhe seu saldo e realize saques</p>
        </div>

        {/* Main Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">R$ {user?.totalBalance || "0.00"}</div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-blue-100 text-sm">Comissões</p>
                <p className="font-bold">R$ {user?.directSalesCommission || "0.00"}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Rede</p>
                <p className="font-bold">R$ {user?.teamCommissionBalance || "0.00"}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Saques</p>
                <p className="font-bold">R$ {totalWithdrawals.toFixed(2)}</p>
              </div>
            </div>
            <Button onClick={() => setShowWithdraw(!showWithdraw)} variant="secondary" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Solicitar Saque
            </Button>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        {showWithdraw && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Solicitar Saque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Saque</label>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo: R$ {user?.totalBalance || "0.00"}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Confirmar Saque</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalCommissions.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{commissionPayments.length} transações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Bônus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {totalBonus.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{bonusPayments.length} transações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R$ {totalWithdrawals.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{withdrawalPayments.length} transações</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-left py-2 px-4">Valor</th>
                    <th className="text-left py-2 px-4">Descrição</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">#{payment.id}</td>
                      <td className="py-2 px-4">
                        <span className="text-sm font-medium">
                          {payment.type === "commission"
                            ? "Comissão"
                            : payment.type === "bonus"
                            ? "Bônus"
                            : payment.type === "withdrawal"
                            ? "Saque"
                            : "Depósito"}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-bold">R$ {parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="py-2 px-4 text-sm text-gray-600">{payment.description || "-"}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "processed"
                            ? "Processado"
                            : payment.status === "pending"
                            ? "Pendente"
                            : "Falhou"}
                        </span>
                      </td>
                      <td className="py-2 px-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments?.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma transação registrada</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
