import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Share2, ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Marketplace() {
  const [marketplace, setMarketplace] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const { data: products, isLoading, refetch } = trpc.marketplace.getProducts.useQuery({ marketplace: marketplace || undefined });
  const { data: userFavorites } = trpc.marketplace.getUserFavorites.useQuery();
  const toggleFavoriteMutation = trpc.marketplace.toggleFavorite.useMutation();

  useEffect(() => {
    if (userFavorites) {
      setFavorites(userFavorites);
    }
  }, [userFavorites]);

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (productId: number) => {
    await toggleFavoriteMutation.mutateAsync({ productId });
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted mt-1">Explore produtos e ganhe comissões</p>
        </div>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">
              Filtrar por marketplace
            </label>
            <Select value={marketplace} onValueChange={setMarketplace}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os marketplaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os marketplaces</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="shopee">Shopee</SelectItem>
                <SelectItem value="mercado-livre">Mercado Livre</SelectItem>
                <SelectItem value="aliexpress">AliExpress</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setMarketplace("")} variant="outline" className="mt-6">
            Limpar
          </Button>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors">
              {/* Product Image */}
              <div className="h-48 bg-background flex items-center justify-center border-b border-border">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-12 h-12 text-muted" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted capitalize">{product.marketplace}</p>
                  <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">
                    R$ {typeof product.price === 'string' ? product.price : product.price.toFixed(2)}
                  </p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {typeof product.commissionRate === 'string' ? product.commissionRate : product.commissionRate.toFixed(0)}% comissão
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs text-muted line-clamp-2">{product.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleFavorite(product.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 mr-2 ${favorites.includes(product.id) ? 'fill-current text-red-500' : ''}`}
                    />
                    {favorites.includes(product.id) ? "Favorito" : "Favoritar"}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
