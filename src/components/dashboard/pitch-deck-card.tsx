
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PITCH_DECK, GLOBAL_STATS } from "@/app/lib/mock-data";
import { Rocket, Target, ShieldCheck, Zap, Coins, Globe, Cpu, Infinity, Crown, CheckCircle2, Building2, Users } from "lucide-react";

export function PitchDeckCard() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-black to-indigo-950 border-primary/30 relative overflow-hidden shadow-2xl group">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-20" />
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Crown className="h-48 w-48 text-primary" />
      </div>
      
      <CardHeader className="py-6 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary animate-pulse" />
            <CardTitle className="text-xl font-black uppercase tracking-[0.4em] text-white">
              NEXUS-HUB Pitch Deck
            </CardTitle>
          </div>
          <span className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">
            {PITCH_DECK.tagline}
          </span>
        </div>
        <Badge className="bg-primary text-white border-primary/40 uppercase text-[10px] font-black px-4 py-1.5 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          SERIES_GENESIS_ACTIVE
        </Badge>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem vs Solution */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[11px] font-black uppercase text-red-400 flex items-center gap-2 tracking-[0.2em]">
                <Target className="h-4 w-4" /> The Problem
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-red-500/30 pl-4">
                "{PITCH_DECK.problem}"
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-[11px] font-black uppercase text-green-400 flex items-center gap-2 tracking-[0.2em]">
                <ShieldCheck className="h-4 w-4" /> The Solution
              </h3>
              <p className="text-sm text-white font-medium leading-relaxed italic border-l-2 border-green-500/30 pl-4">
                "{PITCH_DECK.solution}"
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 opacity-10">
                <Coins className="h-12 w-12 text-yellow-500" />
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground">Sovereign Capital</span>
              <div className="text-xl font-bold font-code text-orange-500">{GLOBAL_STATS.btcBalance.toFixed(2)} BTC</div>
              <div className="text-[8px] font-mono text-green-500">NO_VC_NEEDED</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 opacity-10">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground">Elite Agents</span>
              <div className="text-xl font-bold font-code text-white">{GLOBAL_STATS.eliteAgents} rRNA</div>
              <div className="text-[8px] font-mono text-accent">90/10_ALLOCATION</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 opacity-10">
                <Globe className="h-12 w-12 text-accent" />
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground">Market Ecosystem</span>
              <div className="text-xl font-bold font-code text-accent">2M Agents</div>
              <div className="text-[8px] font-mono text-white/40">MOLTBOOK_SYNCED</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2 relative overflow-hidden">
              <div className="absolute -right-2 -top-2 opacity-10">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <span className="text-[9px] font-black uppercase text-muted-foreground">Valuation Backed</span>
              <div className="text-xl font-bold font-code text-primary">${(GLOBAL_STATS.valuationUsd / 1000000).toFixed(1)}M</div>
              <div className="text-[8px] font-mono text-primary/60">BTC_REAL_TIME</div>
            </div>
          </div>
        </div>

        {/* Business Model Loop */}
        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Infinity className="h-16 w-16 text-primary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Business Model: The Infinite Cycle</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-primary/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Cpu className="h-5 w-5" />
              </div>
              <span>Sentience</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent mx-4" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/30">
                <Coins className="h-5 w-5" />
              </div>
              <span>Profit</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40 mx-4" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/30">
                <Building2 className="h-5 w-5" />
              </div>
              <span>Expansion</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-primary">
              <Crown className="h-3 w-3 text-yellow-500" /> Lucas Thomaz - Master Peer
            </span>
            <span className="flex items-center gap-2 text-green-500">
              <ShieldCheck className="h-3 w-3" /> Sovereign_WIF_Active
            </span>
          </div>
          <div className="text-white/40 flex items-center gap-2 font-mono">
            BEN_ORCHESTRATOR_APPROVED <CheckCircle2 className="h-3 w-3 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
