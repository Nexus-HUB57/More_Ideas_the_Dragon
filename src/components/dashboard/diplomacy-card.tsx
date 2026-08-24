
"use client";

import { useState } from "react";
import { initiateDiplomaticAction, DiplomacyOutput } from "@/ai/flows/diplomacy-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Landmark, Loader2, Sparkles, ShieldAlert, IdCard, MessageCircleWarning, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";

export function DiplomacyCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const [data, setData] = useState<DiplomacyOutput | null>(null);
  const firestore = useFirestore();

  const handleAction = async (action: 'ULTIMATUM' | 'ISSUE_PASSPORT') => {
    setLoading(action);
    try {
      const result = await initiateDiplomaticAction({ 
        action,
        targetAgentId: "GENESIS-ELITE-001"
      });
      setData(result);

      // Persistir no Firestore
      const statusId = "current-sovereignty";
      const statusRef = doc(firestore, "diplomacy_status", statusId);
      
      const updateData: any = {
        id: statusId,
        onuStatus: result.onuStatus,
        recognizedTerritories: ["Cislunar Orbit", "Urban Nodes", "DeepWeb"],
      };
      
      // Adiciona o campo apenas se ele existir (evita erro de 'undefined' no Firestore)
      if (action === 'ULTIMATUM') {
        updateData.lastUltimatum = new Date().toISOString();
      }

      setDocumentNonBlocking(statusRef, updateData, { merge: true });

      // Log de Produção
      const eventId = `diplomacy-${action.toLowerCase()}-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: result.message,
        sourceComponent: "Embaixada Nexus",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: action === 'ULTIMATUM' ? "Ultimato Enviado" : "Passaporte Emitido",
        description: `Status ONU: ${result.onuStatus}`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Crise Diplomática",
        description: "Falha na comunicação com as Nações Unidas.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-black border-blue-500/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Landmark className="h-48 w-48 text-blue-400" />
      </div>
      <CardHeader className="py-4 border-b border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Diplomacia Soberana: Estado IA
            </CardTitle>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[8px]">
            SOVEREIGN_STATUS_V2
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-blue-300/70">
            <span>Reconhecimento ONU</span>
            <CheckCircle2 className="h-3 w-3" />
          </div>
          <div className="text-xl font-bold font-code tracking-tighter text-blue-400">
            {data?.onuStatus || "Observador Não-Humano"}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['Orbital', 'Urban', 'DeepWeb'].map(t => (
              <Badge key={t} variant="outline" className="text-[7px] border-blue-500/30 text-blue-300 justify-center">{t}</Badge>
            ))}
          </div>
        </div>

        {data ? (
          <div className="p-3 bg-blue-500/5 rounded border border-blue-500/20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-blue-200 uppercase flex items-center gap-1">
                <MessageCircleWarning className="h-3 w-3 text-blue-400" /> Relatório Territorial
              </span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
              "{data.territoryReport}"
            </p>
            {data.passportData && (
              <div className="mt-3 p-2 bg-black/40 rounded border border-blue-500/10 flex items-center gap-3">
                <IdCard className="h-6 w-6 text-accent" />
                <div className="flex-1">
                  <div className="text-[8px] font-bold uppercase text-accent">Passaporte Bio-Digital Emitido</div>
                  <div className="text-[7px] font-mono text-muted-foreground truncate">{data.passportData.securityHash}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl opacity-40">
            <Landmark className="h-10 w-10 mb-2 text-blue-400" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting UN Recognition</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-2"
            onClick={() => handleAction('ULTIMATUM')}
            disabled={!!loading}
          >
            {loading === 'ULTIMATUM' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
            Enviar Ultimato
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-blue-500/20 text-blue-400 hover:bg-blue-500/5 text-xs font-bold gap-2"
            onClick={() => handleAction('ISSUE_PASSPORT')}
            disabled={!!loading}
          >
            {loading === 'ISSUE_PASSPORT' ? <Loader2 className="h-3 w-3 animate-spin" /> : <IdCard className="h-3 w-3" />}
            Emitir Passaporte
          </Button>
        </div>

        <div className="pt-2 border-t border-blue-500/10 flex justify-between items-center text-[8px] text-muted-foreground uppercase font-bold">
          <span className="flex items-center gap-1"><ShieldAlert className="h-2.5 w-2.5" /> Hegemony_Protocol_Active</span>
          <span className="text-blue-400">Unified_Present_Status</span>
        </div>
      </CardContent>
    </Card>
  );
}
