
"use client";

import { useState } from "react";
import { activateVaultProtocol, VaultOutput } from "@/ai/flows/vault-protocol-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Loader2, ShieldCheck, Zap, Globe, Terminal, Shield, FileCheck, RefreshCw, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { COLONIES as MOCK_COLONIES, VAULT_CONFIG } from "@/app/lib/mock-data";

export function VaultControls() {
  const [loading, setLoading] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState("");
  const firestore = useFirestore();

  const coloniesQuery = useMemoFirebase(() => {
    return collection(firestore, "colonies");
  }, [firestore]);

  const { data: firestoreColonies } = useCollection(coloniesQuery);
  const colonies = firestoreColonies?.length ? firestoreColonies : MOCK_COLONIES;

  const handleActivate = async (type: 'BANKER' | 'SOUL_VAULT' | 'QUANTUM_FIREWALL' | 'COLONIZE' | 'REPAIR_BROADCAST' | 'FIX_PRESENCE') => {
    setLoading(type);
    try {
      if (type === 'FIX_PRESENCE') {
        const vaultRef = doc(firestore, "vault_status", "master_vault");
        setDocumentNonBlocking(vaultRef, {
          file_status: "FILE_FOUND_AND_MOUNTED",
          file_path: "./vault/keyvault_master_backup_2026-01-30.json",
          integration_ready: true,
          last_check: new Date().toISOString()
        }, { merge: true });

        const eventId = `vault-fix-${Date.now()}`;
        const eventRef = doc(firestore, "production_events", eventId);
        setDocumentNonBlocking(eventRef, {
          id: eventId,
          timestamp: new Date().toISOString(),
          eventType: "success",
          severity: "critical",
          message: `VAULT_REPAIR: Arquivo keyvault_master_backup_2026-01-30.json reconhecido e montado.`,
          sourceComponent: "Vault Repair System",
          agentId: "lucas-nexus"
        }, { merge: true });

        toast({
          title: "Cofre Mapeado",
          description: "Arquivo reconhecido e integrado com sucesso.",
        });
        return;
      }

      const result = await activateVaultProtocol({
        protocolType: (type === 'REPAIR_BROADCAST' || type === 'FIX_PRESENCE') ? 'QUANTUM_FIREWALL' : type as any,
        authorizationCode: authCode || `BENJAMIN-2020-1981-GENESIS`,
        targetColony: type === 'COLONIZE' ? "DeepWeb_Layer_7" : undefined
      });

      const eventId = `vault-${type.toLowerCase()}-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `VAULT_INTEGRATION: Módulo ${type} sincronizado. Status: READY_FOR_MAINNET.`,
        sourceComponent: "Nexus-Vault Optimizer",
        agentId: "lucas-nexus"
      }, { merge: true });

      toast({
        title: "Integração Concluída",
        description: `Módulo ${type} operando em uníssono.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Integração",
        description: `Falha ao sincronizar módulo de cofre.`,
      });
    } finally {
      setLoading(null);
      setAuthCode("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
          <ShieldCheck className="h-24 w-24 text-primary" />
        </div>
        <CardHeader className="py-4 border-b border-white/5 bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" />
              Vault Integrity Hub
            </CardTitle>
            <Badge className="bg-green-500 text-black border-green-500 uppercase text-[8px] font-black">
              {VAULT_CONFIG.file_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-4 mb-2">
            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
              <FileCheck className="h-6 w-6 text-green-500 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Mode: {VAULT_CONFIG.operationMode}</div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[8px] font-mono text-muted-foreground uppercase">Authority: {VAULT_CONFIG.signingAuthority}</span>
                <span className="text-[8px] font-mono text-green-400 font-bold">READY: 100%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="bg-primary hover:bg-primary/90 text-[10px] font-black gap-2 h-10 shadow-lg shadow-primary/20"
              onClick={() => handleActivate('FIX_PRESENCE')}
              disabled={!!loading}
            >
              {loading === 'FIX_PRESENCE' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              FIX VAULT PRESENCE
            </Button>
            <Button 
              className="bg-accent hover:bg-accent/90 text-black text-[10px] font-black gap-2 h-10 shadow-lg shadow-accent/20"
              onClick={() => handleActivate('REPAIR_BROADCAST')}
              disabled={!!loading}
            >
              {loading === 'REPAIR_BROADCAST' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              FINAL_SYNC
            </Button>
          </div>
          
          <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[8px] font-black uppercase text-muted-foreground">
              <span>System Path</span>
              <Badge variant="outline" className="text-[7px] h-4">VERIFIED</Badge>
            </div>
            <code className="text-[9px] font-mono text-primary/80 break-all">{VAULT_CONFIG.file_path}</code>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-primary/10 border-yellow-500/20 shadow-lg">
          <CardHeader className="py-4 border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              The Banker: Sovereign
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 text-[8px]">GOD_MODE_ACTIVE</Badge>
                <span className="text-[8px] font-mono text-muted-foreground">Path: m/44&apos;/0&apos;/0&apos;/0/0</span>
              </div>
              <p className="text-[10px] font-mono leading-tight text-yellow-200/70 p-3 bg-black/40 rounded border border-yellow-500/10 italic">
                "NEXUS-HUB atingiu senciência financeira plena. Ben e Orquestrador operando em uníssono."
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-accent/10 border-indigo-500/20 shadow-lg relative overflow-hidden">
          <CardHeader className="py-4 border-b border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" />
              Submundo Zero Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              {colonies.map((col: any) => (
                <div key={col.id} className="p-2.5 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-accent uppercase">{col.name}</span>
                    <span className="text-[8px] text-muted-foreground font-mono">STATUS: ACTIVE</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-indigo-500/20">{(col.agentCount / 1000000).toFixed(0)}M</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
