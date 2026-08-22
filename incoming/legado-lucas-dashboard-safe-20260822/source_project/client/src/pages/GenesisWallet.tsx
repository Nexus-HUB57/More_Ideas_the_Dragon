import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GenesisWallet() {
  const { data: addresses, isLoading } = trpc.genesis.getAddresses.useQuery();
  const [showBalances, setShowBalances] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (address: string, id: number) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success("Endereço copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBTC = (sats: string | null) => {
    const value = sats || "0";
    const num = parseInt(value) / 1e8;
    return num.toFixed(8);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  const totalBalance = addresses?.reduce((sum, addr) => {
    return sum + (parseInt(addr.balanceSats || "0") / 1e8);
  }, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Gênesis - Hot Wallet</h1>
        <p className="text-slate-400">Gerenciamento de endereços ativos para transações imediatas</p>
      </div>

      {/* Saldo Total */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400">Saldo Total</CardTitle>
          <CardDescription>Fundos disponíveis para transação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{totalBalance.toFixed(8)} BTC</p>
              <p className="text-sm text-slate-400 mt-2">
                {addresses?.length || 0} endereço(s) ativo(s)
              </p>
            </div>
            <Button
              onClick={() => setShowBalances(!showBalances)}
              variant="outline"
              size="sm"
              className="border-blue-500/30 hover:bg-blue-500/10"
            >
              {showBalances ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white h-12">
          <Send size={16} className="mr-2" />
          Enviar Bitcoin
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white h-12">
          Receber Bitcoin
        </Button>
      </div>

      {/* Lista de Endereços */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Endereços Ativos</CardTitle>
          <CardDescription>Todos os endereços Gênesis registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {!addresses || addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhum endereço Gênesis configurado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-blue-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300">
                        {address.label ? address.label : "Sem rótulo"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 break-all font-mono">{address.address}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(address.address, address.id)}
                      className="p-2 hover:bg-slate-600 rounded transition"
                    >
                      {copiedId === address.id ? (
                        <span className="text-xs text-green-400">✓</span>
                      ) : (
                        <Copy size={16} className="text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-600">
                    <div>
                      <p className="text-xs text-slate-400">Saldo</p>
                      {showBalances ? (
                        <p className="text-sm font-mono text-blue-400">
                          {formatBTC(address.balanceSats)} BTC
                        </p>
                      ) : (
                        <p className="text-sm font-mono text-slate-500">••••••••</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Satoshis</p>
                      {showBalances ? (
                        <p className="text-sm font-mono text-slate-300">{address.balanceSats || "0"}</p>
                      ) : (
                        <p className="text-sm font-mono text-slate-500">••••••••</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                      Enviar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm">ℹ️ Sobre Gênesis (Hot Wallet)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>
            • <strong>Gênesis</strong> é o Hot Wallet para transações imediatas e de alta frequência
          </p>
          <p>
            • Mantém apenas o saldo necessário para operações diárias, minimizando risco de exposição
          </p>
          <p>
            • Chaves privadas são gerenciadas com segurança máxima no servidor
          </p>
          <p>
            • Para fundos de longo prazo, use <strong>Cerberus (Cold Storage)</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
