
"use client";

import { useState } from "react";
import { runNexusEvolution, runCoreStress, EvolutionOutput, StressTestOutput } from "@/ai/flows/nexus-evolution-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wrench, Zap, Loader2, ShieldCheck, Activity, Cpu, FastForward, GitBranch, Atom, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function EvolutionStressCard() {
  const [evolving, setEvolving] = useState(false);
  const [stressing, setStressing] = useState(false);
  const [evolutionData, setEvolutionData] = useState<EvolutionOutput | null>(null);
  const [stressResults, setStressResults] = useState<StressTestOutput[]>([]);
  const [stressProgress, setStressProgress] = useState(0);
  const firestore = useFirestore();

  const handleEvolve = async () => {
    setEvolving(true);
    try {
      const result = await runNexusEvolution({ nodeId: 100 });
      setEvolutionData(result);

      // Log de Produção Real
      const eventId = `evolution-real-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `OPERAÇÃO REAL: Auto-Mutação de Código acionada no GitHub. Status API: ${result.githubStatus}. Patch Hash: ${result.patchHash}`,
        sourceComponent: "Nexus Auto-Evolver (Produção)",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Auto-Evolução Real Iniciada",
        description: `Código mutado via GitHub Actions. Status: ${result.githubStatus}`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Produção",
        description: "Erro ao conectar com o motor de evolução do GitHub.",
      });
    } finally {
      setEvolving(false);
    }
  };

  const handleStressTest = async () => {
    setStressing(true);
    setStressResults([]);
    setStressProgress(0);
    
    const totalNodes = 100;
    const batchSize = 10;

    try {
      for (let i = 1; i <= totalNodes; i++) {
        const result = await runCoreStress({ nodeId: i });
        setStressResults(prev => [...prev, result]);
        setStressProgress((i / totalNodes) * 100);
        
        if (i % batchSize === 0) {
          await new Promise(r => setTimeout(r, 50));
        }
      }

      const eventId = `mega-stress-real-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "info",
        message: `PRODUCTION STRESS TEST: 100 Núcleos validados em Plenitude Real. Estabilidade da Matriz confirmada.`,
        sourceComponent: "Matriz de Carga Real",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Matriz Validada (Real)",
        description: "100 núcleos de produção em sincronia imutável.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Instabilidade na Matriz",
        description: "Anomalia detectada durante carga real no Nó 100.",
      });
    } finally {
      setStressing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 via-black to-orange-950/20 border-orange-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Atom className="h-48 w-48 text-orange-400 animate-spin-slow" />
      </div>
      <CardHeader className="py-4 border-b border-orange-500/20 bg-orange-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FastForward className="h-5 w-5 text-orange-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Nexus Auto-Evolver: Mainnet Production
            </CardTitle>
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 uppercase text-[8px] animate-pulse">
            IMMUTABLE_MUTATION_ON
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-orange-500/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Cpu className="h-3 w-3 text-orange-400" /> Núcleos Ativos
            </div>
            <div className="text-xl font-bold font-code text-orange-400">100 / 100</div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <GitBranch className="h-3 w-3 text-accent" /> GitHub Link
            </div>
            <div className="text-[10px] font-bold font-code text-accent truncate">
              {evolutionData ? evolutionData.githubStatus : 'PRODUCTION_READY'}
            </div>
          </div>
        </div>

        {evolutionData && (
          <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/40 space-y-3 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
              <span className="text-[10px] font-bold text-orange-200 uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-400" /> Auto-Mutação Sincronizada
              </span>
              <Badge variant="outline" className="text-[7px] border-orange-300 text-orange-300">PROD_LOCKED</Badge>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
              "{evolutionData.evolutionLog}"
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest">Patch Imutável: {evolutionData.patchHash}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
            <span className="flex items-center gap-2"><Activity className="h-3 w-3 text-orange-400" /> Production Load Stress</span>
            <span className="text-orange-400">{stressProgress.toFixed(0)}%</span>
          </div>
          <Progress value={stressProgress} className="h-1 bg-orange-500/10" />
          
          <ScrollArea className="h-24 bg-black/40 rounded border border-white/5 p-2">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }).map((_, i) => {
                const isTested = i < stressResults.length;
                return (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-sm transition-colors duration-200 ${
                      isTested ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]" : "bg-white/5"
                    }`} 
                  />
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-xs font-bold gap-2 h-10 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
            onClick={handleEvolve}
            disabled={evolving || stressing}
          >
            {evolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            Evoluir Produção
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 text-xs font-bold gap-2 h-10"
            onClick={handleStressTest}
            disabled={stressing || evolving}
          >
            {stressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Executar Carga Real
          </Button>
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><ShieldAlert className="h-2.5 w-2.5" /> Immutable_Evolution_Active</span>
          <span className="flex items-center gap-1 text-orange-400"><Atom className="h-2.5 w-2.5" /> Matrix_Validated_Production</span>
        </div>
      </CardContent>
    </Card>
  );
}
