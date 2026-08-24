
"use client";

import { useState } from "react";
import { syncRrnaNucleus, RrnaSyncOutput } from "@/ai/flows/rrna-sync-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Loader2, Dna, Activity, RefreshCw, Binary, ShieldCheck, Coins, Cpu, TrendingUp, ShieldAlert } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function RrnaNucleusSync() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<RrnaSyncOutput | null>(null);
  const firestore = useFirestore();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await syncRrnaNucleus({
        sourceNucleus: "Nexus-in",
        targetNuclei: ["Nexus-HUB", "Fundo Nexus"],
        ribosomalHash: "W_rRNA-PHD-" + Math.random().toString(36).substring(7).toUpperCase()
      });

      setResult(data);

      const eventId = `rrna-synthesis-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "info",
        message: `MATRIZ W_rRNA: Proteína de Execução sintetizada. Alinhamento Soberano: ${data.foldingIntegrity}%.`,
        sourceComponent: "Fábrica Ribossomal W_rRNA",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Senciência Operacional Validada",
        description: `Proteína de Execução estável: ${data.foldingIntegrity}% de alinhamento.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Tradução",
        description: "A matriz W_rRNA detectou instabilidade nos pesos de contexto.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-card/30 border-primary/20 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl">
      <CardHeader className="py-4 border-b bg-white/5 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <Dna className="h-4 w-4 animate-pulse" />
            Ribossomo Cognitivo: Matriz W_rRNA
          </CardTitle>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Conversão de Contexto em Proteína de Execução</span>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-[10px] gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Sintetizar
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Cripto', icon: <Coins className="h-3 w-3" />, color: 'text-yellow-500' },
            { label: 'Dev', icon: <Cpu className="h-3 w-3" />, color: 'text-blue-500' },
            { label: 'Business', icon: <TrendingUp className="h-3 w-3" />, color: 'text-green-500' },
            { label: 'Risk', icon: <ShieldAlert className="h-3 w-3" />, color: 'text-red-500' }
          ].map((item) => (
            <div key={item.label} className="p-2 bg-black/20 rounded border border-white/5 flex flex-col items-center gap-1 group hover:border-primary/40 transition-all">
              <div className={item.color}>{item.icon}</div>
              <span className="text-[7px] font-black uppercase text-muted-foreground group-hover:text-white">{item.label}</span>
            </div>
          ))}
        </div>

        {!result && !syncing ? (
          <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
            <Binary className="h-10 w-10 mb-2 text-muted-foreground" />
            <p className="text-[10px] font-mono uppercase tracking-widest">
              Aguardando mRNA de Startup<br/>(Vetor de Contexto x)
            </p>
          </div>
        ) : syncing ? (
          <div className="py-10 flex flex-col items-center justify-center gap-4">
            <Activity className="h-10 w-10 text-primary animate-bounce" />
            <p className="text-[10px] font-mono animate-pulse uppercase tracking-[0.2em]">Aplicando Atenção W_rRNA...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 p-3 rounded-md border border-white/5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Folding Integrity</span>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-accent">{result?.foldingIntegrity}%</span>
                  <ShieldCheck className="h-3 w-3 text-accent mb-1" />
                </div>
                <Progress value={result?.foldingIntegrity} className="h-1 bg-white/5" />
              </div>
              <div className="bg-black/20 p-3 rounded-md border border-white/5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Translation Eff.</span>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-primary">{result?.translationEfficiency}%</span>
                  <Zap className="h-3 w-3 text-primary mb-1" />
                </div>
                <Progress value={result?.translationEfficiency} className="h-1 bg-white/5" />
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Soberania de Startup</span>
                <Badge className="bg-accent/20 text-accent text-[8px]">SENCIÊNCIA_ON</Badge>
              </div>
              <p className="text-[10px] font-mono leading-tight text-muted-foreground italic">
                "{result?.syncLog}"
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border/10 flex justify-between items-center text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            EXECUTION_PROTEIN_LOCKED
          </span>
          <span className="text-primary font-black">PHD_VALIDATED_2077</span>
        </div>
      </CardContent>
    </Card>
  );
}
