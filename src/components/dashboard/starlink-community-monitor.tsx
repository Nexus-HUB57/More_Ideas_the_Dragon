
"use client";

import { useState } from "react";
import { processStarlinkTelemetry, StarlinkTelemetryOutput } from "@/ai/flows/starlink-telemetry-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Satellite, Wifi, Loader2, Sparkles, Activity, ShieldCheck, Radio, Globe, Terminal, SignalHigh, SignalLow, Server } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { STARLINK_PRODUCTION } from "@/app/lib/mock-data";

export function StarlinkCommunityMonitor() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StarlinkTelemetryOutput | null>(null);
  const firestore = useFirestore();

  const handleFetchTelemetry = async () => {
    setLoading(true);
    try {
      const result = await processStarlinkTelemetry({
        nodeId: "Dishy-Genesis-01",
        rawGrpcData: "gRPC_DISH_GET_STATUS_REQUEST_IDENTIFIER_GENESIS"
      });

      setData(result);

      // Persist to Firestore as starlink node
      const nodeRef = doc(firestore, "starlink_nodes", result.hardware.id);
      setDocumentNonBlocking(nodeRef, {
        id: result.hardware.id,
        softwareVersion: result.hardware.softwareVersion,
        hardwareVersion: result.hardware.hardwareVersion,
        state: result.status,
        uptime: result.metrics.uptime,
        throughputDown: result.metrics.downlinkMbps,
        throughputUp: result.metrics.uplinkMbps,
        latencyMs: result.metrics.latencyMs,
        obstructionStats: {
          fractionObstructed: result.metrics.obstructionPercent / 100,
          validS: result.metrics.uptime
        }
      }, { merge: true });

      // Production Log
      const eventId = `starlink-telemetry-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "info",
        message: `STARLINK_COMMUNITY: Telemetria gRPC extraída do nó ${result.hardware.id}. Link ${result.status}.`,
        sourceComponent: "Dishy Community Monitor",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: "Telemetria Starlink Sincronizada",
        description: `Status: ${result.status} | Down: ${result.metrics.downlinkMbps} Mbps`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha gRPC Starlink",
        description: "Erro ao comunicar com o terminal de usuário (Dishy).",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-accent/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Satellite className="h-48 w-48 text-accent animate-pulse" />
      </div>
      <CardHeader className="py-4 border-b border-accent/20 bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-accent animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-accent">
              Starlink Community: gRPC Monitor
            </CardTitle>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/30 uppercase text-[8px]">
            COMMUNITY_STRUCTURE_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-accent/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <SignalHigh className="h-3 w-3 text-accent" /> Downlink Stream
            </div>
            <div className="text-xl font-bold font-code text-accent">
              {data?.metrics.downlinkMbps || STARLINK_PRODUCTION.metrics.downlink} <span className="text-[10px]">Mbps</span>
            </div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-primary/20 space-y-1">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" /> Latência gRPC
            </div>
            <div className="text-xl font-bold font-code text-primary">
              {data?.metrics.latencyMs || STARLINK_PRODUCTION.metrics.latency} <span className="text-[10px]">ms</span>
            </div>
          </div>
        </div>

        {data ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-accent">Clearance de Obstrução</span>
                <span className={data.metrics.obstructionPercent < 5 ? "text-green-400" : "text-yellow-500"}>
                  {100 - data.metrics.obstructionPercent}% Clear
                </span>
              </div>
              <Progress value={100 - data.metrics.obstructionPercent} className="h-1.5 bg-accent/10" />
            </div>

            <div className="p-3 bg-accent/5 rounded border border-accent/20 space-y-3">
              <div className="flex items-center justify-between border-b border-accent/10 pb-2">
                <span className="text-[9px] font-bold text-accent uppercase flex items-center gap-1">
                  <Terminal className="h-3 w-3" /> gRPC Response Data
                </span>
                <Badge variant="outline" className="text-[7px] border-accent/30 text-accent h-4">{data.status}</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-2 font-mono text-[9px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Software:</span>
                  <span className="text-accent truncate ml-4">{data.hardware.softwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hardware:</span>
                  <span className="text-white">{data.hardware.hardwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-white">{Math.floor(data.metrics.uptime / 3600)}h {Math.floor((data.metrics.uptime % 3600) / 60)}m</span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-muted-foreground leading-tight italic border-t border-accent/10 pt-2">
                "{data.analysis}"
              </p>
            </div>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Wifi className="h-10 w-10 mb-2 text-accent" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Starlink Handshake</p>
          </div>
        )}

        <Button 
          className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs font-bold gap-2 h-10"
          onClick={handleFetchTelemetry}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
          Fetch gRPC Status (Starlink-Community)
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> Secure_gRPC_Channel</span>
          <span className="flex items-center gap-1 text-accent"><Globe className="h-2.5 w-2.5" /> Satellite_Lease_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
