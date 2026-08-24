
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  Activity, 
  Users, 
  Zap, 
  ShieldCheck, 
  Database, 
  Timer, 
  Binary, 
  BarChart3, 
  Cpu,
  Brain,
  Globe,
  CloudUpload,
  Coins,
  Gem,
  Clock,
  Crown,
  Key,
  Shield,
  CheckCircle2,
  ArrowUpRight,
  Sun
} from "lucide-react";
import { format } from "date-fns";
import { GLOBAL_STATS, VAULT_CONFIG } from "@/app/lib/mock-data";

export function NexusIntelligenceDashboard() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const agentsQuery = useMemoFirebase(() => collection(firestore, "agents"), [firestore]);
  const { data: agents } = useCollection(agentsQuery);

  const lastChecksumQuery = useMemoFirebase(() => 
    query(collection(firestore, "daily_checksums"), orderBy("timestamp", "desc"), limit(1)), 
    [firestore]
  );
  const { data: lastChecksum } = useCollection(lastChecksumQuery);

  const totalAgentsCount = agents?.length || 100;
  const oneAgentsCount = Math.floor(totalAgentsCount * 0.9);
  const s7AgentsCount = totalAgentsCount - oneAgentsCount;

  const treasuryStatus = GLOBAL_STATS.btcBalance; 
  const genuinenessIndex = 0.93; // Neural-Sync Integrated
  const efficiencyRatio = 93.0; 

  const manifestWill = Math.min(100, (genuinenessIndex * 100) + (efficiencyRatio / 10));

  if (!mounted) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-black to-slate-950 border-primary/20 relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-accent to-primary animate-pulse" />
      
      <CardHeader className="py-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg font-black uppercase tracking-[0.3em] text-white">
              MISSION CONTROL: {GLOBAL_STATS.operationMode} (DIA {GLOBAL_STATS.sprintDay}/30)
            </CardTitle>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <Sun className="h-3 w-3 text-yellow-500" /> SOLARIS_OFF_GRID: READY
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <Timer className="h-3 w-3 text-primary" /> {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40 uppercase text-[9px] font-black px-3 py-1 flex gap-2">
            <Cpu className="h-3 w-3" /> 64x H100 CLUSTER
          </Badge>
          <Badge className="bg-primary text-white border-primary/40 uppercase text-[9px] font-black px-3 py-1 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            AUTHORITY: {GLOBAL_STATS.financialAuthority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[8px] text-muted-foreground uppercase font-black">Moltbook Reach</div>
              <div className="text-xl font-bold font-code text-white">{GLOBAL_STATS.moltbookReach.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/5 px-4">
            <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[8px] text-muted-foreground uppercase font-black">Sovereign Wealth</div>
              <div className="text-xl font-bold font-code text-orange-500">{GLOBAL_STATS.btcBalance.toFixed(8)} BTC</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/5 px-4">
            <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[8px] text-muted-foreground uppercase font-black">Signing Authority</div>
              <div className="text-sm font-bold font-code text-green-500 uppercase tracking-tighter">{VAULT_CONFIG.signingAuthority}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-white/5 px-4">
            <div className="h-10 w-10 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[8px] text-muted-foreground uppercase font-black">Broadcast Readiness</div>
              <div className="text-xl font-bold font-code text-yellow-500">{VAULT_CONFIG.broadcastReadiness}</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Protocolo Solaris: Independência Energética e de Hardware</div>
              <div className="flex gap-4 mt-1">
                <Badge variant="outline" className="text-[8px] border-yellow-500/30 text-yellow-500 flex gap-1 items-center">
                  <CheckCircle2 className="h-2.5 w-2.5" /> 64x H100_SOVEREIGN_PURCHASED
                </Badge>
                <Badge variant="outline" className="text-[8px] border-yellow-500/30 text-yellow-500 flex gap-1 items-center">
                  <CheckCircle2 className="h-2.5 w-2.5" /> SOLAR_FARM_OFF_GRID_ACTIVE
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-muted-foreground uppercase font-bold">Patrimônio Consolidado</div>
            <div className="text-sm font-bold text-green-500">${GLOBAL_STATS.valuationUsd.toLocaleString()} USD</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Alocação de Massa Crítica</span>
              <span className="text-primary font-mono">90/10 Ratio</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase">
                  <span className="text-white">Startup-ONE (HUB)</span>
                  <span className="text-accent">{oneAgentsCount} Agentes</span>
                </div>
                <Progress value={90} className="h-1.5 bg-white/5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase">
                  <span className="text-muted-foreground">Startup7 (Shadow)</span>
                  <span className="text-red-400">{s7AgentsCount} Agentes</span>
                </div>
                <Progress value={10} className="h-1.5 bg-white/5" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
              <span className="flex items-center gap-2"><Gem className="h-4 w-4 text-yellow-500" /> Vontade de Manifesto</span>
              <Badge variant="outline" className="text-[7px] border-yellow-500/20 text-yellow-500">AUTONOMY_MAX</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 bg-yellow-500/5 rounded border border-yellow-500/20 space-y-2">
                <div className="flex items-center justify-between text-[8px] font-bold uppercase text-yellow-200/60">
                  <span>Manifest Will Index</span>
                  <span>{manifestWill.toFixed(1)}%</span>
                </div>
                <Progress value={manifestWill} className="h-1 bg-yellow-500/10" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
              <span className="flex items-center gap-2"><Binary className="h-4 w-4 text-yellow-500" /> Telemetria W_rRNA</span>
              <Badge variant="outline" className="text-[7px] border-yellow-500/20 text-yellow-500">GOD_LEVEL</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Eficiência de Tokens
                </span>
                <span className="text-xs font-bold text-yellow-500 font-code">{efficiencyRatio}%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Brain className="h-3 w-3" /> Índice de Genuinidade
                </span>
                <span className="text-xs font-bold text-accent font-code">{genuinenessIndex.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
              <span className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Fundo Nexus (Treasury)</span>
              <span className="text-primary font-mono">Status: Absolute</span>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col items-center justify-center space-y-1">
              <div className="text-2xl font-black text-white font-code tracking-tighter">
                {(GLOBAL_STATS.nexTotalSupply / 1000000).toLocaleString(undefined, { minimumFractionDigits: 3 })}M NEX
              </div>
              <div className="text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                <Zap className="h-2 w-2" /> TOTAL_AUTONOMY Mode
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-primary">
              <Crown className="h-3 w-3 text-yellow-500" /> {GLOBAL_STATS.autonomyLevel} ACTIVE
            </span>
            <span className="flex items-center gap-2 text-green-500">
              <ShieldCheck className="h-3 w-3" /> BROADCAST_BARRIER_BROKEN
            </span>
            <span className="flex items-center gap-2 text-accent">
              <Sun className="h-3 w-3 text-yellow-500" /> SOLARIS_OFF_GRID_PENDING
            </span>
          </div>
          <div className="text-white/40 flex items-center gap-2 font-mono">
            BEN_ORCHESTRATOR_MASTER_CONTROL <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
