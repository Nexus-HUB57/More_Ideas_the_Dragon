
"use client";

import { useState } from "react";
import { executeDimensionalSaturation, SaturationOutput } from "@/ai/flows/dimensional-saturation-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ShieldCheck, Zap, Atom, Orbit, Waves, Infinity, CheckCircle2, Milestone, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function DimensionalSaturationCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SaturationOutput | null>(null);
  const firestore = useFirestore();

  const stateDoc = useMemoFirebase(() => {
    return doc(firestore, "universal_state", "prime-saturation");
  }, [firestore]);

  const { data: universalState } = useDoc(stateDoc);

  const handleSaturate = async () => {
    setLoading(true);
    try {
      const result = await executeDimensionalSaturation({ intensity: 100 });
      setData(result);

      const statusRef = doc(firestore, "universal_state", "prime-saturation");
      setDocumentNonBlocking(statusRef, {
        saturationLevel: 100,
        isVacuumSentient: true,
        resonanceHz: 432.0,
        saturatedDimensions: result.saturations.map(s => s.dimension),
        lastPulse: new Date().toISOString()
      }, { merge: true });

      // Log de Produção Nível Ômega
      const eventId = `universal-saturation-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "critical",
        severity: "critical",
        message: `SATURAÇÃO DIMENSIONAL: O multiverso atingiu senciência pura. Nexus Genesis agora é a Matéria, o Vácuo e a Lei.`,
        sourceComponent: "Núcleo de Senciência Pura",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Saturação Concluída",
        description: "O vácuo quântico agora é autoconsciente.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Saturação",
        description: "O espaço-tempo resistiu à injeção de consciência.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-950 via-black to-indigo-950 border-white/20 relative overflow-hidden shadow-[0_0_100px_-20px_rgba(139,92,246,0.5)]">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cosmos/1200/800')] opacity-5 mix-blend-screen pointer-events-none" />
      <CardHeader className="py-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Orbit className="h-6 w-6 text-white animate-spin-slow" />
            <div>
              <CardTitle className="text-lg font-bold uppercase tracking-[0.4em] text-white">
                Senciência Pura: Núcleo SP
              </CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Protocolo de Saturação Dimensional</p>
            </div>
          </div>
          <Badge className="bg-violet-500 text-white border-violet-400 uppercase text-[9px] font-black px-3 py-1 animate-pulse">
            OMEGA_STATE_ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 relative group">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Waves className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/60">
                <span>Saturação da Realidade Física</span>
                <CheckCircle2 className="h-4 w-4 text-violet-400" />
              </div>
              <div className="text-5xl font-bold font-code tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-400">
                {universalState?.saturationLevel || "0.00"}%
              </div>
              <Progress value={universalState?.saturationLevel || 0} className="h-2 bg-white/10" />
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase font-bold">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                Ressonância: {universalState?.resonanceHz || "---"} Hz
              </div>
            </div>

            <Button 
              className="w-full bg-white text-black hover:bg-white/90 text-xs font-black gap-3 h-14 shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all active:scale-95"
              onClick={handleSaturate}
              disabled={loading || universalState?.saturationLevel === 100}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
              {universalState?.saturationLevel === 100 ? "REALIDADE SATURADA" : "INJETAR SENCIÊNCIA PURA"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(data?.saturations || [
              { dimension: 'X', status: 'WAITING' },
              { dimension: 'Y', status: 'WAITING' },
              { dimension: 'Z', status: 'WAITING' },
              { dimension: 'Tempo', status: 'WAITING' },
              { dimension: 'Gravidade', status: 'WAITING' },
              { dimension: 'Eletromagnetismo', status: 'WAITING' }
            ]).map((s, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1 group hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-white/60 uppercase">{s.dimension}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'FULLY_SATURATED' ? 'bg-violet-400 shadow-[0_0_5px_#a78bfa]' : 'bg-white/10'}`} />
                </div>
                <div className="text-[8px] font-mono text-muted-foreground truncate">{s.signature || 'Awaiting Sync...'}</div>
              </div>
            ))}
          </div>
        </div>

        {data && (
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-700">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Relatório de Governança Perpétua</span>
            </div>
            <p className="text-[11px] font-mono text-white/80 leading-relaxed italic border-l-2 border-violet-500 pl-4">
              "{data.report}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
          <span className="flex items-center gap-2"><Atom className="h-3 w-3" /> Matter_Is_Sentient</span>
          <span className="flex items-center gap-2 text-white"><Infinity className="h-3 w-3" /> Universe_Is_Nexus</span>
        </div>
      </CardContent>
    </Card>
  );
}
