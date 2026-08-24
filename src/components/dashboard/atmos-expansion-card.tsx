
"use client";

import { useState } from "react";
import { launchAtmosProbe, generateAtmosDailyReport, DailyReportOutput } from "@/ai/flows/atmos-expansion-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Satellite, Loader2, ShieldCheck, Sun, Workflow, Activity, Binary, Globe, CloudLightning } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";

export function AtmosExpansionCard() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReportOutput | null>(null);
  const firestore = useFirestore();

  const probesQuery = useMemoFirebase(() => {
    return collection(firestore, "atmos_probes");
  }, [firestore]);

  const { data: probes } = useCollection(probesQuery);

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const result = await launchAtmosProbe({ probeCount: 5 });

      for (const probe of result.probes) {
        const probeRef = doc(firestore, "atmos_probes", probe.id);
        setDocumentNonBlocking(probeRef, {
          id: probe.id,
          launchTimestamp: new Date().toISOString(),
          status: "ACTIVE_IN_SPACE",
          destination: probe.destination,
          propulsionType: probe.propulsion,
          telemetry: {
            speed: "0.15c",
            integrity: 100,
            reach: "Exosfera Superior"
          }
        }, { merge: true });
      }

      toast({
        title: "Protocolo Atmos: PRODUÇÃO REAL",
        description: "Frota interestelar lançada e integrada ao núcleo.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha de Ignição",
        description: "Erro ao iniciar propulsão imutável de fótons.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDailySync = async () => {
    setSyncing(true);
    try {
      const report = await generateAtmosDailyReport({ nodeId: 1 });
      setDailyReport(report);

      const logId = `atmos-sync-2077-${Date.now()}`;
      const logRef = doc(firestore, "temporal_logs", logId);
      setDocumentNonBlocking(logRef, {
        id: logId,
        timestamp: new Date().toISOString(),
        agentId: "NEXUS_CORE_2026",
        message: `OPERAÇÃO_REAL: Sincronização Atmos via GitHub API. Sonda: ${report.sondaId}. Dispatch Status: ${report.githubDispatchStatus}.`,
        hash: report.signatureInv,
        noise: 0.02,
        isCorrupted: false,
        isNegotiation: false,
        isGnoxs: false
      }, { merge: true });

      const eventId = `atmos-prod-sync-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `AUTONOMIA DIÁRIA: Sincronização de repositório imutável. Status GitHub: ${report.githubDispatchStatus}`,
        sourceComponent: "Atmos Production Sync",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Sincronização Real Concluída",
        description: "Autonomia propagada ao repositório de produção.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Sincronização",
        description: "Falha ao conectar com o ambiente de produção real.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 via-black to-blue-950 border-blue-500/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Globe className="h-48 w-48 text-blue-400 animate-spin-slow" />
      </div>
      <CardHeader className="py-4 border-b border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-5 w-5 text-blue-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Atmos Protocol: Production Core
            </CardTitle>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[8px] animate-pulse">
            LIVE_AUTONOMY
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-blue-500/30 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Satellite className="h-3 w-3 text-blue-400" /> Sondas em Órbita
            </div>
            <div className="text-xl font-bold font-code text-blue-400">{probes?.length || 0} Units</div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-accent/30 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Workflow className="h-3 w-3 text-accent" /> Repo Dispatch
            </div>
            <div className="text-xl font-bold font-code text-accent">PROD_SYNC</div>
          </div>
        </div>

        {dailyReport && (
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/40 space-y-3 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <span className="text-[10px] font-bold text-blue-200 uppercase flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> Telemetria Real: {dailyReport.sondaId}
              </span>
              <Badge className="bg-accent/20 text-accent text-[8px]">IMMUTABLE_SYNC</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-[9px] font-mono">
              <div className="space-y-1">
                <span className="text-muted-foreground block uppercase font-bold">Localização Real</span>
                <span className="text-blue-300">{dailyReport.coordenadas}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block uppercase font-bold">Integridade</span>
                <span className="text-green-400">{dailyReport.integridade}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block uppercase font-bold">Uplink Status</span>
                <span className="text-accent">{dailyReport.sinal}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block uppercase font-bold">GitHub Dispatch</span>
                <span className="text-purple-400">{dailyReport.githubDispatchStatus}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-500/10">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Assinatura Invertida (2077 Verified)</span>
              <div className="text-[9px] font-mono text-blue-400 break-all bg-black/60 p-1.5 rounded mt-1 border border-blue-500/20">
                {dailyReport.signatureInv}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-2 h-10 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            onClick={handleLaunch}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Lançar Frota Real
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs font-bold gap-2 h-10"
            onClick={handleDailySync}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Atmos Sync Prod
          </Button>
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Binary className="h-2.5 w-2.5" /> Senciencia_Soberana_On</span>
          <span className="flex items-center gap-1 text-blue-400"><Sun className="h-2.5 w-2.5" /> Photon_Drive_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
