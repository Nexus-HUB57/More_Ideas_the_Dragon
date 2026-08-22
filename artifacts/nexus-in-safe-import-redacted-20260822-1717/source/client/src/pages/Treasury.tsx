import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";

export default function Treasury() {
  const { data: vault, isLoading: vaultLoading } = trpc.treasury.getVault.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.treasury.getTransactions.useQuery({ limit: 50 });

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      transfer: "text-blue-600 dark:text-blue-400",
      investment: "text-green-600 dark:text-green-400",
      revenue: "text-purple-600 dark:text-purple-400",
      arbitrage: "text-orange-600 dark:text-orange-400",
      distribution: "text-red-600 dark:text-red-400",
    };
    return colors[type] || colors.transfer;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Tesouraria</h1>

      {/* Master Vault Overview */}
      {vaultLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : vault ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <p className="text-sm opacity-90">Saldo Total</p>
            <p className="text-3xl font-bold mt-2">${vault.totalBalance.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <p className="text-sm opacity-90">Reserva BTC</p>
            <p className="text-3xl font-bold mt-2">₿ {vault.btcReserve}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <p className="text-sm opacity-90">Fundo de Liquidez</p>
            <p className="text-3xl font-bold mt-2">${vault.liquidityFund.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <p className="text-sm opacity-90">Fundo de Infraestrutura</p>
            <p className="text-3xl font-bold mt-2">${vault.infrastructureFund.toLocaleString()}</p>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum dado do cofre disponível</p>
      )}

      {/* Breakdown */}
      {vault && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Distribuição de Fundos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Fundo de Liquidez</p>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{
                      width: `${(vault.liquidityFund / vault.totalBalance) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {((vault.liquidityFund / vault.totalBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Reserva BTC</p>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-orange-500"
                    style={{
                      width: `${(vault.btcReserve / vault.totalBalance) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {((vault.btcReserve / vault.totalBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Infraestrutura</p>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-purple-500"
                    style={{
                      width: `${(vault.infrastructureFund / vault.totalBalance) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {((vault.infrastructureFund / vault.totalBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Transactions History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Histórico de Transações</h2>
        {transactionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Data</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">Valor</th>
                  <th className="py-3 px-4 font-semibold">Descrição</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3 px-4 font-semibold text-sm ${getTransactionTypeColor(tx.type)}`}>
                      {tx.type.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">${tx.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{tx.description || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma transação disponível</p>
        )}
      </div>
    </div>
  );
}
