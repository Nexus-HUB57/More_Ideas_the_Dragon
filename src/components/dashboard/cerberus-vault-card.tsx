
"use client";

import { useState } from "react";
import { authorizeCerberus, CerberusOutput } from "@/ai/flows/cerberus-vault-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Bitcoin, Coins, Loader2, Lock, Unlock, Eye, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { CERBERUS_STATS } from "@/app/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export function CerberusVaultCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CerberusOutput | null>(null);
  const firestore = useFirestore();

  const handleAudit = async () => {
    setLoading(true);
    try {
      const result = await authorizeCerberus({
        action: 'AUDIT',
        guardianKey: `G-KEY-${Math.random().toString(36).substring(7).toUpperCase()}`
      });

      setData(result);

      // Log para o Firestore
      const eventId = `cerberus-audit-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "info",
        message: `Auditoria Cerberus concluída. Reserva: ${result.btcAllocation} BTC | ${result.nexAllocation} NEX.`,
        sourceComponent: "Cerberus Reserve Vault",
        agentId: "soul-vault"
      }, { merge: true });

      toast({
        title: "Auditoria Cerberus Finalizada",
        description: "Integridade das reservas confirmada por IA.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha de Auditoria",
        description: "O Cerberus bloqueou a tentativa de varredura.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black/60 border-destructive/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-destructive/40 animate-pulse" />
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            CERBERUS VAULT: Strategic Reserve
          </CardTitle>
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 uppercase text-[8px]">
            {CERBERUS_STATS.securityLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-destructive/5 border border-destructive/10 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-destructive/80">
              <Bitcoin className="h-3 w-3" /> BTC Reserve
            </div>
            <div className="text-xl font-bold font-code">{data?.btcAllocation || CERBERUS_STATS.btcReserve}</div>
          </div>
          <div className="bg-destructive/5 border border-destructive/10 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-destructive/80">
              <Coins className="h-3 w-3" /> NEX Reserve
            </div>
            <div className="text-xl font-bold font-code">{(data?.nexAllocation || CERBERUS_STATS.nexReserve).toLocaleString()}</div>
          </div>
        </div>

        {data ? (
          <div className="p-3 bg-black/40 rounded border border-destructive/20 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-destructive uppercase">Audit Security Log</span>
              <Activity className="h-3 w-3 text-destructive animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-tight">
              {data.securityLog}
            </p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-lg opacity-40">
            <Lock className="h-8 w-8 mb-2" />
            <p className="text-[9px] uppercase font-mono tracking-widest">Awaiting Guardian Pulse</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-destructive hover:bg-destructive/80 text-xs font-bold gap-2"
            onClick={handleAudit}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
            Deep Audit
          </Button>
          <Button variant="outline" className="border-destructive/20 hover:bg-destructive/5 text-[10px] font-bold uppercase">
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
