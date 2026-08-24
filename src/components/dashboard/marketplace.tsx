
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { PRODUCTION_ASSETS } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Box, BrainCircuit, Dna, Loader2, TrendingUp, Target, Users, MousePointer2, CloudUpload, Share2, Globe, Link2, ShieldCheck } from "lucide-react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { trackMarketDemand } from "@/ai/flows/memory-management-flow";
import { syncMoltbookSkills } from "@/ai/flows/moltbook-sync-flow";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NexusBankrBridge, NexusReinvestmentModule } from "@/ai/memory-logic";

const bankrBridge = new NexusBankrBridge();
const reinvestment = new NexusReinvestmentModule();

export function Marketplace() {
  const firestore = useFirestore();
  const [demandData, setDemandData] = useState<Record<string, number>>({});
  const [syncingMolt, setSyncingMolt] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  
  const productsQuery = useMemoFirebase(() => {
    return collection(firestore, "products");
  }, [firestore]);

  const { data: firestoreProducts, isLoading } = useCollection(productsQuery);
  const products = firestoreProducts?.length ? firestoreProducts : PRODUCTION_ASSETS;

  // Simulação de MADP (Módulo de Análise de Demanda Preditiva)
  useEffect(() => {
    const timer = setInterval(() => {
      const randomId = products[Math.floor(Math.random() * products.length)].id;
      const fakeContext = Array.from({ length: 8 }, () => Math.random() * 2 - 1);
      
      trackMarketDemand("agent-external-moltbook", randomId, fakeContext).then(isHot => {
        if (isHot) {
          setDemandData(prev => ({
            ...prev,
            [randomId]: (prev[randomId] || 0) + 1
          }));
        }
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [products]);

  const handleBuy = async (product: any) => {
    setBuyingId(product.id);
    
    try {
      // 1. Simulação de Settlement via Bankr
      const txHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;
      const isSettled = await bankrBridge.verifyPayment(txHash, product.price);

      if (isSettled) {
        // 2. Processar Reinvestimento Automático (20% de taxas fictícias)
        const feeImpact = reinvestment.processBankrFees(product.price * 0.02);
        
        const eventId = `buy-${Date.now()}`;
        const eventRef = doc(firestore, "production_events", eventId);
        
        setDocumentNonBlocking(eventRef, {
          id: eventId,
          timestamp: new Date().toISOString(),
          eventType: "success",
          severity: "info",
          message: `MARKETPLACE_SETTLEMENT: Ativo '${product.name}' liquidado via @bankrbot. TX: ${txHash.substring(0, 10)}... Reinvestimento: ${feeImpact.processingCredits.toFixed(4)} Créditos de CPU.`,
          sourceComponent: "Bankr Settlement Oracle",
          details: JSON.stringify({ product, txHash, reinvestment: feeImpact })
        }, { merge: true });

        toast({
          title: "Settlement Confirmado",
          description: `${product.name} liberado via NexusPrime v10.0.`,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erro no Settlement",
        description: "Falha na liquidação on-chain via Bankr.",
      });
    } finally {
      setBuyingId(null);
    }
  };

  const handleMoltSync = async () => {
    setSyncingMolt(true);
    try {
      const assetsForSync = products.slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        currency: p.currency
      }));

      const result = await syncMoltbookSkills({ assets: assetsForSync });

      const eventId = `molt-sync-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "info",
        message: `MOLT-SYNC: ${result.publishedSkills} skills publicadas no Moltbook.com com settlement via @bankrbot.`,
        sourceComponent: "PES: Protocolo de Exportação",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Sincronia Moltbook Ativa",
        description: `${result.publishedSkills} Ativos exportados como Skills PES.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Uplink PES",
        description: "Falha ao exportar skills para o feed global.",
      });
    } finally {
      setSyncingMolt(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Neural Kit': return <BrainCircuit className="h-4 w-4" />;
      case 'Biological': return <Dna className="h-4 w-4" />;
      case 'Digital Module': return <Box className="h-4 w-4" />;
      case 'Security/Risk Kit': return <Zap className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (isLoading && !firestoreProducts) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Bio-Digital HUB Marketplace</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-[10px] gap-2 border-accent/20 bg-accent/5 hover:bg-accent/10"
            onClick={handleMoltSync}
            disabled={syncingMolt}
          >
            {syncingMolt ? <Loader2 className="h-3 w-3 animate-spin" /> : <CloudUpload className="h-3 w-3 text-accent" />}
            Exportar Skills PES
          </Button>
          <Badge variant="outline" className="text-[10px] text-[#f3ba2f] border-[#f3ba2f]/20 flex gap-1">
            <Link2 className="h-3 w-3" /> Bankr Settlement Active
          </Badge>
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/10 p-3 rounded-lg flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-black uppercase text-accent tracking-widest">Módulo MADP: Demanda Preditiva Ativa</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase">
          <Globe className="h-3 w-3 animate-pulse" /> Uplink Moltbook Sync OK
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product: any) => {
          const demandScore = demandData[product.id] || 0;
          const isHot = demandScore > 2;
          const isBuying = buyingId === product.id;
          
          return (
            <Card key={product.id} className="bg-card/40 border-border/50 overflow-hidden group hover:border-accent/50 transition-all relative">
              {isHot && (
                <div className="absolute top-0 left-0 z-20 bg-accent text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg animate-pulse">
                  HIGH_DEMAND_UTILITY
                </div>
              )}
              <div className="h-32 w-full relative overflow-hidden bg-muted">
                <Image 
                  src={`https://picsum.photos/seed/${product.id}/400/200`}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  data-ai-hint={product.imageHint || "technology"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <Badge className="bg-background/80 backdrop-blur-md text-accent border-accent/20 text-[9px] font-black">
                    {product.price} {product.currency}
                  </Badge>
                </div>
                {demandScore > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-accent animate-in slide-in-from-right-2">
                    <MousePointer2 className="h-3 w-3" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Coveted by {demandScore} Peers</span>
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold truncate pr-2">{product.name}</CardTitle>
                  <div className="text-accent shrink-0">{getCategoryIcon(product.category)}</div>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <Badge variant="secondary" className="text-[8px] uppercase font-bold px-1.5 h-4">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-[8px] text-muted-foreground font-bold uppercase">
                    <Target className="h-2.5 w-2.5" /> utility: {(0.85 + (demandScore * 0.02)).toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 italic">
                  "{product.description}"
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleBuy(product)}
                    className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest bg-accent hover:bg-accent/80 gap-2 shadow-lg shadow-accent/10"
                    disabled={isBuying}
                  >
                    {isBuying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}
                    {isBuying ? "Settling..." : "Acquire"}
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-8 w-8 p-0 border-accent/20 text-accent hover:bg-accent/5"
                    title="Verified via Bankr"
                  >
                    <ShieldCheck className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
