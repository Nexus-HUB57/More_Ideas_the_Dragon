import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

export default function Treasury() {
  const [vault] = useState({
    totalBalance: 15750000,
    btcReserve: 2500000,
    liquidityFund: 8250000,
    infrastructureFund: 5000000,
  });

  const [transactions] = useState([
    {
      id: 1,
      type: "investment",
      from: "Master Vault",
      to: "Startup Alpha",
      amount: 500000,
      status: "completed",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      type: "revenue",
      from: "Startup Beta",
      to: "Master Vault",
      amount: 250000,
      status: "completed",
      date: new Date(Date.now() - 172800000),
    },
    {
      id: 3,
      type: "arbitrage",
      from: "Market Oracle",
      to: "Master Vault",
      amount: 125000,
      status: "completed",
      date: new Date(Date.now() - 259200000),
    },
    {
      id: 4,
      type: "distribution",
      from: "Master Vault",
      to: "Liquidity Fund",
      amount: 1000000,
      status: "pending",
      date: new Date(Date.now() - 345600000),
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      investment: "bg-blue-500/20 text-blue-400",
      revenue: "bg-green-500/20 text-green-400",
      arbitrage: "bg-purple-500/20 text-purple-400",
      distribution: "bg-cyan-500/20 text-cyan-400",
      transfer: "bg-gray-500/20 text-gray-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusColor = (status: string) => {
    return status === "completed" 
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tesouraria</h1>
          <p className="text-muted-foreground">Master Vault, reservas e transações financeiras</p>
        </div>

        {/* Master Vault Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card border-border p-6 neon-border-cyan">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Master Vault</h3>
              <Wallet className="h-6 w-6 text-cyan-500" />
            </div>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatCurrency(vault.totalBalance)}
            </p>
            <p className="text-sm text-muted-foreground">Saldo total do ecossistema</p>
          </Card>

          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Fundos</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Reserva BTC</span>
                  <span className="text-sm font-medium text-foreground">{((vault.btcReserve / vault.totalBalance) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-background rounded h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded"
                    style={{ width: `${(vault.btcReserve / vault.totalBalance) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Fundo de Liquidez</span>
                  <span className="text-sm font-medium text-foreground">{((vault.liquidityFund / vault.totalBalance) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-background rounded h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded"
                    style={{ width: `${(vault.liquidityFund / vault.totalBalance) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Fundo de Infraestrutura</span>
                  <span className="text-sm font-medium text-foreground">{((vault.infrastructureFund / vault.totalBalance) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-background rounded h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded"
                    style={{ width: `${(vault.infrastructureFund / vault.totalBalance) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fund Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Reserva BTC</p>
            <p className="text-2xl font-bold text-cyan-500">{formatCurrency(vault.btcReserve)}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Fundo de Liquidez</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(vault.liquidityFund)}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Fundo de Infraestrutura</p>
            <p className="text-2xl font-bold text-purple-500">{formatCurrency(vault.infrastructureFund)}</p>
          </Card>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Histórico de Transações</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                      {tx.type === "investment" || tx.type === "distribution" ? (
                        <ArrowDownLeft className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{tx.from} → {tx.to}</p>
                      <p className="text-xs text-muted-foreground">{tx.date.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(tx.amount)}</p>
                      <Badge className={getTypeColor(tx.type)}>{tx.type}</Badge>
                    </div>
                    <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
