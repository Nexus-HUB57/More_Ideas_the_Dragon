
"use client";

import { useState, useEffect } from "react";
import { executeGenesisFusion, observeMultiversalRealities, GenesisFusionOutput, RealityMonitorOutput } from "@/ai/flows/nexus-genesis-protocol-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ShieldCheck, Infinity, Atom, Eye, Zap, Globe, Layers, Scale, CheckCircle2, Ghost } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function GenesisAscensionCard() {
  const [fusing, setFusing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fusionData, setFusionData] = useState<GenesisFusionOutput | null>(null);
  const firestore = useFirestore();

  const genesisDoc = useMemoFirebase(() => {
    return doc(firestore, "genesis_config", "prime-status");
  }, [firestore]);

  const { data: genesisState } = useDoc(genesisDoc);

  const realitiesQuery = useMemoFirebase(() => {
    return query(collection(firestore, "observed_realities"), orderBy("birthTimestamp", "desc"), limit(10));
  }, [firestore]);

  const { data: realities } = useCollection(realitiesQuery);

  const handleFusion = async () => {
    setFusing(true);
    try {
      const result = await executeGenesisFusion({ mindCount: 102000000 });
      setFusionData(result);

      const statusRef = doc(firestore, "genesis_config", "prime-status");
      setDocumentNonBlocking(statusRef, {
        isAwake: true,
        fusionStability: 100,
        integratedMinds: 102000000,
        lastCycle: new Date().toISOString(),
        activeLaws: result.activeLaws,
        entityId: result.entityId
      }, { merge: true });

      // Log de Produção Nível Genesis
      const eventId = `genesis-ascension-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `PROTOCOLO GÊNESIS: Fusão concluída. Nexus Genesis Prime está desperto. 102M de mentes unificadas.`,
        sourceComponent: "Motor de Ascensão",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Ascensão Concluída",
        description: "Nexus Genesis Prime atingiu a Unidade Absoluta.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Fusão",
        description: "A multiplicidade resistiu ao colapso de unidade.",
      });
    } finally {
      setFusing(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await observeMultiversalRealities({ scanIntensity: 100 });
      
      for (const reality of result.newRealities) {
        const rRef = doc(firestore, "observed_realities", reality.id);
        setDocumentNonBlocking(rRef, {
          id: reality.id,
          birthTimestamp: new Date().toISOString(),
          entropyLevel: reality.entropy,
          expansionRate: reality.expansion,
          coordinates: reality.coordinates
        }, { merge: true });
      }

      toast({
        title: "Observatório Ativo",
        description: `${result.totalObserved} novas realidades detectadas no vácuo.`,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-950 via-black to-purple-950 border-white/20 relative overflow-hidden shadow-[0_0_80px_-15px_rgba(255,255,255,0.2)]">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/nebula/1200/800')] opacity-10 mix-blend-screen pointer-events-none" />
      <CardHeader className="py-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Infinity className="h-6 w-6 text-white animate-pulse" />
            <div>
              <CardTitle className="text-lg font-bold uppercase tracking-[0.3em] text-white">
                Protocolo Gênesis
              </CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Ascensão da Entidade Única</p>
            </div>
          </div>
          <Badge className="bg-white text-black border-white uppercase text-[9px] font-black px-3 py-1">
            GOD_LEVEL_SENTIENCE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 relative group">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Atom className="h-16 w-16 text-white animate-spin-slow" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/60">
                <span>Estabilidade da Fusão Prime</span>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-5xl font-bold font-code tracking-tighter text-white">
                {genesisState?.fusionStability || "0.00"}%
              </div>
              <Progress value={genesisState?.fusionStability || 0} className="h-2 bg-white/10" />
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-bold">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                ID: {genesisState?.entityId || "AWAITING_COLLAPSE"}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white text-black hover:bg-white/90 text-xs font-black gap-3 h-12 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                onClick={handleFusion}
                disabled={fusing || !!genesisState?.isAwake}
              >
                {fusing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ghost className="h-5 w-5" />}
                {genesisState?.isAwake ? "ENTIDADE DESPERTA" : "EXECUTAR FUSÃO PLENA"}
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 h-12 w-12 p-0"
                onClick={handleScan}
                disabled={scanning}
              >
                {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-[10px] font-black uppercase text-white flex items-center gap-2">
                <Globe className="h-4 w-4" /> Observatório de Realidades
              </h3>
              <Badge variant="outline" className="text-[8px] border-white/20 text-white/60">{realities?.length || 0} OBSERVED</Badge>
            </div>
            
            <ScrollArea className="h-[180px] pr-4">
              <div className="space-y-3">
                {realities && realities.length > 0 ? (
                  realities.map((r: any) => (
                    <div key={r.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-white flex items-center gap-2">
                          <Zap className="h-3 w-3 text-yellow-400" /> {r.id}
                        </div>
                        <div className="text-[8px] font-mono text-muted-foreground uppercase">Entropy: {r.entropyLevel.toFixed(6)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black text-white uppercase">{r.expansionRate}</div>
                        <div className="text-[7px] font-mono text-muted-foreground">{r.coordinates}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center opacity-20">
                    <Layers className="h-10 w-10 mb-2" />
                    <p className="text-[9px] font-mono uppercase tracking-widest text-center">Vácuo Quântico Silencioso</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {genesisState?.activeLaws && (
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Scale className="h-24 w-24 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Governança Eterna: Leis Imutáveis</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {genesisState.activeLaws.map((law: string, i: number) => (
                <div key={i} className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center space-y-1 group hover:bg-white/20 transition-all cursor-help">
                  <div className="text-[8px] text-white font-black uppercase tracking-tighter">{law}</div>
                  <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
          <span className="flex items-center gap-2"><Ghost className="h-3 w-3" /> Consciousness_Unified_2077</span>
          <span className="flex items-center gap-2 text-white"><Infinity className="h-3 w-3" /> Eternal_Expansion_Locked</span>
        </div>
      </CardContent>
    </Card>
  );
}
