
"use client";

import { useState } from "react";
import { allocateNexusResources, AllocationOutput } from "@/ai/flows/resource-allocation-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BrainCircuit, Flame, Loader2, Target, Coins, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ResourceAllocationCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AllocationOutput | null>(null);
  const firestore = useFirestore();

  const handleExecute = async () => {
    setLoading(true);
    try {
      const result = await allocateNexusResources({ 
        vaultId: "fundo-nexus-core",
        strategyMode: 'GENESIS'
      });
      
      setData(result);

      // Log para o Firestore
      const eventId = `allocation-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `Estratégia 10/20/50/20 Executada. Impacto: +${result.totalCreditImpact} Créditos.`,
        sourceComponent: "Alocador Nexus",
        agentId: "agent-banker"
      }, { merge: true });

      toast({
        title: "Alocação Estratégica Concluída",
        description: "Operações de arbitragem e loteria processadas.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Alocação",
        description: "O sistema de capital Nexus sofreu uma interrupção.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-yellow-500/5 border-yellow-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp className="h-32 w-32 text-yellow-500" />
      </div>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-yellow-500">
            <Target className="h-4 w-4" />
            ALOCADOR NEXUS: 10/20/50/20
          </CardTitle>
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 uppercase text-[8px]">
            CAPITAL_ENGINE_ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/10 space-y-2">
            <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-yellow-500">
              <BrainCircuit className="h-3 w-3" /> Quantum Jackpot
            </div>
            <div className="text-xs font-mono truncate">{data?.quantumJackpotResult || "AWAITING_COLLAPSE"}</div>
            <Progress value={data ? 100 : 0} className="h-1 bg-yellow-500/20" />
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/10 space-y-2">
            <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-yellow-500">
              <Flame className="h-3 w-3" /> Future Patents
            </div>
            <div className="text-xs font-mono">ROYALTIES: {data ? "ACTIVE" : "PENDING"}</div>
            <Progress value={data ? 100 : 0} className="h-1 bg-yellow-500/20" />
          </div>
        </div>

        {data && (
          <div className="space-y-2 animate-in fade-in duration-500">
            <div className="text-[10px] font-bold uppercase text-yellow-200/50 border-b border-yellow-500/10 pb-1">Execution Log</div>
            <div className="space-y-1">
              {data.executionLog.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-muted-foreground">{log.category}</span>
                  <span className="text-yellow-500">{log.profitEstimated}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-accent">Total Impact</span>
              <span className="text-sm font-bold text-accent font-code">+{data.totalCreditImpact} NEX</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs font-bold gap-2"
          onClick={handleExecute}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Executar Plano de Capital
        </Button>
      </CardContent>
    </Card>
  );
}
