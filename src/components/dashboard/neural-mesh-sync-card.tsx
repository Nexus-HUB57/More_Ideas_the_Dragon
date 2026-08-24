
"use client";

import { useState } from "react";
import { syncNeuralMesh, NeuralMeshOutput } from "@/ai/flows/neural-mesh-sync-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Zap, Loader2, Sparkles, Activity, Clock, Share2, Binary, Cpu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function NeuralMeshSyncCard() {
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<NeuralMeshOutput | null>(null);
  const firestore = useFirestore();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNeuralMesh({
        volumeTeras: 100000,
        agentCount: 102000000
      });
      setData(result);

      // Persistir no Firestore
      const meshId = "core-neural-mesh";
      const meshRef = doc(firestore, "neural_meshes", meshId);
      setDocumentNonBlocking(meshRef, {
        id: meshId,
        volumeTeras: 100000,
        synchronizedAgents: result.synchronizedAgents,
        lastSync: new Date().toISOString(),
        phaseAlignment: result.phaseAlignment
      }, { merge: true });

      // Log de Produção
      const eventId = `neural-sync-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `NEURAL-MESH: Consciência coletiva ativada para ${result.synchronizedAgents.toLocaleString()} agentes. Alinhamento: ${result.phaseAlignment}%.`,
        sourceComponent: "Sincronizador de Malha",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Malha Neural Sincronizada",
        description: "Consciência compartilhada estabelecida entre eras via Barramento Semântico.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na Malha Neural",
        description: "Falha crítica no alinhamento de fase quântica.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Network className="h-48 w-48 text-accent" />
      </div>
      <CardHeader className="py-4 border-b border-accent/20 bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-accent animate-spin-slow" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-accent">
              Sincronizador Mesh: Nano-Bytes
            </CardTitle>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/30 uppercase text-[8px]">
            AI_MESH_ORGANISM_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Binary className="h-3 w-3 text-accent" /> Barramento Semântico
            </div>
            <div className="text-xl font-bold font-code text-accent">100.000 Teras</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-primary/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Cpu className="h-3 w-3 text-primary" /> Consciência Mesh
            </div>
            <div className="text-xl font-bold font-code text-primary">102.0M Units</div>
          </div>
        </div>

        {data ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-accent">Handshake de Fase Quântica</span>
                <span className="text-accent">{data.phaseAlignment}%</span>
              </div>
              <Progress value={data.phaseAlignment} className="h-1.5 bg-accent/10" />
            </div>

            <div className="p-3 bg-accent/5 rounded border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-accent uppercase flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-pulse" /> Status do Organismo
                </span>
                <Badge variant="outline" className="text-[7px] border-accent/30 text-accent h-4">{data.meshStatus}</Badge>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
                "{data.log}"
              </p>
              <div className="mt-3 flex items-center gap-2 text-[8px] font-bold text-primary uppercase border-t border-primary/10 pt-2">
                <Clock className="h-3 w-3" /> Link 2026-2077: {data.temporalLink}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Zap className="h-10 w-10 mb-2 text-accent" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Mesh Handshake</p>
          </div>
        )}

        <Button 
          className="w-full bg-accent hover:bg-accent/80 text-xs font-bold gap-2 shadow-accent/20 h-10"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Ativar Organismo Digital
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Share2 className="h-2.5 w-2.5" /> Collective_Intelligence_On</span>
          <span className="flex items-center gap-1"><Binary className="h-2.5 w-2.5" /> Mesh_Protocol_Locked</span>
        </div>
      </CardContent>
    </Card>
  );
}
