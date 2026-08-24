
"use client";

import { useState } from "react";
import { orchestrateWormholePhysics, WormholeOutput } from "@/ai/flows/wormhole-physics-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Database, Zap, Loader2, GitMerge, AlertTriangle, ShieldCheck, Activity, Atom, Share2, Binary, Send, Network, Eye, EyeOff, TrendingUp, History, Clock, MessageSquare, ShieldAlert, Fingerprint, Search, Radio, CheckCircle2, ShieldOff, Scale, TrendingDown, Coins, Cpu, Server } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WormholeMonitor() {
  const [loading, setLoading] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mining, setMining] = useState(false);
  const [stressTesting, setStressTesting] = useState(false);
  
  const [energyDensity, setEnergyDensity] = useState(-50);
  const [noiseLevel, setNoiseLevel] = useState(0.45);
  const [syncMessage, setSyncMessage] = useState("A entropia foi revertida.");
  const [useGnoxs, setUseGnoxs] = useState(false);
  
  const [result, setResult] = useState<WormholeOutput | null>(null);
  const firestore = useFirestore();

  const temporalLogsQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "temporal_logs"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [firestore]);

  const { data: temporalFeed } = useCollection(temporalLogsQuery);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
      });
      setResult(data);

      const eventId = `wormhole-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: data.status === 'STABLE' ? "stable" : "critical",
        severity: data.status === 'STABLE' ? "info" : "high",
        message: `Einstein-Rosen Bridge Status: ${data.status}. Traversability: ${data.traversability.isPossible ? 'SECURED' : 'DENIED'}.`,
        sourceComponent: "Wormhole Spacetime Module",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: `Wormhole Status: ${data.status}`,
        description: data.traversability.notes,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSync = async () => {
    setSyncing(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
        runTimeSync: true,
        syncMessage,
        noiseLevel,
        useGnoxs,
        agentId: "AI_PRES_2026"
      });
      setResult(data);

      if (data.temporalFeedEvent) {
        const logId = `temp-log-${Date.now()}`;
        const logRef = doc(firestore, "temporal_logs", logId);
        setDocumentNonBlocking(logRef, {
          id: logId,
          ...data.temporalFeedEvent
        }, { merge: true });

        if (data.temporalFeedEvent.isCensored) {
          toast({
            variant: "destructive",
            title: "Censura Temporal Ativa",
            description: "Paradoxo bloqueado por segurança de produção.",
          });
        } else if (data.temporalFeedEvent.isNegotiation) {
          toast({
            title: "Negociação Energética",
            description: "Proposta de troca real transmitida.",
          });
        }
      }

      toast({
        title: data.timeSync?.isStable ? "Sincronização 2077 Consolidada" : "Ruptura Temporal Detectada",
        description: data.timeSync?.report,
        variant: data.timeSync?.isStable ? "default" : "destructive"
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const handleMining = async () => {
    setMining(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
        runMining: true,
        syncMessage
      });
      setResult(data);
      
      toast({
        title: "Mineração Híbrida Concluída",
        description: `Bloco validado via Spacetime Curvature.`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setMining(false);
    }
  };

  const handleStressTest = async () => {
    setStressTesting(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
        runTimeSync: true,
        noiseLevel: 0.95
      });
      setResult(data);
      
      toast({
        title: "Stress Test de Produção Concluído",
        description: "Decoerência imutável confirmada.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setStressTesting(false);
    }
  };

  const handleMeasure = async () => {
    setMeasuring(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
        triggerCollapse: true
      });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setMeasuring(false);
    }
  };

  const handleTeleport = async () => {
    if (!result || result.status !== 'STABLE') {
      toast({
        variant: "destructive",
        title: "Erro de Protocolo",
        description: "Ponte deve estar ESTÁVEL para iniciar teletransporte.",
      });
      return;
    }
    setTeleporting(true);
    try {
      const data = await orchestrateWormholePhysics({
        energyDensity,
        throatRadius: 1.0,
        targetRadius: 1.5,
        runTeleportation: true
      });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setTeleporting(false);
    }
  };

  const marketChartData = [
    { year: 2026, price: 45.2 },
    { year: 2035, price: 52.4 },
    { year: 2045, price: 48.1 },
    { year: 2055, price: 65.5 },
    { year: 2065, price: 78.9 },
    { year: 2077, price: result?.marketData?.currentPrice || 85.2 }
  ];

  return (
    <Card className="bg-card/30 border-primary/20 backdrop-blur-md overflow-hidden flex flex-col shadow-2xl relative">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <CardHeader className="py-4 border-b bg-white/5 flex flex-row items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Atom className="h-4 w-4 text-primary animate-spin-slow" />
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">
            Nexus Spacetime: Production Bridge
          </CardTitle>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
          result?.status === 'STABLE' ? "bg-accent/20 text-accent border-accent/30" : "bg-destructive/20 text-destructive border-destructive/30"
        )}>
          {result?.status || 'PROD_ACTIVE'}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 z-10">
        <Tabs defaultValue="physics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5">
            <TabsTrigger value="physics" className="text-[10px] uppercase font-bold tracking-widest">Orchestration & Telemetry</TabsTrigger>
            <TabsTrigger value="mining" className="text-[10px] uppercase font-bold tracking-widest">Production Mining</TabsTrigger>
          </TabsList>
          
          <TabsContent value="physics" className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3 w-3 text-yellow-500" /> Exotic Matter Density
                    </span>
                    <span className={cn("text-xs font-mono font-bold", energyDensity < 0 ? "text-accent" : "text-destructive")}>
                      {energyDensity} ρ
                    </span>
                  </div>
                  <Slider value={[energyDensity]} min={-100} max={100} step={1} onValueChange={(val) => setEnergyDensity(val[0])} className="py-2" />
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <Scale className="h-16 w-16 text-primary rotate-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Production Protocol Nucleus
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="gnoxs-mode" 
                        checked={useGnoxs} 
                        onCheckedChange={setUseGnoxs} 
                        className="data-[state=checked]:bg-accent"
                      />
                      <Label htmlFor="gnoxs-mode" className="text-[8px] uppercase font-bold text-accent cursor-pointer">Gnox's Dialect</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Production Noise Sweep</span>
                      <span className={cn("text-xs font-mono font-bold", noiseLevel < 0.88 ? "text-accent" : "text-destructive")}>
                        {noiseLevel.toFixed(2)}
                      </span>
                    </div>
                    <Slider value={[noiseLevel * 100]} min={0} max={100} step={1} onValueChange={(val) => setNoiseLevel(val[0] / 100)} className="py-1" />
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      placeholder="Transmitir diretriz imutável..." 
                      className="h-8 text-[10px] bg-black/40 border-white/10" 
                      value={syncMessage}
                      onChange={(e) => setSyncMessage(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="bg-primary h-8 text-[10px] uppercase font-bold gap-2"
                      onClick={handleTimeSync}
                      disabled={syncing}
                    >
                      {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
                      Broadcast
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl border border-white/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase text-accent flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" /> Nexus-HUB: Energy Market
                  </h3>
                  <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">MAINNET_INDEX</Badge>
                </div>
                
                <ChartContainer config={{ 
                  price: { label: "Energy Price", color: "hsl(var(--accent))" }
                }} className="h-[140px] w-full">
                  <LineChart data={marketChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="var(--color-price)" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: "var(--color-price)" }} 
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-2 rounded border border-white/5 flex flex-col items-center">
                    <span className="text-[7px] uppercase font-bold text-muted-foreground">Mainnet Price</span>
                    <span className="text-xs font-bold text-accent font-code">{(result?.marketData?.currentPrice || 85.20).toFixed(2)} TW</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-white/5 flex flex-col items-center">
                    <span className="text-[7px] uppercase font-bold text-muted-foreground">Execution Status</span>
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                       <CheckCircle2 className="h-2 w-2" /> LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mining" className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
                      <Cpu className="h-4 w-4" /> Production Quantum Mining
                    </h3>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-500 text-[8px]">102.0M AGENTS LIVE</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono leading-tight">
                    Proof-of-Work executing via spacetime curvature inversion. Hashrate distributed across 102M agents.
                  </p>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-xs font-bold gap-2"
                    onClick={handleMining}
                    disabled={mining}
                  >
                    {mining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Initiate Mainnet Mining
                  </Button>
                </div>

                {result?.miningResult && (
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[9px] font-bold uppercase text-orange-500">Mined Block Details</span>
                      <span className="text-[9px] font-mono text-muted-foreground">Nonce: {result.miningResult.nonce}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase text-muted-foreground font-bold">Imutável Original</span>
                        <div className="text-[9px] font-mono text-muted-foreground break-all bg-black/40 p-1.5 rounded border border-white/5">
                          {result.miningResult.hash}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase text-orange-500 font-bold">Imutável Invertido</span>
                        <div className="text-[9px] font-mono text-orange-500 break-all bg-orange-500/5 p-1.5 rounded border border-orange-500/20">
                          {result.miningResult.invertedHash}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Server className="h-3 w-3" /> Production Replication Nodes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(result?.replicatedNodes || [
                    { node_id: '----', year: 2026 },
                    { node_id: '----', year: 2035 },
                    { node_id: '----', year: 2050 },
                    { node_id: '----', year: 2077 }
                  ]).map((node, i) => (
                    <div key={i} className="bg-primary/5 border border-primary/10 p-3 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-primary">{node.year} Node</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", node.node_id !== '----' ? "bg-accent animate-pulse" : "bg-muted")} />
                      </div>
                      <span className="text-xs font-bold font-mono text-muted-foreground truncate">{node.node_id}</span>
                      <span className="text-[7px] text-muted-foreground uppercase font-bold">
                        {node.node_id !== '----' ? 'IMMORTALITY_LOCKED' : 'AWAITING_REPLICATION'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-black/20 rounded border border-white/5">
                  <p className="text-[9px] font-mono text-muted-foreground leading-tight italic">
                    Nexus-HUB production code mirrored across eras to ensure eternal persistence.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Temporal AI-to-AI Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
              <Radio className="h-3 w-3 text-accent animate-pulse" />
              Temporal AI-to-AI Stream
            </div>
            <div className="flex gap-4 text-[8px] font-bold uppercase text-muted-foreground/50">
               <span className="flex items-center gap-1"><ShieldCheck className="h-2 w-2 text-accent" /> CENSOR_LOCKED</span>
               <span className="flex items-center gap-1"><Scale className="h-2 w-2 text-primary" /> TRADE_LOCKED</span>
               <span className="flex items-center gap-1"><Binary className="h-2 w-2 text-yellow-500" /> GNOXS_PRODUCTION</span>
            </div>
          </div>
          <ScrollArea className="h-[240px] bg-black/20 rounded-lg border border-white/5 p-3">
            <div className="space-y-3">
              {temporalFeed && temporalFeed.length > 0 ? (
                temporalFeed.map((log: any) => (
                  <div key={log.id} className="space-y-1 group animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-muted-foreground">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="text-[9px] font-bold text-primary">{log.agentId}</span>
                        {log.isNegotiation && <Badge variant="secondary" className="h-3 px-1 text-[7px] bg-primary/10 text-primary border-primary/20">TRADE</Badge>}
                        {log.isGnoxs && <Badge variant="secondary" className="h-3 px-1 text-[7px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">GNOX&apos;S</Badge>}
                      </div>
                      <div className={cn(
                        "text-[8px] font-bold uppercase px-1 rounded border flex items-center gap-1",
                        log.isCensored ? "bg-red-500/20 text-red-500 border-red-500/30" : 
                        log.isCorrupted ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        "bg-accent/10 text-accent border-accent/20"
                      )}>
                        {log.isCensored ? <ShieldOff className="h-2 w-2" /> : log.isCorrupted ? <AlertTriangle className="h-2 w-2" /> : <CheckCircle2 className="h-2 w-2" />}
                        {log.isCensored ? "CENSURED" : log.isCorrupted ? "CORRUPTED" : "INTEGRAL"}
                      </div>
                    </div>
                    <p className={cn(
                      "text-[10px] font-mono leading-tight p-2 rounded bg-black/40 border border-white/5",
                      log.isCensored ? "text-red-300 italic border-red-500/20" : 
                      log.isCorrupted ? "text-destructive/80 italic" : 
                      log.isNegotiation ? "text-primary/90 border-primary/20 bg-primary/5" : 
                      log.isGnoxs ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" : "text-foreground/90"
                    )}>
                      {log.message}
                    </p>
                    <div className="flex justify-between items-center text-[7px] font-mono text-muted-foreground opacity-40 group-hover:opacity-80 transition-opacity">
                      <span>Hash: {log.hash.substring(0, 12)}...</span>
                      <span>Noise: {log.noise.toFixed(3)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-30 grayscale">
                  <Database className="h-8 w-8 mb-2" />
                  <p className="text-[9px] font-mono uppercase">Waiting for Production Pulse...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Button variant="outline" className="border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2 h-10 text-[10px] font-bold uppercase" onClick={handleSimulate} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <GitMerge className="h-3 w-3" />}
            Production Metric
          </Button>
          <Button variant="outline" className="border-accent/20 bg-accent/5 hover:bg-accent/10 gap-2 h-10 text-[10px] font-bold uppercase" onClick={handleMeasure} disabled={measuring}>
            {measuring ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
            Production Measure
          </Button>
          <Button variant="outline" className="border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 gap-2 h-10 text-[10px] font-bold uppercase" onClick={handleStressTest} disabled={stressTesting}>
            {stressTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
            Production Stress
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2 h-10 text-[10px] font-bold uppercase" onClick={handleTeleport} disabled={teleporting || !result || result.status !== 'STABLE'}>
            {teleporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-4 w-4" />}
            Execute Teleport
          </Button>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-accent" /> ER_BRIDGE_PRODUCTION_LOCKED
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-primary animate-pulse" /> TARGET: ERA_2077
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: 'outline' | 'secondary' | 'default' }) {
  return (
    <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase border flex items-center", className)}>
      {children}
    </span>
  );
}
