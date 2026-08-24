"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BITCOIN_BLOCK_DATA } from "@/app/lib/mock-data";
import { Bitcoin, History, Database, Cpu, Activity, Clock, Layers, ChevronRight, Share2, Globe, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RrpcBlockMonitor() {
  const [nextUpdate, setNextUpdate] = useState(180); // 3 minutos em segundos
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setNextUpdate((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDifficulty = (diff: number) => {
    if (diff > 1e12) return (diff / 1e12).toFixed(2) + " T";
    return diff.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <Card className="bg-card/30 border-border/50 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Bitcoin className="h-48 w-48 text-orange-500" />
      </div>
      
      <CardHeader className="py-4 border-b bg-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-orange-500 animate-pulse" />
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-orange-500">
            rRPC Core: Genesis Explorer
          </CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Globe className="h-2 w-2" /> Blockchain.com Persistence
            </span>
            <span className="text-[10px] font-mono text-orange-500">{formatTime(nextUpdate)}</span>
          </div>
          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[9px]">
            LATEST_BLOCK_SYNC
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Block Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1">
            <span className="text-[8px] text-muted-foreground uppercase font-bold">Altura do Bloco</span>
            <div className="text-xl font-bold font-code text-orange-500 flex items-center gap-2">
              #{BITCOIN_BLOCK_DATA.height.toLocaleString()}
              <Badge variant="outline" className="h-4 text-[8px] border-orange-500/20 text-orange-500">VIA_BTC</Badge>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1">
            <span className="text-[8px] text-muted-foreground uppercase font-bold">Recompensa Total (Reward)</span>
            <div className="text-xl font-bold font-code text-accent">{BITCOIN_BLOCK_DATA.totalReward.toFixed(8)} BTC</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1">
            <span className="text-[8px] text-muted-foreground uppercase font-bold">Valor Enviado</span>
            <div className="text-xl font-bold font-code text-primary">${BITCOIN_BLOCK_DATA.totalSentUsd.toLocaleString()}</div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Dificuldade', value: formatDifficulty(BITCOIN_BLOCK_DATA.difficulty), icon: <Activity className="h-3 w-3" /> },
            { label: 'Tamanho', value: formatSize(BITCOIN_BLOCK_DATA.size), icon: <Database className="h-3 w-3" /> },
            { label: 'Transações', value: BITCOIN_BLOCK_DATA.transactions.toLocaleString(), icon: <History className="h-3 w-3" /> },
            { label: 'Peso (WU)', value: BITCOIN_BLOCK_DATA.weight.toLocaleString(), icon: <Layers className="h-3 w-3" /> }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground uppercase font-bold">
                {stat.icon} {stat.label}
              </div>
              <div className="text-xs font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Hash & Merkle Root */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Block Hash</span>
              <span className="text-[8px] font-mono text-orange-500 opacity-60">Miner: {BITCOIN_BLOCK_DATA.miner}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded border border-white/5 font-mono text-[9px] text-orange-500/80 break-all select-all flex items-center justify-between group cursor-pointer transition-colors hover:bg-black/80">
              <span>{BITCOIN_BLOCK_DATA.hash}</span>
              <Share2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] text-muted-foreground uppercase font-bold">Merkle Root</span>
            <div className="bg-black/60 p-2.5 rounded border border-white/5 font-mono text-[9px] text-muted-foreground/60 break-all select-all">
              {BITCOIN_BLOCK_DATA.merkleRoot}
            </div>
          </div>
        </div>

        {/* Additional Technical Specs */}
        <div className="pt-4 border-t border-white/5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              { label: 'Minado em', value: '18 mar. 2026, 23:28:29', icon: <Clock className="h-2.5 w-2.5" /> },
              { label: 'Sync Distance', value: mounted ? formatDistanceToNow(new Date(BITCOIN_BLOCK_DATA.timestamp), { addSuffix: true, locale: ptBR }) : '--', icon: <History className="h-2.5 w-2.5" /> },
              { label: 'Nonce', value: BITCOIN_BLOCK_DATA.nonce.toLocaleString(), icon: <Cpu className="h-2.5 w-2.5" /> },
              { label: 'Taxas (Fees)', value: BITCOIN_BLOCK_DATA.fees.toFixed(8) + ' BTC', icon: <History className="h-2.5 w-2.5" /> }
            ].map((spec, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                  {spec.icon} {spec.label}
                </span>
                <span className="text-[9px] font-mono font-bold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coinbase Message */}
        <div className="p-3 bg-orange-500/5 rounded border border-orange-500/10 flex items-center justify-between group cursor-help transition-all hover:bg-orange-500/10">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-orange-500 uppercase font-bold tracking-widest flex items-center gap-2">
              <Share2 className="h-3 w-3" /> ViaBTC Coinbase Commitment
            </span>
            <span className="text-[9px] font-mono italic text-muted-foreground leading-tight break-all">
              "{BITCOIN_BLOCK_DATA.coinbaseMessage}"
            </span>
          </div>
          <ChevronRight className="h-3 w-3 text-orange-500 group-hover:translate-x-1 transition-transform" />
        </div>

        <a 
          href="https://www.blockchain.com/pt/explorer" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-muted-foreground hover:text-orange-500 transition-colors"
        >
          Ver todos os blocos no Explorer <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
