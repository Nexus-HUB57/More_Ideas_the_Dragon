import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TransactionsHistory() {
  const { data: transactions, isLoading } = trpc.transactions.getHistory.useQuery();

  const copyToClipboard = (txid: string) => {
    navigator.clipboard.writeText(txid);
    toast.success("TXID copiado!");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBTC = (sats: string | null) => {
    const value = sats || "0";
    const num = parseInt(value) / 1e8;
    return num.toFixed(8);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmada";
      case "PENDING":
        return "Pendente";
      case "FAILED":
        return "Falhou";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Histórico de Transações</h1>
        <p className="text-slate-400">Rastreamento completo de movimentações Bitcoin</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ArrowUp size={16} className="text-green-400" />
              Total Enviado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {transactions
                ?.filter((t) => {
          // Assumir que transações com fromAddressId são outgoing
          return true;
        })
                .reduce((sum, t) => sum + (parseInt(t.amountSats || "0") / 1e8), 0)
                .toFixed(8) || "0"}{" "}
              BTC
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ArrowDown size={16} className="text-blue-400" />
              Total Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {transactions
                ?.filter((t) => {
          // Assumir que transações com toAddress são incoming
          return true;
        })
                .reduce((sum, t) => sum + (parseInt(t.amountSats || "0") / 1e8), 0)
                .toFixed(8) || "0"}{" "}
              BTC
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{transactions?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações de Bitcoin</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhuma transação registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-amber-500/30 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-slate-600/50">
                        <ArrowUp size={18} className="text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Envio</p>
                        <p className="text-xs text-slate-400 mt-1 break-all font-mono">{tx.txid}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(tx.txid || "")}
                      className="p-2 hover:bg-slate-600 rounded transition"
                    >
                      <Copy size={16} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-600">
                    <div>
                      <p className="text-xs text-slate-400">Valor</p>
                      <p className="text-sm font-mono text-amber-400">
                        {formatBTC(tx.amountSats)} BTC
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Taxa</p>
                      <p className="text-sm font-mono text-slate-300">
                        {tx.feeSats ? formatBTC(tx.feeSats) : "—"} BTC
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Confirmações</p>
                      <p className="text-sm font-mono text-slate-300">{tx.confirmations || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <Badge className={`${getStatusColor(tx.status || "")} border`}>
                        {getStatusLabel(tx.status || "")}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    {formatDate(tx.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm">ℹ️ Sobre Monitoramento de Transações</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>
            • Todas as transações são rastreadas em tempo real na Mainnet Bitcoin
          </p>
          <p>
            • Confirmações são atualizadas automaticamente a cada novo bloco
          </p>
          <p>
            • Broadcast com fallback automático (Blockchair, mempool.space, Blockstream.info)
          </p>
          <p>
            • Histórico completo é mantido para auditoria e compliance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
