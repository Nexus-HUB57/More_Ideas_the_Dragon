import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Copy, Eye, EyeOff, Loader2, Plus, Upload, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Bitcoin Quantum Wallet - Home Page
 * Main interface for wallet management, address generation, and transactions
 */
export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);

  // Fetch user wallets
  const { data: wallets, isLoading: walletsLoading } = trpc.wallet.getMyWallets.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const generateWalletMutation = trpc.wallet.generateNewWallet.useMutation({
    onSuccess: (data) => {
      toast.success("Carteira criada com sucesso!");
      // Invalidate wallets query to refresh list
      trpc.useUtils().wallet.getMyWallets.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const importWalletMutation = trpc.wallet.importWalletFromMnemonic.useMutation({
    onSuccess: () => {
      toast.success("Carteira importada com sucesso!");
      trpc.useUtils().wallet.getMyWallets.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const generateAddressMutation = trpc.wallet.generateAddress.useMutation({
    onSuccess: (data) => {
      toast.success(`Endereço gerado: ${data.address}`);
      if (selectedWallet) {
        trpc.useUtils().wallet.getAddresses.invalidate({ walletId: selectedWallet });
      }
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Form states
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletPassword, setNewWalletPassword] = useState("");
  const [newWalletType, setNewWalletType] = useState("segwit");
  const [newWalletNetwork, setNewWalletNetwork] = useState("mainnet");

  const [importMnemonic, setImportMnemonic] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  const [importPassword, setImportPassword] = useState("");

  const handleGenerateWallet = async () => {
    if (!newWalletName || !newWalletPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    generateWalletMutation.mutate({
      walletName: newWalletName,
      walletType: newWalletType as "legacy" | "segwit" | "taproot",
      network: newWalletNetwork as "mainnet" | "testnet",
      password: newWalletPassword,
    });
  };

  const handleImportWallet = async () => {
    if (!importMnemonic || !importWalletName || !importPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    importWalletMutation.mutate({
      mnemonic: importMnemonic,
      walletName: importWalletName,
      password: importPassword,
      walletType: "segwit",
      network: "mainnet",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Bitcoin Quantum Wallet
            </CardTitle>
            <CardDescription>Carteira Bitcoin descentralizada e segura</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Faça login para gerenciar suas carteiras Bitcoin com segurança total.
            </p>
            <Button className="w-full" onClick={() => window.location.href = "/api/oauth/login"}>
              Fazer Login
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
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <Wallet className="h-10 w-10 text-blue-600" />
            Bitcoin Quantum Wallet
          </h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.name || "usuário"}!</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create/Import Wallet Section */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Carteiras</CardTitle>
                <CardDescription>Crie uma nova carteira ou importe uma existente</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Criar Nova</TabsTrigger>
                    <TabsTrigger value="import">Importar Mnemonic</TabsTrigger>
                    <TabsTrigger value="file">Importar Arquivo</TabsTrigger>
                  </TabsList>

                  {/* Create Wallet Tab */}
                  <TabsContent value="create" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet-name">Nome da Carteira</Label>
                      <Input
                        id="wallet-name"
                        placeholder="Minha Carteira Bitcoin"
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet-type">Tipo de Endereço</Label>
                        <Select value={newWalletType} onValueChange={setNewWalletType}>
                          <SelectTrigger id="wallet-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="legacy">Legacy (P2PKH)</SelectItem>
                            <SelectItem value="segwit">SegWit (P2WPKH)</SelectItem>
                            <SelectItem value="taproot">Taproot (P2TR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wallet-network">Rede</Label>
                        <Select value={newWalletNetwork} onValueChange={setNewWalletNetwork}>
                          <SelectTrigger id="wallet-network">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mainnet">Mainnet</SelectItem>
                            <SelectItem value="testnet">Testnet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wallet-password">Senha</Label>
                      <Input
                        id="wallet-password"
                        type="password"
                        placeholder="Senha forte (mín. 8 caracteres)"
                        value={newWalletPassword}
                        onChange={(e) => setNewWalletPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleGenerateWallet}
                      disabled={generateWalletMutation.isPending}
                      className="w-full"
                    >
                      {generateWalletMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Carteira
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Import Wallet Tab */}
                  <TabsContent value="import" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-mnemonic">Frase Mnemônica (12 ou 24 palavras)</Label>
                      <Textarea
                        id="import-mnemonic"
                        placeholder="Insira sua frase mnemônica separada por espaços"
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="import-wallet-name">Nome da Carteira</Label>
                      <Input
                        id="import-wallet-name"
                        placeholder="Minha Carteira Importada"
                        value={importWalletName}
                        onChange={(e) => setImportWalletName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="import-password">Senha</Label>
                      <Input
                        id="import-password"
                        type="password"
                        placeholder="Senha para proteger a carteira"
                        value={importPassword}
                        onChange={(e) => setImportPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleImportWallet}
                      disabled={importWalletMutation.isPending}
                      className="w-full"
                    >
                      {importWalletMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Carteira
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Import File Tab */}
                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        Importe carteiras de arquivos TXT, JSON ou DAT (Bitcoin Core)
                      </p>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "/import-file")}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ir para Importação de Arquivo
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Wallets List */}
            {walletsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
              </Card>
            ) : wallets && wallets.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Carteiras ({wallets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wallets.map((wallet) => (
                      <a
                        key={wallet.id}
                        href={`/wallet/${wallet.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{wallet.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {wallet.walletType} • {wallet.network} • Saldo: {wallet.totalBalance} sat
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Nenhuma carteira encontrada. Crie uma nova ou importe uma existente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info & Security */}
          <div className="space-y-6">
            {/* Security Info */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="font-semibold mb-1">✓ Chaves Privadas Criptografadas</p>
                  <p className="text-xs text-muted-foreground">
                    Todas as chaves são criptografadas com AES-256-CBC
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Auto-custódia Completa</p>
                  <p className="text-xs text-muted-foreground">
                    Você controla 100% de suas chaves privadas
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">✓ Padrões Bitcoin</p>
                  <p className="text-xs text-muted-foreground">
                    Implementa BIP39, BIP32, BIP44 e ECDSA secp256k1
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Gerar múltiplas carteiras</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Importar via frase mnemônica</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Gerar endereços derivados</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Sincronizar UTXOs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Criar e assinar transações</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Histórico de operações</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">★</span>
                  <span>Importar Fundo Gênesis (FDR)</span>
                </div>
              </CardContent>
            </Card>

            {/* FDR Import Card */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">★</span>
                  Fundo Gênesis (FDR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Importe o Fundo Descentralizado Gênesis com 423.190+ endereços Bitcoin
                </p>
                <Button
                  onClick={() => (window.location.href = "/import-fdr")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar FDR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
