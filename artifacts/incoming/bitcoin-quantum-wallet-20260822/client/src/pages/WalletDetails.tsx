import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Eye, EyeOff, Loader2, Plus, QrCode, RefreshCw, Send } from "lucide-react";
import { useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Wallet Details Page
 * Shows wallet information, addresses, and transaction history
 */
export default function WalletDetails() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams<{ walletId?: string }>();
  const walletId = params?.walletId;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [addressType, setAddressType] = useState<"receive" | "change">("receive");

  const walletIdNum = walletId ? parseInt(walletId) : 0;

  // Fetch wallet details
  const { data: wallet, isLoading: walletLoading } = trpc.wallet.getWallet.useQuery(
    { walletId: walletIdNum },
    { enabled: isAuthenticated && walletIdNum > 0 }
  );

  // Fetch addresses
  const { data: addresses, isLoading: addressesLoading } = trpc.wallet.getAddresses.useQuery(
    { walletId: walletIdNum },
    { enabled: isAuthenticated && walletIdNum > 0 }
  );

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.getTransactionHistory.useQuery(
    { walletId: walletIdNum },
    { enabled: isAuthenticated && walletIdNum > 0 }
  );

  // Generate address mutation
  const generateAddressMutation = trpc.wallet.generateAddress.useMutation({
    onSuccess: (data) => {
      toast.success(`Endereço gerado: ${data.address}`);
      setPassword("");
      trpc.useUtils().wallet.getAddresses.invalidate({ walletId: walletIdNum });
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleGenerateAddress = async () => {
    if (!password) {
      toast.error("Por favor, insira sua senha");
      return;
    }

    generateAddressMutation.mutate({
      walletId: walletIdNum,
      addressType,
      password,
      addressIndex: (addresses?.length || 0) + 1,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">Carteira não encontrada</p>
              <Button onClick={() => window.location.href = "/"} className="mt-4">
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
            <Button variant="ghost" onClick={() => window.location.href = "/"} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          <h1 className="text-3xl font-bold mb-2">{wallet.name}</h1>
          <p className="text-muted-foreground">
            {wallet.walletType} • {wallet.network} • Saldo: {wallet.totalBalance} sat
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Carteira</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                    <p className="text-2xl font-bold">{wallet.totalBalance}</p>
                    <p className="text-xs text-muted-foreground">satoshis</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Endereços</p>
                    <p className="text-2xl font-bold">{addresses?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">gerados</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Tipo de Carteira</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                      {wallet.walletType}
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                      {wallet.network}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Endereços ({addresses?.length || 0})</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Endereço
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gerar Novo Endereço</DialogTitle>
                        <DialogDescription>
                          Crie um novo endereço para receber Bitcoin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address-type">Tipo de Endereço</Label>
                          <Select value={addressType} onValueChange={(value: any) => setAddressType(value)}>
                            <SelectTrigger id="address-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receive">Recebimento</SelectItem>
                              <SelectItem value="change">Troco</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address-password">Senha</Label>
                          <div className="relative">
                            <Input
                              id="address-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Insira sua senha"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          onClick={handleGenerateAddress}
                          disabled={generateAddressMutation.isPending}
                          className="w-full"
                        >
                          {generateAddressMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Gerar Endereço
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm break-all">{address.address}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {address.addressType} • Saldo: {address.balance} sat • {address.derivationPath}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(address.address)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum endereço gerado. Crie um novo endereço para começar.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Transactions Tab */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${tx.type === "send" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"}`}>
                              {tx.type === "send" ? (
                                <Send className={`h-4 w-4 ${tx.type === "send" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`} />
                              ) : (
                                <Send className="h-4 w-4 text-green-600 dark:text-green-400 rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {tx.type === "send" ? "Enviado" : "Recebido"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {tx.toAddress || tx.fromAddress}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${tx.type === "send" ? "text-red-600" : "text-green-600"}`}>
                              {tx.type === "send" ? "-" : "+"}{tx.amount} sat
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação encontrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Bitcoin
                </Button>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
                <Button className="w-full" variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Ver QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Criada em</p>
                  <p className="font-mono text-xs">
                    {wallet.createdAt ? new Date(wallet.createdAt).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Última sincronização</p>
                  <p className="font-mono text-xs">
                    {wallet.lastSyncAt ? new Date(wallet.lastSyncAt).toLocaleDateString("pt-BR") : "Nunca"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
