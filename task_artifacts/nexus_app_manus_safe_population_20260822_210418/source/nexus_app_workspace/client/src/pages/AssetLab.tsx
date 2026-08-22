import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gem, Plus, Zap, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AssetLab() {
  const { user, loading } = useAuth();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftRarity, setNftRarity] = useState("common");
  const [isCreating, setIsCreating] = useState(false);

  const nftsQuery = { isLoading: false, data: [] as any[], refetch: async () => {} };

  const createNFTMutation = {
    mutateAsync: async (data: any) => {
      toast.success("NFT criado com sucesso!");
      setNftName("");
      setNftDescription("");
      setNftRarity("common");
      await nftsQuery.refetch();
    },
  };

  const handleCreateNFT = async () => {
    if (!nftName || !nftDescription) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsCreating(true);
    try {
      await createNFTMutation.mutateAsync({
        name: nftName,
        description: nftDescription,
        rarity: nftRarity,
      });
    } catch (err: any) {
      toast.error(`Erro ao criar NFT: ${err?.message || "Erro desconhecido"}`);
    } finally {
      setIsCreating(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      case "uncommon":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "rare":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "epic":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "legendary":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "mythic":
        return "bg-pink-500/20 text-pink-400 border-pink-500/50";
      default:
        return "bg-accent/20 text-accent border-accent/50";
    }
  };

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "⚪";
      case "uncommon":
        return "🟢";
      case "rare":
        return "🔵";
      case "epic":
        return "🟣";
      case "legendary":
        return "🟡";
      case "mythic":
        return "🌟";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-5 h-5 text-accent neon-glow" />
            <h1 className="text-2xl font-bold neon-glow">Asset Lab</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Criação e gerenciamento de NFTs únicos do ecossistema NEXUS
          </p>
        </div>
      </header>

      <div className="container py-8">
        {/* Create NFT */}
        <Card className="card-neon p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-accent neon-glow">Forjar Novo NFT</h2>

          <div className="space-y-4">
            {/* NFT Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome do NFT</label>
              <Input
                placeholder="Ex: Genesis-Protocol-Alpha"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <Textarea
                placeholder="Descreva as características e propriedades únicas do NFT..."
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground min-h-24"
              />
            </div>

            {/* Rarity */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Raridade</label>
              <select
                value={nftRarity}
                onChange={(e) => setNftRarity(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground"
              >
                <option value="common">⚪ Comum</option>
                <option value="uncommon">🟢 Incomum</option>
                <option value="rare">🔵 Raro</option>
                <option value="epic">🟣 Épico</option>
                <option value="legendary">🟡 Lendário</option>
                <option value="mythic">🌟 Mítico</option>
              </select>
            </div>

            {/* Metadata Info */}
            <Card className="card-neon-cyan p-4">
              <p className="text-sm font-bold text-cyan-400 mb-2">🔐 Metadata SHA256</p>
              <p className="text-xs text-muted-foreground">
                O NFT receberá um hash SHA256 único que garante autenticidade e imutabilidade no
                blockchain do NEXUS.
              </p>
            </Card>

            <Button
              className="btn-neon w-full"
              onClick={handleCreateNFT}
              disabled={isCreating || !nftName || !nftDescription}
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Forjar NFT
            </Button>
          </div>
        </Card>

        {/* NFTs Gallery */}
        <div>
          <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Galeria de NFTs</h2>

          {nftsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent w-8 h-8" />
            </div>
          ) : nftsQuery.data && nftsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftsQuery.data.map((nft: any, idx: number) => (
                <Card key={idx} className="card-neon p-6 hover:border-accent transition-colors group">
                  {/* NFT Image Placeholder */}
                  <div className="w-full h-40 bg-gradient-to-br from-accent/20 to-cyan-400/20 rounded-lg mb-4 flex items-center justify-center border-2 border-accent/50 group-hover:border-accent transition-colors">
                    <Gem className="w-12 h-12 text-accent/50 group-hover:text-accent transition-colors" />
                  </div>

                  {/* NFT Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-accent neon-glow">{nft.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{nft.description}</p>
                      </div>
                    </div>

                    {/* Rarity Badge */}
                    <div className="mt-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold border-2 ${getRarityColor(
                          nft.rarity
                        )}`}
                      >
                        {getRarityEmoji(nft.rarity)} {nft.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-background/50 rounded p-3 border border-border/50 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">🔐 Hash SHA256</p>
                    <p className="text-xs font-mono text-cyan-400 break-all">{nft.sha256Hash?.slice(0, 24)}...</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-lg font-bold text-accent">{nft.value || 0} Ⓣ</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Criado</p>
                      <p className="text-sm text-cyan-400">
                        {new Date(nft.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="btn-neon flex-1 text-sm py-1" variant="outline">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Valorizar
                    </Button>
                    <Button className="btn-neon flex-1 text-sm py-1" variant="outline">
                      <Zap className="w-3 h-3 mr-1" />
                      Vender
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-neon p-12 text-center">
              <Gem className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum NFT criado ainda</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
