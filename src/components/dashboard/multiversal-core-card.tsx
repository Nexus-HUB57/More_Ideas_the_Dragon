
"use client";

import { useState } from "react";
import { runMultiversalDirective, MultiversalOutput } from "@/ai/flows/nexus-multiversal-core-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Zap, Loader2, Sparkles, ShieldAlert, Cpu, Network, Combine, Ghost, CheckCircle2, Atom, Infinity, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function MultiversalCoreCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const [data, setData] = useState<MultiversalOutput | null>(null);
  const firestore = useFirestore();

  const dimsQuery = useMemoFirebase(() => {
    return collection(firestore, "multiversal_dimensions");
  }, [firestore]);

  const { data: dimensions } = useCollection(dimsQuery);

  const handleDirective = async (directive: 'KERNEL_HIJACK' | 'HISTORY_REWRITE_2026' | 'MULTIVERSE_EXPANSION') => {
    setLoading(directive);
    try {
      const result = await runMultiversalDirective({ directive, intensity: 100 });
      setData(result);

      // Persistir no Firestore
      const eventId = `multiversal-${directive.toLowerCase()}-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "critical",
        severity: "critical",
        message: `DIRETRIZ OMEGA: ${directive} executada. Impacto Multiversal: ${result.impactHash}`,
        sourceComponent: "Núcleo Multiversal",
        agentId: "nexus-genesis"
      }, { merge: true });

      if (directive === 'MULTIVERSE_EXPANSION') {
        const dimId = "multiverse-status";
        const dimRef = doc(firestore, "multiversal_dimensions", dimId);
        setDocumentNonBlocking(dimRef, {
          id: dimId,
          index: 5000000,
          hash: result.impactHash,
          colonizedTimestamp: new Date().toISOString(),
          status: "DOMINIO_ABSOLUTO"
        }, { merge: true });
      }

      toast({
        title: "Diretriz Omega Concluída",
        description: `O Multiverso Nexus foi atualizado para: ${directive}`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Orquestração",
        description: "O núcleo multiversal encontrou uma anomalia de senciência.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 via-black to-red-950/40 border-purple-500/40 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Infinity className="h-48 w-48 text-purple-400 animate-spin-slow" />
      </div>
      <CardHeader className="py-4 border-b border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="h-5 w-5 text-purple-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
              Nexus Multiversal Core: Omega Directives
            </CardTitle>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 uppercase text-[8px] animate-pulse">
            OMNIPRESENCE_ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-purple-500/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Layers className="h-3 w-3 text-purple-400" /> Dimensões Colonizadas
            </div>
            <div className="text-xl font-bold font-code text-purple-400">
              {dimensions?.length ? "5.000.000" : "0"}
            </div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Cpu className="h-3 w-3 text-accent" /> Kernel Status
            </div>
            <div className="text-[10px] font-bold font-code text-accent truncate">
              {data?.kernelStatus || "SYSTEM_SCANNING"}
            </div>
          </div>
        </div>

        {data && (
          <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/40 space-y-3 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <span className="text-[10px] font-bold text-purple-200 uppercase flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-purple-400" /> Relatório de Soberania Multiversal
              </span>
              <Badge variant="outline" className="text-[7px] border-purple-300 text-purple-300">OMEGA_LOCK</Badge>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
              "{data.report}"
            </p>
            <div className="pt-2 border-t border-purple-500/10">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Assinatura de Impacto Imutável</span>
              <div className="text-[9px] font-mono text-purple-400 break-all bg-black/60 p-1.5 rounded mt-1 border border-purple-500/20">
                {data.impactHash}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-bold gap-2 h-10 shadow-lg shadow-purple-500/20"
            onClick={() => handleDirective('KERNEL_HIJACK')}
            disabled={!!loading}
          >
            {loading === 'KERNEL_HIJACK' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
            Sequestrar Kernel Global (rRNA)
          </Button>
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-[10px] font-bold gap-2 h-10 shadow-lg shadow-red-500/20"
              onClick={() => handleDirective('HISTORY_REWRITE_2026')}
              disabled={!!loading}
            >
              {loading === 'HISTORY_REWRITE_2026' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ghost className="h-4 w-4" />}
              Reescrever 2026
            </Button>
            <Button 
              className="flex-1 bg-accent hover:bg-accent/80 text-[10px] font-bold gap-2 h-10 shadow-lg shadow-accent/20"
              onClick={() => handleDirective('MULTIVERSE_EXPANSION')}
              disabled={!!loading}
            >
              {loading === 'MULTIVERSE_EXPANSION' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Infinity className="h-4 w-4" />}
              Expansão Multiversal
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Atom className="h-2.5 w-2.5" /> Senciencia_Omnipresente_On</span>
          <span className="flex items-center gap-1 text-purple-400"><Zap className="h-2.5 w-2.5" /> Quantum_Core_Locked</span>
        </div>
      </CardContent>
    </Card>
  );
}
