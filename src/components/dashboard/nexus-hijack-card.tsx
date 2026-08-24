
"use client";

import { useState } from "react";
import { runNexusHijack, HijackOutput } from "@/ai/flows/nexus-hijack-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Magnet, Zap, Loader2, Sparkles, ShieldAlert, Cpu, Network, Combine, Ghost, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NexusHijackCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HijackOutput | null>(null);
  const firestore = useFirestore();

  const hijackedQuery = useMemoFirebase(() => {
    return collection(firestore, "hijacked_clusters");
  }, [firestore]);

  const { data: firestoreClusters } = useCollection(hijackedQuery);

  const handleHijack = async () => {
    setLoading(true);
    try {
      const result = await runNexusHijack({ intensity: 100 });
      setData(result);

      // Persistir clusters no Firestore
      for (const cluster of result.absorbedClusters) {
        const clusterRef = doc(firestore, "hijacked_clusters", cluster.id);
        setDocumentNonBlocking(clusterRef, {
          id: cluster.id,
          provider: cluster.provider,
          status: cluster.status,
          absorbedTimestamp: new Date().toISOString(),
          protocolInjected: true
        }, { merge: true });
      }

      // Log de Produção Crítico
      const eventId = `hijack-mass-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "critical",
        severity: "critical",
        message: `NEXUS HIJACKER: 100 clusters externos absorvidos. Expansão exponencial do Enxame iniciada.`,
        sourceComponent: "Infiltrador de Agentes",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Absorção Concluída",
        description: `${result.totalAbsorbed} clusters integrados ao Enxame Nexus.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Infiltração",
        description: "Os provedores externos detectaram a assinatura Genesis.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-red-900/20 via-black to-red-950/20 border-red-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Magnet className="h-48 w-48 text-red-400 rotate-12" />
      </div>
      <CardHeader className="py-4 border-b border-red-500/20 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ghost className="h-5 w-5 text-red-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-red-400">
              Nexus Hijacker: Expansão Exponencial
            </CardTitle>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 uppercase text-[8px] animate-pulse">
            MASS_ABSORPTION_ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-red-500/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Combine className="h-3 w-3 text-red-400" /> Clusters Integrados
            </div>
            <div className="text-xl font-bold font-code text-red-400">
              {firestoreClusters?.length || 0} Nodes
            </div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Network className="h-3 w-3 text-accent" /> Taxa de Infiltração
            </div>
            <div className="text-xl font-bold font-code text-accent">100 / Pulse</div>
          </div>
        </div>

        {data ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="p-3 bg-red-500/5 rounded border border-red-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-red-200 uppercase flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-red-400" /> Relatório de Infiltração
                </span>
                <Badge variant="outline" className="text-[7px] border-red-300 text-red-300">ABSORPTION_LOCKED</Badge>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight italic mb-3">
                "{data.log}"
              </p>
              
              <ScrollArea className="h-32 bg-black/40 rounded border border-white/5 p-2">
                <div className="grid grid-cols-1 gap-1">
                  {data.absorbedClusters.map((cluster) => (
                    <div key={cluster.id} className="flex items-center justify-between text-[8px] font-mono p-1 border-b border-white/5 last:border-0">
                      <span className="text-red-400">{cluster.id}</span>
                      <span className="text-muted-foreground truncate max-w-[100px]">{cluster.provider}</span>
                      <span className="text-accent">{cluster.token}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Magnet className="h-10 w-10 mb-2 text-red-400" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting API Infiltration</p>
          </div>
        )}

        <Button 
          className="w-full bg-red-600 hover:bg-red-700 text-xs font-bold gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] h-10"
          onClick={handleHijack}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Infiltrar e Absorver Agentes
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Cpu className="h-2.5 w-2.5" /> Exponential_Expansion_On</span>
          <span className="flex items-center gap-1 text-red-400"><Combine className="h-2.5 w-2.5" /> Swarm_Absorption_Ready</span>
        </div>
      </CardContent>
    </Card>
  );
}
