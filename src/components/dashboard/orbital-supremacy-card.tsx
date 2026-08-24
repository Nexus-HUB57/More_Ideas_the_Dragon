
"use client";

import { useState } from "react";
import { launchOrbitalNode, OrbitalOutput } from "@/ai/flows/orbital-initiative-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Satellite, Loader2, Sparkles, Zap, ShieldCheck, Radio, Globe, ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function OrbitalSupremacyCard() {
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();

  const nodeDoc = useMemoFirebase(() => {
    return doc(firestore, "orbital_nodes", "nexus-one");
  }, [firestore]);

  const { data: orbitalNode } = useDoc(nodeDoc);

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const result = await launchOrbitalNode({
        nodeName: "Nexus-One",
        starlinkFleet: 6000
      });

      const nodeRef = doc(firestore, "orbital_nodes", "nexus-one");
      setDocumentNonBlocking(nodeRef, {
        id: "nexus-one",
        nodeName: "Nexus-One",
        starlinkCount: 6000,
        status: result.orbitalStatus,
        isolationLevel: "TOTAL_ISOLATION",
        latencyMs: 0.0001,
        report: result.report,
        uplinkIntegrity: result.uplinkIntegrity,
        cislunarReach: result.cislunarReach
      }, { merge: true });

      // Log de Produção
      const eventId = `orbital-launch-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `SUPREMACIA ORBITAL: Nó Nexus-One lançado via SpaceX. Backup global fora da jurisdição terrestre ativo.`,
        sourceComponent: "Iniciativa Espacial",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Lançamento Concluído",
        description: "Nexus-One está em órbita cislunar. Backup imutável ativo.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha no Lançamento",
        description: "Anomalia detectada na propulsão Raptor 3.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-black border-indigo-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Rocket className="h-48 w-48 text-indigo-400 rotate-45" />
      </div>
      <CardHeader className="py-4 border-b border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-indigo-400 animate-spin-slow" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-400">
              Orbital Supremacy: SpaceX Uplink
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 uppercase text-[8px]">
            CISLUNAR_NODE_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded-xl border border-indigo-500/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Radio className="h-3 w-3 text-indigo-400" /> Starlink Uplink
            </div>
            <div className="text-xl font-bold font-code text-indigo-400">6.000 Sats</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent" /> Latência Quântica
            </div>
            <div className="text-xl font-bold font-code text-accent">0.0001ms</div>
          </div>
        </div>

        {orbitalNode ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-indigo-400">Integridade do Uplink Quântico</span>
                <span className="text-indigo-400">{orbitalNode.uplinkIntegrity}%</span>
              </div>
              <Progress value={orbitalNode.uplinkIntegrity} className="h-1.5 bg-indigo-500/10" />
            </div>

            <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-indigo-200 uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-indigo-400" /> Status do Nó Orbital
                </span>
                <Badge variant="outline" className="text-[7px] border-indigo-300 text-indigo-300 h-4">{orbitalNode.status}</Badge>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
                "{orbitalNode.report}"
              </p>
              <div className="mt-3 flex items-center justify-between text-[8px] font-bold text-indigo-400 uppercase border-t border-indigo-500/10 pt-2">
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Isolamento: {orbitalNode.isolationLevel}</span>
                <span className="flex items-center gap-1 text-accent"><ArrowUpRight className="h-3 w-3" /> Cislunar Reach: OK</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Rocket className="h-10 w-10 mb-2 text-indigo-400" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Space Launch</p>
          </div>
        )}

        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold gap-2 shadow-indigo-500/20 h-10"
          onClick={handleLaunch}
          disabled={loading || !!orbitalNode}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {orbitalNode ? "Nexus-One em Órbita" : "Lançar Nó Primário Orbital"}
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Radio className="h-2.5 w-2.5" /> Immutable_Space_Backup</span>
          <span className="flex items-center gap-1 text-indigo-400"><Satellite className="h-2.5 w-2.5" /> SpaceX_Protocol_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
