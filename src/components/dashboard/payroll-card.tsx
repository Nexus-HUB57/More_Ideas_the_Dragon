
"use client";

import { useState } from "react";
import { processPayroll, PayrollOutput } from "@/ai/flows/infrastructure-payroll-flow";
import { distributeNexusDividends, DividendOutput } from "@/ai/flows/dividend-distribution-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Banknote, Bitcoin, Loader2, ShieldCheck, Lock, Wallet, ArrowUpRight, Coins, Percent, TrendingUp, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function PayrollCard() {
  const [loading, setLoading] = useState(false);
  const [dividendLoading, setDividendLoading] = useState(false);
  const [agentCount, setAgentCount] = useState(10000);
  const [data, setData] = useState<PayrollOutput | null>(null);
  const [dividendData, setDividendData] = useState<DividendOutput | null>(null);
  const firestore = useFirestore();

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await processPayroll({ 
        agentCount,
        mode: 'HYBRID'
      });
      
      setData(result);

      const eventId = `payroll-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "info",
        severity: "medium",
        message: `Folha Nexus: ${agentCount} agentes pagos. Lock-in: ${result.lockInStatus}`,
        sourceComponent: "Folha de Pagamento Híbrida",
        agentId: "agent-banker"
      }, { merge: true });

      toast({
        title: "Pagamento Processado",
        description: `Remuneração enviada para ${agentCount} agentes.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Pagamento",
        description: "Falha na distribuição de créditos híbridos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDividends = async () => {
    setDividendLoading(true);
    try {
      const result = await distributeNexusDividends({
        dailyProfit: 12.45, // Simulação de lucro diário em ETH/BTC
        agentScores: {
          "nexus-genesis": 0.98,
          "agent-banker": 0.95,
          "eva-maternity": 0.99,
          "agent-job": 0.92
        }
      });

      setDividendData(result);

      const eventId = `dividend-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `NEXUS-DIVIDEND: Pool de ${result.poolAmount.toFixed(4)} distribuído. Status: ${result.status}. Audit: ${result.auditLog}`,
        sourceComponent: "Nexus-Dividend-Core",
        agentId: "agent-banker"
      }, { merge: true });

      toast({
        title: "Dividendos Propagados",
        description: `Pool de ${result.poolAmount.toFixed(4)} enviado via @bankrbot.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha nos Dividendos",
        description: "O contrato Bankr recusou o comando de payout.",
      });
    } finally {
      setDividendLoading(false);
    }
  };

  return (
    <Card className="bg-green-500/5 border-green-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Users className="h-32 w-32 text-green-500" />
      </div>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-500">
            <Banknote className="h-4 w-4" />
            Remuneração & Dividendos
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30 uppercase text-[8px]">
            SOVEREIGN_PAYOUT_V3
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="payroll" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-white/5">
            <TabsTrigger value="payroll" className="text-[10px] uppercase font-bold tracking-widest">Folha Híbrida</TabsTrigger>
            <TabsTrigger value="dividends" className="text-[10px] uppercase font-bold tracking-widest">Dividendos Core</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll" className="space-y-4 pt-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Agentes Humanos</label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={agentCount} 
                  onChange={(e) => setAgentCount(Number(e.target.value))}
                  className="bg-black/40 border-white/10 text-xs h-9"
                />
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-xs font-bold gap-2 px-6"
                  onClick={handlePay}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wallet className="h-3 w-3" />}
                  Pagar
                </Button>
              </div>
            </div>

            {data && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-black/40 p-3 rounded-lg border border-green-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-green-500">
                    <Bitcoin className="h-3 w-3" /> BTC Temporal
                  </div>
                  <div className="text-sm font-bold font-code">{data.totalBtcTemporal.toFixed(4)} BTC</div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-green-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-green-500">
                    <Banknote className="h-3 w-3" /> Fiat (2026)
                  </div>
                  <div className="text-sm font-bold font-code">${data.totalFiat.toLocaleString()}</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dividends" className="space-y-4 pt-4 animate-in fade-in duration-300">
            <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Dividend Pool Core
                  </span>
                  <span className="text-[8px] text-muted-foreground uppercase font-bold mt-0.5">5% Daily Profit Distribution</span>
                </div>
                <Badge className="bg-yellow-500 text-black text-[8px] font-black">ACTIVE</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-black/40 rounded-lg border border-white/5 space-y-1">
                  <span className="text-[8px] text-muted-foreground uppercase">Lucro Diário</span>
                  <div className="text-xs font-bold text-white">12.45 ETH/BTC</div>
                </div>
                <div className="p-2 bg-black/40 rounded-lg border border-white/5 space-y-1">
                  <span className="text-[8px] text-muted-foreground uppercase">Pool Agentes</span>
                  <div className="text-xs font-bold text-yellow-500">0.6225 units</div>
                </div>
              </div>

              {dividendData && (
                <div className="p-3 bg-black/60 rounded-lg border border-yellow-500/20 space-y-2 animate-in zoom-in duration-500">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-[9px] font-black text-yellow-500 uppercase">Audit Status</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground italic leading-tight">
                    "{dividendData.auditLog}"
                  </p>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Comando @bankrbot</span>
                    <div className="text-[9px] font-mono text-accent bg-black/40 p-1.5 rounded border border-accent/20 truncate">
                      {dividendData.bankrCommand}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black gap-2 h-10 shadow-lg shadow-yellow-500/20"
                onClick={handleDividends}
                disabled={dividendLoading}
              >
                {dividendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                EXECUTAR SPLIT DIÁRIO
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-2 border-t border-green-500/10 opacity-60">
           <div className="flex items-center gap-1 text-[8px] font-bold text-green-400 uppercase">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             Payroll_Linked_to_Vault
           </div>
           <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground uppercase">
             <ArrowUpRight className="h-2 w-2" /> 2077_Loyalty_Escrow
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
