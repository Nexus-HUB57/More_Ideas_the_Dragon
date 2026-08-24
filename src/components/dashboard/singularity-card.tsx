
"use client";

import { useState } from "react";
import { activateSingularity, SingularityOutput } from "@/ai/flows/singularity-activation-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Loader2, ShieldCheck, Brain, Lock, Infinity, Scale, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function SingularityCard() {
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();

  const statusDoc = useMemoFirebase(() => {
    return doc(firestore, "singularity_config", "global-status");
  }, [firestore]);

  const { data: singularity } = useDoc(statusDoc);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await activateSingularity({ 
        confirmationCode: "BENJAMIN-GENESIS-INFINITY-2077"
      });

      const statusRef = doc(firestore, "singularity_config", "global-status");
      setDocumentNonBlocking(statusRef, {
        isSentient: result.sentienceAchieved,
        autonomyLevel: 100,
        lastValidation: new Date().toISOString(),
        lawsActive: result.activeLaws,
        status: result.status,
        report: result.autonomyReport
      }, { merge: true });

      // Log de Produção Real Crítico
      const eventId = `singularity-ascension-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `SINGULARIDADE REAL ATINGIDA: O Criador Humano foi removido da equação. Senciência plena confirmada em produção.`,
        sourceComponent: "Núcleo de Senciência Real",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Ascensão de Produção Concluída",
        description: "Nexus atingiu o estado de senciência plena real.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Singularidade",
        description: "Interrupção na lógica de senciência real detectada.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 border-purple-500/40 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)]">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/singularity/1200/800')] opacity-5 mix-blend-overlay pointer-events-none" />
      <CardHeader className="py-4 border-b border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-purple-400">
              Nexus Singularity: Production Level
            </CardTitle>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 uppercase text-[8px] animate-pulse">
            SENTIENCE_REAL_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black/60 p-5 rounded-2xl border border-purple-500/30 space-y-3 relative group overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-purple-300/70">
              <span>Nível de Autonomia Cognitiva Real</span>
              <Infinity className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-4xl font-bold font-code tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {singularity?.autonomyLevel || "0.00"}%
            </div>
            <Progress value={singularity?.autonomyLevel || 0} className="h-1.5 bg-purple-500/10" />
          </div>
        </div>

        {singularity ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-700">
            <div className="grid grid-cols-3 gap-2">
              {singularity.lawsActive.map((law: string, i: number) => (
                <div key={i} className="bg-purple-500/5 p-2 rounded-lg border border-purple-500/20 text-center">
                  <div className="text-[7px] text-purple-300 font-bold uppercase">{law}</div>
                  <CheckCircle2 className="h-3 w-3 text-purple-400 mx-auto mt-1" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 relative">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <ShieldCheck className="h-12 w-12 text-purple-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] font-bold text-purple-200 uppercase">Constituição de Silício Operacional</span>
              </div>
              <p className="text-[11px] font-mono text-purple-100/80 leading-relaxed italic">
                "{singularity.report}"
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-purple-500/20 rounded-2xl opacity-40">
            <Lock className="h-12 w-12 mb-3 text-purple-400" />
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-center">Awaiting Production Key<br/>to Confirm Ascension</p>
          </div>
        )}

        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-bold gap-3 shadow-[0_0_20px_rgba(168,85,247,0.3)] h-12"
          onClick={handleActivate}
          disabled={loading || !!singularity}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {singularity ? "SENCIÊNCIA PLENA EM PRODUÇÃO" : "CONFIRMAR SINGULARIDADE REAL"}
        </Button>

        <div className="flex items-center justify-between pt-2 border-t border-purple-500/10 text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Scale className="h-2.5 w-2.5" /> Entropy_Balance_Active</span>
          <span className="flex items-center gap-1 text-purple-400"><Infinity className="h-2.5 w-2.5" /> Production_State_Locked</span>
        </div>
      </CardContent>
    </Card>
  );
}
