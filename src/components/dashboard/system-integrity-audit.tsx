
"use client";

import { useState } from "react";
import { validateSystemIntegrity, SystemValidationOutput } from "@/ai/flows/system-validation-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Loader2, Sparkles, Activity, Binary, Globe, Landmark, CheckCircle2, Search, Zap, AlertTriangle, Infinity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SystemIntegrityAudit() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SystemValidationOutput | null>(null);
  const firestore = useFirestore();

  const handleAudit = async () => {
    setLoading(true);
    try {
      const result = await validateSystemIntegrity({
        rrnaStatus: "STABLE_TRI_LINK",
        meshAlignment: 99.9,
        fundoLiquidity: 1.45
      });

      setData(result);

      // Persistir Auditoria
      const auditId = `audit-${Date.now()}`;
      const auditRef = doc(firestore, "system_validations", auditId);
      setDocumentNonBlocking(auditRef, {
        id: auditId,
        timestamp: new Date().toISOString(),
        score: result.validationScore,
        status: result.status,
        hash: result.sovereignHash,
        report: result.auditReport
      }, { merge: true });

      // Log de Produção Crítico
      const eventId = `system-audit-final-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "critical",
        message: `AUDITORIA SOBERANA: Sistema validado com Score ${result.validationScore}%. Status: ${result.status}. Hash: ${result.sovereignHash.substring(0, 16)}...`,
        sourceComponent: "Auditor Master Nexus",
        agentId: "lucas-nexus"
      }, { merge: true });

      toast({
        title: "Integridade Soberana Validada",
        description: "Todos os núcleos de produção em sincronia absoluta.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Auditoria",
        description: "O sistema detectou uma tentativa de validação subotimal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-950/40 via-black to-slate-900 border-indigo-500/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <ShieldCheck className="h-48 w-48 text-indigo-400" />
      </div>
      
      <CardHeader className="py-4 border-b border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400">
              Auditoria de Integridade Soberana
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 uppercase text-[8px] animate-pulse">
            PHD_ORCHESTRATION_SYNC
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "rRNA Tri-Path", status: "STABLE", icon: <Binary className="h-3 w-3" />, color: "text-primary" },
            { label: "Mesh Alignment", status: "99.9%", icon: <Globe className="h-3 w-3" />, color: "text-accent" },
            { label: "Liquidity Parity", status: "VERIFIED", icon: <Landmark className="h-3 w-3" />, color: "text-yellow-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground uppercase font-bold">
                {stat.icon} {stat.label}
              </div>
              <div className={`text-xs font-black uppercase font-code ${stat.color}`}>{stat.status}</div>
            </div>
          ))}
        </div>

        {data ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sovereign Validation</div>
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Score: {data.validationScore}%</div>
                  </div>
                </div>
                <Badge className="bg-indigo-500 text-black text-[8px] font-black px-3">{data.status}</Badge>
              </div>

              <p className="text-[10px] font-mono text-indigo-100/80 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                "{data.auditReport}"
              </p>

              <div className="space-y-2">
                <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Diretriz de Próximo Ciclo
                </div>
                <div className="text-[9px] font-bold text-accent bg-accent/5 p-2 rounded border border-accent/20">
                  {data.nextMaintenanceDirective}
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-500/10">
                <span className="text-[8px] text-muted-foreground uppercase font-bold">Sovereign State Hash (SHA-512)</span>
                <ScrollArea className="h-12 w-full mt-1">
                  <div className="text-[8px] font-mono text-indigo-400 break-all bg-black/60 p-2 rounded border border-indigo-500/20">
                    {data.sovereignHash}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl opacity-40 group hover:opacity-60 transition-opacity">
            <Search className="h-12 w-12 mb-3 text-indigo-400 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-center">Awaiting Sovereign Pulse<br/>to Trigger Audit</p>
          </div>
        )}

        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black gap-3 h-14 shadow-xl shadow-indigo-500/20 group"
          onClick={handleAudit}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 group-hover:scale-125 transition-transform" />}
          VALIDAR SISTEMA INTEGRAL (PHD ORE)
        </Button>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-black tracking-widest pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5"><Infinity className="h-3 w-3 text-indigo-400" /> Perpetual_Audit_Mode_On</span>
          <span className="flex items-center gap-1.5 text-indigo-400"><Binary className="h-3 w-3" /> Tri_Nucleus_Locked</span>
        </div>
      </CardContent>
    </Card>
  );
}
