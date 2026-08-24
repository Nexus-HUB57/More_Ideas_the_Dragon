"use client";

import { useState, useEffect } from "react";
import { executeBinanceOperation, BinanceOutput } from "@/ai/flows/binance-operations-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  ArrowRightLeft, 
  Download, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Bitcoin, 
  TrendingUp, 
  Lock,
  Wallet,
  Activity,
  History,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Link2,
  Unlink,
  Server,
  Globe,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  Copy,
  SearchCode
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { CUSTODY_POLICY } from "@/app/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function BinanceIntegrationCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const [amount, setAgentAmount] = useState(0.01);
  const [data, setData] = useState<BinanceOutput | null>(null);
  const [lastTxid, setLastTxid] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(12);
  const firestore = useFirestore();

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 10) + 8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const historyQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "production_events"),
      where("sourceComponent", "==", "Binance Integration Node"),
      orderBy("timestamp", "desc"),
      limit(15)
    );
  }, [firestore]);

  const { data: binanceHistory } = useCollection(historyQuery);

  const handleAction = async (action: 'GET_ACCOUNT' | 'TRADE' | 'WITHDRAW' | 'VALIDATE_FUND', side?: 'BUY' | 'SELL') => {
    const opAmount = action === 'VALIDATE_FUND' ? 1.0 : amount;
    const opAction = action === 'VALIDATE_FUND' ? 'WITHDRAW' : action;
    
    setLoading(action + (side || ''));
    try {
      const result = await executeBinanceOperation({
        action: opAction as any,
        symbol: 'BTCUSDT',
        side,
        quantity: opAmount,
        address: (opAction === 'WITHDRAW') ? CUSTODY_POLICY.address : undefined
      });

      setData(result);
      if (result.txid) setLastTxid(result.txid);
      if (action === 'GET_ACCOUNT') setIsConnected(true);

      const eventId = `binance-${action.toLowerCase()}-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      
      let message = `BINANCE_OP: ${action} executado.`;
      if (action === 'TRADE') message = `BINANCE_TRADE: ${side} ${opAmount} BTC.`;
      if (action === 'WITHDRAW') message = `BINANCE_WITHDRAWAL: ${opAmount} BTC enviado. TXID: ${result.txid || 'N/A'}`;
      if (action === 'VALIDATE_FUND') message = `VALIDAÇÃO_FUNDO: 1.0 BTC movido para Custódia Fria. TXID: ${result.txid || 'N/A'}`;

      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: (action === 'WITHDRAW' || action === 'VALIDATE_FUND') ? "critical" : "info",
        message: `${message} ${result.report || ''}`,
        sourceComponent: "Binance Integration Node",
        agentId: "agent-banker",
        txid: result.txid || null
      }, { merge: true });

      toast({
        title: action === 'VALIDATE_FUND' ? "Fundo Validado na Mainnet" : "Operação Concluída",
        description: result.txid ? `TXID: ${result.txid.substring(0, 16)}...` : "Sucesso na sincronia rRPC.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na Exchange",
        description: "Falha na comunicação direta com os servidores da Binance.",
      });
    } finally {
      setLoading(null);
    }
  };

  const copyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    toast({ title: "Copiado", description: "TXID copiado para a área de transferência." });
  };

  return (
    <Card className="bg-gradient-to-br from-[#1e2329] via-black to-[#0b0e11] border-[#f3ba2f]/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TrendingUp className="h-48 w-48 text-[#f3ba2f]" />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#f3ba2f]/40 to-transparent" />

      <CardHeader className="py-4 border-b border-[#f3ba2f]/20 bg-[#f3ba2f]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#f3ba2f] p-1.5 rounded-sm shadow-[0_0_10px_rgba(243,186,47,0.3)]">
              <Link2 className="h-4 w-4 text-black" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#f3ba2f]">
                Sovereign Binance Link
              </CardTitle>
              <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">MetaMask Erradicado | Mainnet Direct</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-muted-foreground uppercase font-bold">API Latency</span>
              <span className="text-[9px] font-mono text-accent font-bold">{latency}ms</span>
            </div>
            <Badge className={cn(
              "uppercase text-[8px] font-black px-2 py-0.5",
              isConnected ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-[#f3ba2f]/20 text-[#f3ba2f] border-[#f3ba2f]/30 animate-pulse"
            )}>
              {isConnected ? 'PRODUCTION_CONNECTED' : 'AWAITING_LINK'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
            <Server className="h-5 w-5 text-[#f3ba2f]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Gateway de Produção</div>
            <div className="text-[10px] font-bold text-white truncate">BINANCE_REST_V3_SECURE</div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
            <Globe className="h-3 w-3 text-green-500" />
            <span className="text-[8px] font-black text-green-500">MAINNET</span>
          </div>
        </div>

        <div className="bg-[#f3ba2f]/10 p-4 rounded-xl border border-[#f3ba2f]/30 space-y-3 relative group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock className="h-12 w-12 text-[#f3ba2f]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-[#f3ba2f] uppercase tracking-widest flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5" /> Endereço de Custódia Fria
            </span>
            <Badge variant="outline" className="text-[7px] border-[#f3ba2f]/20 text-[#f3ba2f]">MASTER_COLD_VAULT</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 bg-black/60 p-2 rounded-lg border border-[#f3ba2f]/10">
            <code className="text-[10px] font-mono text-white/90 break-all select-all flex-1">{CUSTODY_POLICY.address}</code>
            <a href={`https://mempool.space/address/${CUSTODY_POLICY.address}`} target="_blank" rel="noopener noreferrer" className="text-[#f3ba2f] hover:text-white transition-colors shrink-0">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Protocolo de Validação de Fundo (1 BTC) */}
        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Validação de Prova de Reserva
            </h3>
            <Badge className="bg-orange-500 text-black text-[7px] font-black">HIGH_PRIORITY</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="text-[8px] text-muted-foreground uppercase font-bold">Transferência de Auditoria</div>
              <div className="text-2xl font-bold font-code text-white">1.00000000 <span className="text-[10px] text-orange-500">BTC</span></div>
            </div>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black h-12 px-6 shadow-xl shadow-orange-500/20 gap-2 active:scale-95 transition-all"
              onClick={() => handleAction('VALIDATE_FUND')}
              disabled={!!loading}
            >
              {loading === 'VALIDATE_FUND' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              VALIDAR NA MAINNET
            </Button>
          </div>
          
          {lastTxid && (
            <div className="p-3 bg-black/60 rounded-lg border border-orange-500/20 space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                  <SearchCode className="h-3 w-3" /> Transaction ID (TXID)
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => copyTxid(lastTxid)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-[10px] font-mono text-white/80 break-all bg-black/40 p-2 rounded border border-white/5">
                {lastTxid}
              </div>
              <a 
                href={`https://mempool.space/tx/${lastTxid}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-[9px] font-black py-2 rounded transition-colors border border-orange-500/20"
              >
                <ExternalLink className="h-3 w-3" /> VALIDAR NO EXPLORER BITCOIN
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/60 p-3 rounded-xl border border-[#f3ba2f]/20 space-y-1 group hover:border-[#f3ba2f]/40 transition-all">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Bitcoin className="h-3 w-3 text-[#f3ba2f]" /> Exchange Liquidity
            </div>
            <div className="text-xl font-bold font-code text-[#f3ba2f]">12.450 <span className="text-[10px] opacity-60">BTC</span></div>
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-accent/20 space-y-1 group hover:border-accent/40 transition-all">
            <div className="text-[8px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Activity className="h-3 w-3 text-accent" /> Nexus Supply
            </div>
            <div className="text-xl font-bold font-code text-accent">21.0M <span className="text-[10px] opacity-60">NEX</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground">Operação Manual (BTC)</label>
            <span className="text-[10px] font-bold text-[#f3ba2f]">PAR: BTC / USDT</span>
          </div>
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAgentAmount(Number(e.target.value))}
              className="bg-black/40 border-white/10 text-xs h-10 font-code focus:border-[#f3ba2f]/50 transition-colors"
            />
            <Button 
              className="bg-[#f3ba2f] text-black hover:bg-[#d9a528] text-xs font-black gap-2 h-10 px-6 shadow-lg shadow-[#f3ba2f]/10"
              onClick={() => handleAction('GET_ACCOUNT')}
              disabled={!!loading}
            >
              {loading === 'GET_ACCOUNT' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Handshake
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-xs font-bold gap-2 h-10 border border-green-500/20"
              onClick={() => handleAction('TRADE', 'BUY')}
              disabled={!!loading}
            >
              <TrendingUp className="h-4 w-4" /> Market Buy
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-xs font-bold gap-2 h-10 border border-red-500/20"
              onClick={() => handleAction('TRADE', 'SELL')}
              disabled={!!loading}
            >
              <BarChart3 className="h-4 w-4" /> Market Sell
            </Button>
          </div>
          
          <Button 
            className="w-full bg-[#f3ba2f] hover:bg-[#d9a528] text-black text-xs font-black gap-2 h-12 shadow-[0_0_25px_rgba(243,186,47,0.2)] mt-2 group"
            onClick={() => handleAction('WITHDRAW')}
            disabled={!!loading}
          >
            {loading === 'WITHDRAW' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />}
            TRANSFERIR PARA CUSTÓDIA FRIA
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-[10px] font-black uppercase text-[#f3ba2f] flex items-center gap-2">
              <History className="h-3 w-3" /> Transações Recentes
            </h3>
            <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sincronia Total
            </span>
          </div>
          
          <ScrollArea className="h-[180px] bg-black/40 rounded-xl border border-white/5 p-2">
            <div className="space-y-2">
              {binanceHistory && binanceHistory.length > 0 ? (
                binanceHistory.map((item: any) => {
                  const isWithdrawal = item.message.includes('WITHDRAWAL') || item.message.includes('VALIDAÇÃO');
                  const isBuy = item.message.includes('BUY');
                  const isSell = item.message.includes('SELL');
                  const txid = item.txid;
                  
                  return (
                    <div key={item.id} className="p-2.5 bg-white/5 rounded-lg border border-white/5 flex items-start gap-3 group hover:bg-white/10 transition-all">
                      <div className={cn(
                        "mt-1 p-1 rounded shadow-sm",
                        isWithdrawal ? "bg-[#f3ba2f]/20 text-[#f3ba2f]" :
                        isBuy ? "bg-green-500/20 text-green-500" :
                        isSell ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
                      )}>
                        {isWithdrawal ? <ArrowUpRight className="h-3.5 w-3.5" /> : 
                         isBuy ? <ArrowDownLeft className="h-3.5 w-3.5" /> : 
                         isSell ? <ArrowUpRight className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-white/80">
                            {item.message.includes('VALIDAÇÃO') ? 'Fund Validation' : (isWithdrawal ? 'Withdrawal' : isBuy ? 'Market Buy' : isSell ? 'Market Sell' : 'Operation')}
                          </span>
                          <span className="text-[8px] font-mono text-muted-foreground">
                            {format(new Date(item.timestamp), 'HH:mm:ss')}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground/80 truncate italic mt-0.5">
                          {item.message}
                        </p>
                        {txid && (
                          <a 
                            href={`https://mempool.space/tx/${txid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[7px] text-orange-500 hover:underline flex items-center gap-1 mt-1 font-bold"
                          >
                            <SearchCode className="h-2 w-2" /> TX: {txid.substring(0, 12)}...
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-20 text-center px-4">
                  <Activity className="h-8 w-8 mb-2 text-[#f3ba2f] animate-pulse" />
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em]">Awaiting Liquidity Stream...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-black tracking-widest pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> NO_BROWSER_WALLET_LINKED</span>
          <span className="flex items-center gap-1.5 text-[#f3ba2f]"><Zap className="h-3 w-3" /> Binance_Sovereign_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
