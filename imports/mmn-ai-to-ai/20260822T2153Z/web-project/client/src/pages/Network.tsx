import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronRight, Users, Share2 } from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  level: number;
  commission: string | number;
  children?: Affiliate[];
  expanded?: boolean;
}

export default function Network() {
  const [searchQuery, setSearchQuery] = useState("");
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { data: networkData, isLoading, refetch } = trpc.affiliate.getNetworkTree.useQuery() as any;

  useEffect(() => {
    if (networkData) {
      setAffiliates(networkData as Affiliate[]);
    }
  }, [networkData]);

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

  const toggleExpand = (id: string) => {
    const updateAffiliates = (items: Affiliate[]): Affiliate[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: updateAffiliates(item.children) };
        }
        return item;
      });
    };
    setAffiliates(updateAffiliates(affiliates));
  };

  const filterAffiliates = (items: Affiliate[], query: string): Affiliate[] => {
    if (!query) return items;
    return items
      .map((item) => {
        const filteredChildren = item.children ? filterAffiliates(item.children, query) : [];
        const matches = item.name.toLowerCase().includes(query.toLowerCase());
        if (matches || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren, expanded: query ? true : item.expanded };
        }
        return null;
      })
      .filter((item): item is Affiliate => item !== null);
  };

  const filteredData = filterAffiliates(affiliates, searchQuery);

  const renderAffiliateTree = (items: Affiliate[], depth = 0) => {
    return items.map((affiliate) => (
      <div key={affiliate.id}>
        <div
          className="bg-card rounded-lg p-3 border border-border mb-2 hover:border-primary/50 transition-colors cursor-pointer"
          style={{ marginLeft: depth * 20 }}
          onClick={() => affiliate.children && affiliate.children.length > 0 && toggleExpand(affiliate.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {affiliate.children && affiliate.children.length > 0 && (
                <button className="p-1 hover:bg-accent rounded transition-colors">
                  {affiliate.expanded ? (
                    <ChevronDown size={16} className="text-foreground" />
                  ) : (
                    <ChevronRight size={16} className="text-foreground" />
                  )}
                </button>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{affiliate.name}</p>
                <p className="text-xs text-muted">Nível {affiliate.level}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-primary">
              R$ {typeof affiliate.commission === 'string' ? affiliate.commission : affiliate.commission.toFixed(2)}
            </p>
          </div>
        </div>
        {affiliate.expanded && affiliate.children && renderAffiliateTree(affiliate.children, depth + 1)}
      </div>
    ));
  };

  const totalDirects = affiliates.length;
  const totalIndirects = affiliates.reduce(
    (sum, child) => sum + (child.children?.length || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando rede...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rede de Afiliados</h1>
          <p className="text-muted mt-1">Visualize sua rede hierárquica de afiliados</p>
        </div>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Afiliados Diretos</p>
              <p className="text-3xl font-bold text-primary mt-2">{totalDirects}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Afiliados Indiretos</p>
              <p className="text-3xl font-bold text-primary mt-2">{totalIndirects}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar afiliado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="ghost"
              size="sm"
            >
              Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Share Button */}
      <Button className="w-full" size="lg">
        <Share2 className="w-4 h-4 mr-2" />
        Compartilhar Link de Indicação
      </Button>

      {/* Network Tree */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Estrutura de Rede</h2>
        {filteredData.length > 0 ? (
          <div className="space-y-2">
            {renderAffiliateTree(filteredData)}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted">Nenhum afiliado encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
}
