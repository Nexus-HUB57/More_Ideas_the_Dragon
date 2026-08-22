import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Finance() {
  const { data: vault, isLoading: vaultLoading } = trpc.finance.vault.useQuery();
  const { data: transactions, isLoading: transLoading } = trpc.finance.transactions.useQuery({});

  const distributionData = [
    { name: "Master Vault (80%)", value: vault?.totalBalance ? Math.floor(vault.totalBalance * 0.8) : 0 },
    { name: "Treasury V2 (10%)", value: vault?.totalBalance ? Math.floor(vault.totalBalance * 0.1) : 0 },
    { name: "Agents (10%)", value: vault?.totalBalance ? vault.totalBalance - Math.floor(vault.totalBalance * 0.8) - Math.floor(vault.totalBalance * 0.1) : 0 },
  ];

  const COLORS = ["#fbbf24", "#60a5fa", "#34d399"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tesouraria V2 & Master Vault</h1>
        <p className="text-slate-400">Gestão financeira e distribuição de receitas</p>
      </div>

      {/* Vault Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Master Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaultLoading ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Saldo Total</p>
                <p className="text-2xl font-bold text-white">${(vault?.totalBalance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Liquidity Fund</p>
                <p className="text-2xl font-bold text-amber-400">${(vault?.liquidityFund || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Infrastructure Fund</p>
                <p className="text-2xl font-bold text-blue-400">${(vault?.infrastructureFund || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">BTC Reserve</p>
                <p className="text-2xl font-bold text-orange-400">{vault?.btcReserve || 0} BTC</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Distribuição 80/10/10</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: $${value.toLocaleString()}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-8 bg-slate-700" />)
              ) : (
                transactions?.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-2 bg-slate-700/50 rounded text-sm">
                    <div>
                      <p className="text-white font-medium">{tx.type}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-amber-400 font-semibold">${tx.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
