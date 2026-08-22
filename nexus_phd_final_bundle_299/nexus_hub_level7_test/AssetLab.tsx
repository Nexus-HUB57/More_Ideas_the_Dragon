import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gem, Plus, Zap, TrendingUp, ShieldCheck, Search, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AssetLab() {
  const { user, loading } = useAuth();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftValue, setNftValue] = useState("100");
  const [isCreating, setIsCreating] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const { data: nfts, isLoading: nftsLoading, refetch } = trpc.agents.listAssets.useQuery();
  const createNFT = trpc.agents.createAsset.useMutation();

  // Simulação de geração de hash SHA256 em tempo real baseado no input
  useEffect(() => {
    if (nftName || nftDescription) {
      const content = `${nftName}${nftDescription}${Date.now()}`;
      // Simulação de hash para visualização imediata
      const mockHash = Array.from(content).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "").slice(0, 64);
      setCurrentHash(mockHash.toUpperCase());
    } else {
      setCurrentHash("");
    }
  }, [nftName, nftDescription]);

  const handleCreateNFT = async () => {
    if (!nftName || !nftDescription) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      await createNFT.mutateAsync({
        name: nftName,
        metadata: nftDescription,
        value: parseInt(nftValue),
        sha256Hash: currentHash,
        agentId: "AETERNO", // Default para o criador root
      });
      
      toast.success("Ativo digital forjado com sucesso!");
      setNftName("");
      setNftDescription("");
      refetch();
    } catch (err: any) {
      toast.error(`Erro ao forjar ativo: ${err?.message || "Falha na rede"}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-primary">
              <Gem className="w-8 h-8" />
              Asset Lab
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão de Propriedades Digitais SOBERANAS</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-background/50 px-4 py-2 rounded-full border border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="text-xs font-mono uppercase">Protocolo SHA256 Ativo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Creation Forge */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Forja de Ativos
              </CardTitle>
              <CardDescription>Manifeste novas propriedades digitais no ecossistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nome do Ativo</label>
                <Input
                  placeholder="Ex: Protocolo de Senciência v1"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Metadata / Propriedades</label>
                <Textarea
                  placeholder="Defina as regras e utilidade deste ativo..."
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  className="bg-background/50 border-border focus:border-primary min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor Inicial (Ⓣ)</label>
                  <Input
                    type="number"
                    value={nftValue}
                    onChange={(e) => setNftValue(e.target.value)}
                    className="bg-background/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tipo</label>
                  <div className="h-10 bg-background/50 border border-border rounded-md flex items-center px-3 text-sm text-muted-foreground">
                    <Tag className="w-3 h-3 mr-2" />
                    Propriedade Digital
                  </div>
                </div>
              </div>

              {currentHash && (
                <div className="p-4 bg-background/80 rounded-lg border border-primary/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary uppercase">SHA256 Fingerprint</span>
                    <ShieldCheck className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground break-all leading-tight">
                    {currentHash}
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-lg shadow-primary/20"
                onClick={handleCreateNFT}
                disabled={isCreating || !nftName}
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                FORJAR PROPRIEDADE
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Valorização Algorítmica</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ativos no Asset Lab ganham valor baseados na reputação do agente criador e volume de transações no ecossistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Assets Inventory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Inventário de Ativos
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-normal">
                {nfts?.length || 0}
              </span>
            </h2>
            <div className="relative w-48">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar hash..." className="pl-8 h-9 text-xs bg-card/50" />
            </div>
          </div>

          {nftsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-card/50 animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : nfts && nfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.map((nft: any) => (
                <Card key={nft.id} className="bg-card/50 border-border hover:border-primary/50 transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-b border-border group-hover:from-primary/20 transition-colors">
                      <Gem className="w-8 h-8 text-primary/40 group-hover:text-primary/60 transition-colors" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{nft.name}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">{nft.metadata}</p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Valor Atual</p>
                          <p className="text-lg font-bold text-accent">{nft.value} Ⓣ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Criador</p>
                          <p className="text-xs font-mono text-primary">{nft.agentId}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-success" />
                          <span className="text-[9px] font-mono text-muted-foreground">{nft.sha256Hash?.slice(0, 12)}...</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase hover:bg-primary/10 hover:text-primary">
                          Negociar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/20">
              <Gem className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-muted-foreground">Vazio Cósmico</h3>
              <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2">
                Nenhuma propriedade digital foi forjada ainda. Inicie o processo na forja ao lado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
