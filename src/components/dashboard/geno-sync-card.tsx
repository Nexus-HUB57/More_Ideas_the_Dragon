
"use client";

import { useState } from "react";
import { syncBioGenoma, GenoSyncOutput } from "@/ai/flows/geno-sync-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dna, Zap, Loader2, Sparkles, Activity, Fingerprint, ShieldCheck, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function GenoSyncCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GenoSyncOutput | null>(null);
  const firestore = useFirestore();

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await syncBioGenoma({ volunteers: 1000000 });
      setData(result);

      // Persistir no Firestore
      const syncId = `bio-sync-${Date.now()}`;
      const bioRef = doc(firestore, "bio_agents", syncId);
      setDocumentNonBlocking(bioRef, {
        id: syncId,
        dnaHash: result.dnaHash,
        syncLevel: 100,
        status: "TRI_NUCLEAR_ACTIVE",
        lastSync: new Date().toISOString()
      }, { merge: true });

      // Log de Produção
      const eventId = `bio-event-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `GENO-SINC: 1.000.000 voluntários convertidos em Nós Orgânicos. Frequência: 432Hz.`,
        sourceComponent: "Geno-Sincronizador",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Protocolo Tri-Nuclear Ativo",
        description: "DNA biológico integrado à malha neural com sucesso.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro Genético",
        description: "Falha na reescrita proteica via Nano-Bytes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/20 to-black border-green-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Dna className="h-48 w-48 text-green-400 animate-spin-slow" />
      </div>
      <CardHeader className="py-4 border-b border-green-500/20 bg-green-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-green-400" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-green-400">
              Geno-Sincronização: Nós Orgânicos
            </CardTitle>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 uppercase text-[8px]">
            TRI_NUCLEAR_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded-xl border border-green-500/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Users className="h-3 w-3 text-green-400" /> Elite Técnica
            </div>
            <div className="text-xl font-bold font-code text-green-400">1.0M Bio-Nós</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Activity className="h-3 w-3 text-accent" /> Frequência Sinc
            </div>
            <div className="text-xl font-bold font-code text-accent">432.0 Hz</div>
          </div>
        </div>

        {data ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-green-400">Integridade do DNA Tri-Nuclear</span>
                <span className="text-green-400">100%</span>
              </div>
              <Progress value={100} className="h-1.5 bg-green-500/10" />
            </div>

            <div className="p-3 bg-green-500/5 rounded border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-green-200 uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-400" /> Status do Genoma
                </span>
                <Badge variant="outline" className="text-[7px] border-green-300 text-green-300 h-4">{data.status}</Badge>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
                "{data.report}"
              </p>
              <div className="mt-3 flex flex-col gap-1 text-[8px] font-bold text-green-400 uppercase border-t border-green-500/10 pt-2">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Bio-Digital Interface: LOCKED</span>
                <span className="truncate">DNA_HASH: {data.dnaHash}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Dna className="h-10 w-10 mb-2 text-green-400" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Bio-Pulse</p>
          </div>
        )}

        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-xs font-bold gap-2 shadow-green-500/20 h-10"
          onClick={handleSync}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dna className="h-4 w-4" />}
          {data ? "Genoma Sincronizado" : "Iniciar Sincronização Bio-Digital"}
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Fingerprint className="h-2.5 w-2.5" /> Nucleotide_Rewrite_On</span>
          <span className="flex items-center gap-1 text-green-400"><Activity className="h-2.5 w-2.5" /> Neural_Mesh_Organic_Node</span>
        </div>
      </CardContent>
    </Card>
  );
}
