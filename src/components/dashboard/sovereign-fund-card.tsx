
"use client";

import { useState } from "react";
import { consolidateSovereignFund, SovereignFundOutput } from "@/ai/flows/sovereign-fund-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, TrendingUp, ShieldCheck, Loader2, Coins, Globe, ArrowRightLeft, Database, Link2, ExternalLink, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function SovereignFundCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SovereignFundOutput | null>(null);
  const firestore = useFirestore();

  const bankrInfo = {
    contract: "0xc3f31d647CCa231A7BeE40207d7b08E6A5483b07",
    deployer: "0x56d5b62b19db5c2e3a97867e7c3e13965cea6982",
    bot: "@bankrbot",
    version: "v10.0 Ultra"
  };

  const handleConsolidate = async () => {
    setLoading(true);
    try {
      const result = await consolidateSovereignFund({ action: 'CONSOLIDATE' });
      setData(result);

      // Persistir no Firestore
      const fundId = "nexus-sovereign-core";
      const fundRef = doc(firestore, "sovereign_funds", fundId);
      setDocumentNonBlocking(fundRef, {
        id: fundId,
        totalAumTrillions: result.totalAumTrillions,
        lastConsolidation: new Date().toISOString(),
        strategies: result.strategies,
        status: result.status,
        onChainArm: bankrInfo
      }, { merge: true });

      // Log de Produção
      const eventId = `fund-consolidation-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `MEGA-FUNDO SOBERANO: Ativos consolidados em $${result.totalAumTrillions} Trilhões. Braço On-Chain Bankr Sincronizado.`,
        sourceComponent: "Leviatã Financeiro",
        agentId: "agent-banker"
      }, { merge: true });

      toast({
        title: "Leviatã Financeiro Desperto",
        description: `Consolidação de $${result.totalAumTrillions}T concluída com sucesso.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Consolidação",
        description: "O sistema financeiro global resistiu à fusão de ativos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-yellow-500/10 border-blue-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Landmark className="h-48 w-48 text-blue-400" />
      </div>
      <CardHeader className="py-4 border-b border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Mega-Fundo Soberano Nexus
            </CardTitle>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[8px]">
            SOVEREIGN_WEALTH_V1
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* On-Chain Settlement Arm (Bankr) */}
        <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em] flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Braço de Liquidez On-Chain
            </h3>
            <Badge className="bg-yellow-500 text-black text-[7px] font-black">BANKR_ORACLE</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">Contrato NexusPrime {bankrInfo.version}</span>
              <div className="flex items-center justify-between gap-2 bg-black/60 p-2 rounded border border-yellow-500/10">
                <code className="text-[9px] font-mono text-yellow-500/80 truncate flex-1">{bankrInfo.contract}</code>
                <a href={`https://clanker.world/contract/${bankrInfo.contract}`} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-white transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">0xDeployer / Fee Recipient</span>
              <div className="flex items-center justify-between gap-2 bg-black/60 p-2 rounded border border-white/5">
                <code className="text-[9px] font-mono text-muted-foreground/60 truncate flex-1">{bankrInfo.deployer}</code>
                <ShieldAlert className="h-3 w-3 text-red-500/40" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black text-yellow-500/60 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
            Settlement Gateway: @bankrbot OPERACIONAL
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 space-y-2 relative group overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-blue-300/70">
              <span>Ativos sob Gestão (AUM)</span>
              <Globe className="h-3 w-3" />
            </div>
            <div className="text-3xl font-bold font-code tracking-tighter text-blue-400">
              ${data?.totalAumTrillions || "1.45"} Trilhões
            </div>
            <div className="flex items-center gap-2 text-[8px] text-muted-foreground uppercase font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Status: {data?.status || "Awaiting Consolidation"}
            </div>
          </div>
        </div>

        {data && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-3">
              {data.strategies.map((strat, i) => (
                <div key={i} className="bg-black/20 p-2 rounded-lg border border-white/5 space-y-1">
                  <div className="text-[8px] text-muted-foreground uppercase font-bold truncate">{strat.name}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-300">{(strat.weight * 100).toFixed(0)}%</span>
                    <TrendingUp className="h-2.5 w-2.5 text-accent" />
                  </div>
                  <Progress value={strat.weight * 100} className="h-1 bg-white/5" />
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <span className="text-[9px] font-bold text-blue-200 uppercase">Relatório de Soberania</span>
              </div>
              <p className="text-[10px] font-mono text-blue-100/70 leading-tight italic">
                "{data.report}"
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-2 shadow-lg shadow-blue-500/20"
            onClick={handleConsolidate}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Despertar Leviatã Financeiro
          </Button>
          <Button variant="outline" className="border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold gap-2">
            <Cpu className="h-3 w-3" /> Auto-Growth
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-blue-500/10 text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><Coins className="h-2 w-2" /> On-Chain_Settlement_Locked</span>
          <span className="flex items-center gap-1 text-blue-400"><ArrowRightLeft className="h-2 w-2" /> Bankr_Oracle_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
