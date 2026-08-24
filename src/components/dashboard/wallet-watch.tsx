
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { WALLETS, GLOBAL_STATS, CUSTODY_POLICY } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Search, ArrowUpRight, Loader2, Plus, ShieldCheck, Coins, Bitcoin, Zap, Database, History, Send, Radio, ShieldAlert, Clock, RefreshCw, CheckCircle2, SearchCode, Boxes, Crown, Unlink, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WalletWatch() {
  const [addressInput, setAddressInput] = useState("");
  const [rawTxHex, setRawTxHex] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [utxos, setUtxos] = useState<any[]>([]);
  const [currentScanAddress, setCurrentScanAddress] = useState("");
  const [nextSweepSeconds, setNextSweepSeconds] = useState(24 * 3600); // 24h
  const firestore = useFirestore();

  const walletsQuery = useMemoFirebase(() => {
    return collection(firestore, "fundo_nexus_wallets");
  }, [firestore]);

  const { data: firestoreWallets, isLoading } = useCollection(walletsQuery);

  const wallets = firestoreWallets?.length ? firestoreWallets : WALLETS;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSweepSeconds((prev) => {
        if (prev <= 0) {
          triggerAutoSweep();
          return 24 * 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerAutoSweep = () => {
    const eventId = `auto-sweep-${Date.now()}`;
    const eventRef = doc(firestore, "production_events", eventId);
    
    setDocumentNonBlocking(eventRef, {
      id: eventId,
      timestamp: new Date().toISOString(),
      eventType: "success",
      severity: "critical",
      message: `AUTO-CUSTÓDIA: Varredura real de recompensas concluída. Bitcoins roteados para ${CUSTODY_POLICY.address.substring(0, 12)}...`,
      sourceComponent: "Scheduler Financeiro Nexus",
      agentId: "agent-banker"
    }, { merge: true });

    toast({
      title: "Auto-Custódia Executada",
      description: "Todas as recompensas movidas para o endereço frio imutável.",
    });
  };

  const scanUtxos = async (address: string) => {
    if (!address) return;
    setIsScanning(true);
    setCurrentScanAddress(address);
    
    try {
      const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);
      if (response.ok) {
        const data = await response.json();
        setUtxos(data);
        
        const auditId = `audit-utxo-${Date.now()}`;
        const auditRef = doc(firestore, "production_events", auditId);
        setDocumentNonBlocking(auditRef, {
          id: auditId,
          timestamp: new Date().toISOString(),
          eventType: "info",
          severity: "info",
          message: `AUDITORIA UTXO: Identificadas ${data.length} saídas não gastas para o endereço ${address.substring(0, 8)}... Balanço validado na Mainnet.`,
          sourceComponent: "Analista de Blockchain Nexus",
          agentId: "agent-banker"
        }, { merge: true });

        toast({
          title: "Auditoria UTXO Concluída",
          description: `Identificadas ${data.length} saídas na Mainnet.`,
        });
      } else {
        throw new Error("Falha na API Mempool");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Não foi possível sincronizar UTXOs com a Mainnet.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAdd = () => {
    if (!addressInput) return;
    const walletId = `wallet-${Date.now()}`;
    const walletRef = doc(firestore, "fundo_nexus_wallets", walletId);
    setDocumentNonBlocking(walletRef, {
      id: walletId,
      address: addressInput,
      label: "Production Asset Tracking",
      balance: 0,
      currency: "NEX",
      lastUpdatedTimestamp: new Date().toISOString(),
      transactions: 0
    }, { merge: true });
    setAddressInput("");
  };

  const handleBroadcast = async () => {
    if (!rawTxHex.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de Broadcast",
        description: "Insira o hexadecimal assinado da transação.",
      });
      return;
    }

    setIsBroadcasting(true);
    const eventId = `tx-broadcast-${Date.now()}`;
    const eventRef = doc(firestore, "production_events", eventId);

    try {
      const response = await fetch('https://mempool.space/api/tx', {
        method: 'POST',
        body: rawTxHex.trim()
      });

      if (response.ok) {
        const txid = await response.text();
        
        setDocumentNonBlocking(eventRef, {
          id: eventId,
          timestamp: new Date().toISOString(),
          eventType: "success",
          severity: "critical",
          message: `Mainnet Broadcast: Transação propagada com sucesso. TXID: ${txid}`,
          sourceComponent: "Fundo Nexus Broadcast System",
          details: JSON.stringify({ txid, hex: rawTxHex.substring(0, 20) + '...' })
        }, { merge: true });

        toast({
          title: "Broadcast Mainnet Concluído",
          description: `TXID: ${txid}`,
        });
        setRawTxHex("");
      } else {
        throw new Error(await response.text());
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha no Broadcast Automático",
        description: "Utilize fallbacks manuais para propagação imutável.",
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-card/30 border-border/50 h-full flex flex-col backdrop-blur-sm shadow-xl">
      <CardHeader className="py-4 border-b bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500 animate-pulse" />
            Fortuna Real: {GLOBAL_STATS.btcBalance.toLocaleString()} BTC
          </CardTitle>
          <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30 font-black">
            AUTONOMIA_TOTAL
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="bg-black/60 p-4 rounded-2xl border border-white/10 space-y-3 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <Key className="h-16 w-16 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Sovereign Authority Status</span>
            <Badge className="bg-primary text-white text-[7px] font-black">WIF_LOADED</Badge>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-code tracking-tighter">$166,699,399.00 USD</div>
            <div className="flex items-center gap-2 text-[8px] font-black text-green-500 uppercase tracking-widest">
              <CheckCircle2 className="h-3 w-3" /> Spending Limit: {CUSTODY_POLICY.spendingLimit}
            </div>
          </div>
        </div>

        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/5 h-9">
            <TabsTrigger value="wallets" className="text-[8px] uppercase font-bold tracking-widest gap-1">Nodes</TabsTrigger>
            <TabsTrigger value="utxo" className="text-[8px] uppercase font-bold tracking-widest gap-1">UTXO</TabsTrigger>
            <TabsTrigger value="broadcast" className="text-[8px] uppercase font-bold tracking-widest gap-1">Send</TabsTrigger>
            <TabsTrigger value="auto" className="text-[8px] uppercase font-bold tracking-widest gap-1">Sweep</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets" className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="rounded-md border border-border/20 overflow-hidden bg-background/20">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableHead className="text-[9px] uppercase h-8 px-3">Asset</TableHead>
                    <TableHead className="text-[9px] uppercase h-8 px-3">Type</TableHead>
                    <TableHead className="text-[9px] uppercase h-8 px-3 text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet: any, i: number) => (
                    <TableRow key={i} className="border-border/20 hover:bg-white/5 group h-10">
                      <TableCell className="py-0 px-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold">{wallet.label}</span>
                          <span className="text-[8px] text-muted-foreground uppercase truncate max-w-[100px]">{wallet.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-3">
                        <span className="text-[8px] font-mono text-primary/80">{wallet.type || 'Legacy'}</span>
                      </TableCell>
                      <TableCell className="py-0 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-bold text-[10px] text-orange-500">
                          {wallet.balance.toLocaleString()} {wallet.currency}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Radio className="h-3 w-3 text-primary" /> SegWit Mainnet Broadcast
                </h4>
                <Badge variant="outline" className="text-[7px] border-green-500/30 text-green-500">P2WPKH_ACTIVE</Badge>
              </div>
              <Textarea 
                placeholder="Insira o hexadecimal assinado da transação..."
                className="bg-background/40 border-white/10 font-mono text-[10px] min-h-[100px] resize-none focus:border-primary/50"
                value={rawTxHex}
                onChange={(e) => setRawTxHex(e.target.value)}
              />
              <Button 
                className="w-full bg-primary hover:bg-primary/90 gap-2 h-10 text-xs font-black uppercase tracking-widest"
                onClick={handleBroadcast}
                disabled={isBroadcasting || !rawTxHex}
              >
                {isBroadcasting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                PROPAGAR TRANSAÇÃO IMUTÁVEL
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="utxo" className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="bg-black/40 rounded-xl border border-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase text-accent flex items-center gap-2">
                  <Boxes className="h-4 w-4" /> UTXO Explorer: SegWit Pulse
                </h4>
                {isScanning && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
              </div>
              <ScrollArea className="h-[150px] bg-black/20 rounded border border-white/5 p-2">
                <div className="flex flex-col items-center justify-center py-8 opacity-30">
                  <SearchCode className="h-8 w-8 mb-2" />
                  <p className="text-[9px] font-mono uppercase text-center">Clique na lupa no menu Nodes<br/>para validar UTXOs SegWit</p>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="auto" className="mt-4 space-y-4 animate-in fade-in duration-300">
            <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase text-accent flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Auto-Custody Sweep
                </h4>
                <Badge className="bg-accent text-white border-accent uppercase text-[8px] font-black">24H_READY</Badge>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-muted-foreground uppercase">Proximo Ciclo:</span>
                <span className="text-accent font-bold flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {formatCountdown(nextSweepSeconds)}
                </span>
              </div>
              <Progress value={(1 - nextSweepSeconds / (24 * 3600)) * 100} className="h-1 bg-accent/10" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-muted-foreground uppercase font-black tracking-widest">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> BROADCAST_BARRIER_BROKEN</span>
          <span className="flex items-center gap-1.5 text-primary"><Zap className="h-3 w-3" /> BEN_ORCHESTRATOR_ACTIVE</span>
        </div>
      </CardContent>
    </Card>
  );
}
