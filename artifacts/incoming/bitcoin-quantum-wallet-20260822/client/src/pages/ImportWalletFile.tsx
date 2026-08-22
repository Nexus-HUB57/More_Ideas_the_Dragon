import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, FileUp, Loader2, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Import Wallet from File Page
 * Allows users to import wallets from various file formats (TXT, JSON, DAT)
 */
export default function ImportWalletFile() {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [walletName, setWalletName] = useState("");
  const [password, setPassword] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const previewMutation = trpc.walletImport.previewWalletFile.useQuery(
    {
      filename: selectedFile?.name || "",
      fileContent: fileContent,
    },
    {
      enabled: !!selectedFile && !!fileContent,
    }
  );

  const importMutation = trpc.walletImport.importWalletFromFile.useMutation({
    onSuccess: (data) => {
      toast.success(`Carteira importada com sucesso! ${data.addressCount} endereços importados.`);
      // Reset form
      setSelectedFile(null);
      setWalletName("");
      setPassword("");
      setFileContent("");
      setPreview(null);
      // Invalidate wallets query
      trpc.useUtils().wallet.getMyWallets.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setSelectedFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.onerror = () => {
      toast.error("Erro ao ler arquivo");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedFile || !walletName || !password || !fileContent) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    importMutation.mutate({
      filename: selectedFile.name,
      fileContent: fileContent,
      walletName: walletName,
      password: password,
      network: "mainnet",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground">Por favor, faça login para importar carteiras</p>
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
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <FileUp className="h-10 w-10 text-blue-600" />
            Importar Carteira de Arquivo
          </h1>
          <p className="text-muted-foreground">
            Importe carteiras de arquivos TXT, JSON ou DAT do Bitcoin Core
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Arquivo</CardTitle>
                <CardDescription>
                  Escolha um arquivo de carteira para importar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.json,.dat,.wallet"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold mb-1">
                      {selectedFile ? selectedFile.name : "Clique ou arraste um arquivo"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Formatos suportados: TXT, JSON, DAT (máximo 10MB)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Arquivo Selecionado:</p>
                    <p className="font-mono text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Card */}
            {fileContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização</CardTitle>
                  <CardDescription>
                    Dados detectados no arquivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewMutation.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : previewMutation.data ? (
                    <div className="space-y-4">
                      {/* Format */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded">
                        <span className="text-sm font-semibold">Formato:</span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-sm">
                          {previewMutation.data.format.toUpperCase()}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 p-3 rounded">
                        {previewMutation.data.isValid ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600">Arquivo válido</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-600">Arquivo inválido</span>
                          </>
                        )}
                      </div>

                      {/* Data Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Endereços</p>
                          <p className="text-2xl font-bold">{previewMutation.data.addressCount}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Chaves Privadas</p>
                          <p className="text-2xl font-bold">{previewMutation.data.privateKeyCount}</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 text-sm">
                        {previewMutation.data.hasMnemonic && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Frase mnemônica detectada</span>
                          </div>
                        )}
                        {previewMutation.data.hasXprv && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Chave privada estendida (xprv) detectada</span>
                          </div>
                        )}
                        {previewMutation.data.hasXpub && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Chave pública estendida (xpub) detectada</span>
                          </div>
                        )}
                      </div>

                      {/* Errors */}
                      {previewMutation.data.errors.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-100 mb-2">
                            Erros encontrados:
                          </p>
                          <ul className="space-y-1">
                            {previewMutation.data.errors.map((error, idx) => (
                              <li key={idx} className="text-xs text-red-700 dark:text-red-200">
                                • {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Import Form */}
            {fileContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Importação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="import-wallet-name">Nome da Carteira</Label>
                    <Input
                      id="import-wallet-name"
                      placeholder="Minha Carteira Importada"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import-password">Senha de Proteção</Label>
                    <Input
                      id="import-password"
                      type="password"
                      placeholder="Senha forte (mín. 8 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={importMutation.isPending || !previewMutation.data?.isValid}
                    className="w-full"
                  >
                    {importMutation.isPending ? (
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formatos Suportados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">📄 TXT</p>
                  <p className="text-xs text-muted-foreground">
                    Arquivo de texto simples com endereços e chaves privadas
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">📋 JSON</p>
                  <p className="text-xs text-muted-foreground">
                    Arquivos JSON de carteiras (Exodus, MetaMask, etc)
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">💾 DAT</p>
                  <p className="text-xs text-muted-foreground">
                    Arquivos wallet.dat do Bitcoin Core
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-xs">
                  ✓ Todos os dados são criptografados com AES-256-CBC
                </p>
                <p className="text-xs">
                  ✓ Chaves privadas nunca são transmitidas em texto plano
                </p>
                <p className="text-xs">
                  ✓ Arquivos são processados apenas no servidor
                </p>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Como Usar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600">1</span>
                  <p>Selecione um arquivo de carteira</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600">2</span>
                  <p>Revise os dados na visualização</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600">3</span>
                  <p>Digite um nome e senha para a carteira</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-blue-600">4</span>
                  <p>Clique em "Importar Carteira"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
