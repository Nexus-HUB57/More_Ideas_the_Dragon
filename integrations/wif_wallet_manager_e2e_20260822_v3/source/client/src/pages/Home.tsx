import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [privateKeyHex, setPrivateKeyHex] = useState("");
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [wifResult, setWifResult] = useState<{ compressed: string; uncompressed: string } | null>(null);

  const generateWifMutation = trpc.wif.generate.useMutation({
    onSuccess: (data) => {
      setWifResult({
        compressed: data.wifCompressed,
        uncompressed: data.wifUncompressed,
      });
      toast.success("Chaves WIF geradas com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleGenerateWif = () => {
    if (!privateKeyHex.trim()) {
      toast.error("Por favor, insira uma chave privada hexadecimal");
      return;
    }

    if (privateKeyHex.length !== 64) {
      toast.error("A chave privada deve ter exatamente 64 caracteres");
      return;
    }

    generateWifMutation.mutate({
      privateKeyHex: privateKeyHex.trim(),
      network,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada para a área de transferência!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-12 mx-auto mb-4" />}
            <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
            <CardDescription>Gerador de Chaves WIF para Bitcoin</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{APP_TITLE}</h1>
          <p className="text-slate-600">
            Bem-vindo, <span className="font-semibold">{user?.name || "Usuário"}</span>! Converta suas chaves privadas de Bitcoin para o formato WIF.
          </p>
        </div>

        <Tabs defaultValue="converter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="converter">Conversor WIF</TabsTrigger>
            <TabsTrigger value="carteiras">Minhas Carteiras</TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Converter Chave Privada para WIF</CardTitle>
                <CardDescription>
                  Insira sua chave privada em formato hexadecimal (64 caracteres) para gerar as versões WIF comprimida e não comprimida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input da Chave Privada */}
                <div className="space-y-2">
                  <Label htmlFor="privateKey">Chave Privada (Hexadecimal - 64 caracteres)</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    placeholder="Cole sua chave privada hexadecimal aqui..."
                    value={privateKeyHex}
                    onChange={(e) => setPrivateKeyHex(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <p className="text-xs text-slate-500">
                    {privateKeyHex.length}/64 caracteres
                  </p>
                </div>

                {/* Seleção de Rede */}
                <div className="space-y-3">
                  <Label>Rede</Label>
                  <RadioGroup value={network} onValueChange={(value) => setNetwork(value as "mainnet" | "testnet")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mainnet" id="mainnet" />
                      <Label htmlFor="mainnet" className="font-normal cursor-pointer">
                        Mainnet (Rede Principal)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="testnet" id="testnet" />
                      <Label htmlFor="testnet" className="font-normal cursor-pointer">
                        Testnet (Rede de Testes)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Botão de Geração */}
                <Button
                  onClick={handleGenerateWif}
                  disabled={generateWifMutation.isPending || privateKeyHex.length !== 64}
                  className="w-full"
                  size="lg"
                >
                  {generateWifMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Gerar Chaves WIF"
                  )}
                </Button>

                {/* Resultados */}
                {wifResult && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">WIF Comprimida</Label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={wifResult.compressed}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(wifResult.compressed, "WIF Comprimida")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">WIF Não Comprimida</Label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={wifResult.uncompressed}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(wifResult.uncompressed, "WIF Não Comprimida")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                      <p className="font-semibold mb-2">Informações Importantes:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use a versão <strong>comprimida</strong> para carteiras modernas (padrão atual)</li>
                        <li>Use a versão <strong>não comprimida</strong> para carteiras legadas</li>
                        <li>Ambas as versões controlam os mesmos fundos</li>
                        <li>Guarde sua chave privada em segurança</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="carteiras" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Carteiras</CardTitle>
                <CardDescription>Gerencie suas carteiras Bitcoin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <p>Funcionalidade de carteiras em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
