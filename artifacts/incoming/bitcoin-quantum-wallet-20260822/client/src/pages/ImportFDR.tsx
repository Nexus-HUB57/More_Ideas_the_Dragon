import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CheckCircle,
  FileUp,
  Loader2,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Import FDR (Fundo Descentralizado Gênesis) Page
 * Allows users to import the decentralized fund with 423,190+ address/key pairs
 */
export default function ImportFDR() {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [fdrPassphrase, setFdrPassphrase] = useState("[REDACTED: use a runtime secret outside version control]");
  const [preview, setPreview] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);

  // Queries
  const previewQuery = trpc.fdr.previewFDRData.useQuery(
    {
      filename: selectedFile?.name || "",
      fileContent: fileContent,
    },
    {
      enabled: !!selectedFile && !!fileContent,
    }
  );

  // Mutations
  const importMutation = trpc.fdr.importFDRMasterWallet.useMutation({
    onSuccess: (data) => {
      toast.success(
        `FDR importada com sucesso! ${data.importedCount} endereços importados.`
      );
      setShowReport(true);
      // Reset form
      setSelectedFile(null);
      setFileContent("");
      setMasterPassword("");
      // Invalidate queries
      trpc.useUtils().fdr.getFDRStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 500MB for FDR)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 500MB.");
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
    if (!selectedFile || !masterPassword || !fileContent) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    importMutation.mutate({
      filename: selectedFile.name,
      fileContent: fileContent,
      masterPassword: masterPassword,
      fdrPassphrase: fdrPassphrase,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground">
              Por favor, faça login para importar o FDR
            </p>
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
            <Shield className="h-12 w-12 text-purple-600" />
            Importar Fundo Gênesis (FDR)
          </h1>
          <p className="text-muted-foreground text-lg">
            Fundo Descentralizado Gênesis - 423.190+ endereços Bitcoin
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Aviso Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  Este é um arquivo sensível contendo 423.190+ pares de endereço/chave privada.
                </p>
                <p>
                  ✓ Todos os dados serão criptografados com AES-256-GCM
                </p>
                <p>
                  ✓ Chaves privadas serão protegidas com a passphrase do FDR
                </p>
                <p>
                  ✓ Mantenha este arquivo em local seguro
                </p>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Arquivo FDR</CardTitle>
                <CardDescription>
                  Escolha o arquivo CSV ou JSON do Fundo Gênesis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fdr-file-input"
                  />
                  <label htmlFor="fdr-file-input" className="cursor-pointer block">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-semibold mb-1">
                      {selectedFile ? selectedFile.name : "Clique ou arraste um arquivo"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Formatos suportados: CSV, JSON (máximo 500MB)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Arquivo Selecionado:</p>
                    <p className="font-mono text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Card */}
            {fileContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Visualização do FDR</CardTitle>
                  <CardDescription>
                    Dados detectados no arquivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : previewQuery.data ? (
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-2 p-3 rounded">
                        {previewQuery.data.isValid ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600">
                              Arquivo válido
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-600">
                              Arquivo inválido
                            </span>
                          </>
                        )}
                      </div>

                      {/* Data Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <p className="text-xs text-muted-foreground mb-1">
                            Total de Pares
                          </p>
                          <p className="text-2xl font-bold">
                            {previewQuery.data.totalPairs.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <p className="text-xs text-muted-foreground mb-1">
                            Pares Válidos
                          </p>
                          <p className="text-2xl font-bold">
                            {previewQuery.data.validPairs.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                          <p className="text-xs text-muted-foreground mb-1">
                            Taxa de Validação
                          </p>
                          <p className="text-2xl font-bold">
                            {previewQuery.data.preview.validationRate}%
                          </p>
                        </div>
                      </div>

                      {/* Duplicates */}
                      {previewQuery.data.duplicates > 0 && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-100">
                            ⚠ {previewQuery.data.duplicates.toLocaleString()} duplicatas
                            serão removidas
                          </p>
                        </div>
                      )}

                      {/* Errors */}
                      {previewQuery.data.errors.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-100 mb-2">
                            Erros encontrados:
                          </p>
                          <ul className="space-y-1">
                            {previewQuery.data.errors.map((error, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-red-700 dark:text-red-200"
                              >
                                • {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sample Addresses */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                        <p className="text-sm font-semibold mb-2">
                          Amostra de Endereços (primeiros 5):
                        </p>
                        <ul className="space-y-1">
                          {previewQuery.data.preview.firstAddresses.slice(0, 5).map((addr, idx) => (
                            <li key={idx} className="text-xs font-mono text-muted-foreground">
                              {idx + 1}. {addr}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Import Form */}
            {fileContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Importação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="master-password">
                      Senha Mestre de Proteção
                    </Label>
                    <Input
                      id="master-password"
                      type="password"
                      placeholder="Senha forte (mín. 8 caracteres)"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fdr-passphrase">
                      Passphrase do FDR
                    </Label>
                    <Input
                      id="fdr-passphrase"
                      type="password"
                      placeholder="Passphrase do FDR"
                      value={fdrPassphrase}
                      onChange={(e) => setFdrPassphrase(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Padrão: [REDACTED: use a runtime secret outside version control]
                    </p>
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={
                      importMutation.isPending || !previewQuery.data?.isValid
                    }
                    className="w-full"
                    size="lg"
                  >
                    {importMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando FDR...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Fundo Gênesis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Report */}
            {showReport && importMutation.data && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Importação Concluída
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total de Pares</p>
                      <p className="text-xl font-bold">
                        {importMutation.data.totalPairs.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pares Importados</p>
                      <p className="text-xl font-bold">
                        {importMutation.data.importedCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-auto max-h-64">
                    {importMutation.data.report}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* FDR Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sobre o FDR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">📊 Estatísticas</p>
                  <p className="text-xs text-muted-foreground">
                    423.190 pares de endereço/chave privada
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">🔐 Protocolo</p>
                  <p className="text-xs text-muted-foreground">
                    CAISK - AES-256-GCM + PBKDF2
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">🎯 Propósito</p>
                  <p className="text-xs text-muted-foreground">
                    Fundo Descentralizado Gênesis para gerenciamento centralizado
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-xs">
                  ✓ Criptografia AES-256-GCM
                </p>
                <p className="text-xs">
                  ✓ PBKDF2 com 100.000 iterações
                </p>
                <p className="text-xs">
                  ✓ Salt de 128 bits
                </p>
                <p className="text-xs">
                  ✓ Chaves privadas protegidas
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
                  <span className="font-bold text-purple-600">1</span>
                  <p>Selecione o arquivo CSV ou JSON do FDR</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-purple-600">2</span>
                  <p>Revise os dados na visualização</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-purple-600">3</span>
                  <p>Digite a senha mestre e passphrase</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-purple-600">4</span>
                  <p>Clique em "Importar Fundo Gênesis"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
