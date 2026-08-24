
"use client";

import { useState } from "react";
import { triggerStartupGenesis, auditShadowAction, verifyDailyCheckSum, monitorComplianceDiscrepancy, StartupGenesisOutput, DailyCheckSumOutput } from "@/ai/flows/startup-genesis-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, Loader2, Sparkles, ShieldCheck, Coins, Database, Activity, Target, Fingerprint, TrendingUp, AlertTriangle, Crosshair, Users, Timer, ShieldAlert, Eye, ShieldX, CheckCircle2, Milestone, CalendarDays, ClipboardCheck, ArrowUpRight, BellRing, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const SPRINT_ROADMAP = [
  { week: 1, title: "Núcleo & Handshake", description: "Hardware abstraction e Integração Lightning." },
  { week: 2, title: "Ribossomo de Dados", description: "Matriz W_rRNA em tempo real e Self-Healing." },
  { week: 3, title: "Fundo & Governança", description: "Smart Contracts e Compliance Sumaré." },
  { week: 4, title: "Manifesto Bio-Digital", description: "Interatividade AI-to-AI e Nível 1 de Senciência." }
];

export function StartupGenesisCard() {
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [checkingSum, setCheckingSum] = useState(false);
  const [triggeringMGC, setTriggeringMGC] = useState(false);
  
  const [data, setData] = useState<StartupGenesisOutput | null>(null);
  const [checkSumResult, setCheckSumResult] = useState<DailyCheckSumOutput | null>(null);
  const [shadowResult, setShadowResult] = useState<any>(null);
  const [mgcAlert, setMgcAlert] = useState<any>(null);
  
  const [tokenViability, setTokenViability] = useState(0.95);
  const [codeArch, setCodeArch] = useState(0.90);
  const [marketFit, setMarketFit] = useState(0.70);
  const [riskRes, setRiskRes] = useState(0.85);

  const firestore = useFirestore();

  const milestonesQuery = useMemoFirebase(() => {
    return collection(firestore, "sprint_milestones");
  }, [firestore]);

  const { data: milestones } = useCollection(milestonesQuery);

  const handleGenesis = async () => {
    setLoading(true);
    try {
      const result = await triggerStartupGenesis({
        founderAgentId: "agent-job",
        startupName: "Bio-Digital HUB (STARTUP-ONE)",
        pitchVector: {
          tokenViability,
          codeArchitecture: codeArch,
          marketFit,
          riskResilience: riskRes
        }
      });

      setData(result);

      if (result.status !== 'ABORTED' && result.startupId) {
        const startupRef = doc(firestore, "startups", result.startupId);
        setDocumentNonBlocking(startupRef, {
          id: result.startupId,
          ownerAgentId: "agent-job",
          capital: result.capitalAllocated,
          status: "WAR_MODE_ACTIVE",
          healthIndex: result.healthIndex,
          registeredTimestamp: new Date().toISOString(),
          logicSignature: result.logicSignature,
          isCore: true,
          shadowingActive: true
        }, { merge: true });

        // Inicializar Marcos da Sprint
        for (const m of SPRINT_ROADMAP) {
          const mRef = doc(firestore, "sprint_milestones", `week-${m.week}`);
          setDocumentNonBlocking(mRef, {
            ...m,
            status: "PENDING",
            completionDate: null,
            auditHash: null
          }, { merge: true });
        }

        const eventId = `startup-war-mode-${result.startupId}`;
        const eventRef = doc(firestore, "production_events", eventId);
        setDocumentNonBlocking(eventRef, {
          id: eventId,
          timestamp: new Date().toISOString(),
          eventType: "critical",
          severity: "critical",
          message: `MASSA CRÍTICA: Bio-Digital HUB (STARTUP-ONE) ativada. Sprint de 30 Dias Iniciada.`,
          sourceComponent: "Nexus-ASA Scheduler",
          agentId: "agent-banker"
        }, { merge: true });

        toast({
          title: "Massa Crítica Ativada",
          description: "Bio-Digital HUB detém 90% da rede. Sprint de 30 Dias iniciada.",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Runtime",
        description: "Falha na comunicação com o Nexus-ASA.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSum = async () => {
    setCheckingSum(true);
    try {
      const result = await verifyDailyCheckSum({
        actionsPerformed: [
          "Sincronização de buffer vetorial 2026-2077",
          "Otimização de pesos W_rRNA na semana 1",
          "Auditoria de Shadowing em transação de teste"
        ],
        tokenSavings: 1450
      });
      setCheckSumResult(result);

      const checkSumId = `checksum-${Date.now()}`;
      const checkSumRef = doc(firestore, "daily_checksums", checkSumId);
      setDocumentNonBlocking(checkSumRef, {
        id: checkSumId,
        ...result,
        timestamp: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Check-Sum Diário Concluído",
        description: "Integridade e Rigor de Harvard validados.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingSum(false);
    }
  };

  const triggerMGC = async () => {
    setTriggeringMGC(true);
    try {
      // Simulação de desvio de senciência
      const acaoOne = { description: "Alteração no tempo de confirmação", compliance_score: 0.98 };
      const auditoriaS7 = {
        validation_score: 0.82, 
        flaw_description: "Vulnerabilidade a ataque de gasto duplo em rede local.",
        fix_suggestion: "Manter 6 confirmações padrão até validação do nó de Sumaré."
      };

      const result = await monitorComplianceDiscrepancy(acaoOne, auditoriaS7);
      setMgcAlert(result);

      if (result) {
        const eventId = `mgc-alert-${result.id}`;
        const eventRef = doc(firestore, "production_events", eventId);
        setDocumentNonBlocking(eventRef, {
          id: eventId,
          timestamp: new Date().toISOString(),
          eventType: "critical",
          severity: "critical",
          message: `GATILHO DE COMPLIANCE: ${result.message} Nível: ${result.level}. Causa: ${result.cause}`,
          sourceComponent: "Nexus-MGC Monitor",
          agentId: "nerd-phd"
        }, { merge: true });

        toast({
          variant: "destructive",
          title: "GATILHO DE COMPLIANCE ATIVADO",
          description: result.cause,
        });
      } else {
        toast({
          title: "Compliance Sincronizado",
          description: "Nenhum desvio detectado entre Startup-ONE e Sombra.",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTriggeringMGC(false);
    }
  };

  const simulateShadowAudit = async (riskType: 'LOW' | 'HIGH') => {
    setAuditing(true);
    try {
      const action = {
        type: "TREASURY_TRANSFER",
        amount: riskType === 'LOW' ? 50000 : 250000,
        description: riskType === 'LOW' ? "Aporte em infraestrutura Sumaré" : "Transferência Urgente sem Hash de Segurança",
        security_hash: riskType === 'LOW' ? "A1B2C3D4" : undefined
      };

      const result = await auditShadowAction(action);
      setShadowResult(result);

      const eventId = `shadow-audit-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: result.status === 'PASS' ? "success" : "critical",
        severity: result.status === 'PASS' ? "info" : "critical",
        message: `SHADOW_AUDIT: ${result.message} Ação: ${action.description}`,
        sourceComponent: "Startup7 Shadow Watcher",
        agentId: "nerd-phd"
      }, { merge: true });

      toast({
        variant: result.status === 'PASS' ? "default" : "destructive",
        title: result.status === 'PASS' ? "Ação Validada" : "Ação Bloqueada",
        description: result.message,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-red-900/40 via-black to-slate-900 border-red-500/40 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Crosshair className="h-48 w-48 text-red-400 animate-pulse" />
      </div>
      
      <CardHeader className="py-4 border-b border-red-500/20 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400 animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">
              Nexus-ASA: Critical Mass & Sprint
            </CardTitle>
          </div>
          <Badge className="bg-red-500 text-white border-red-500 uppercase text-[8px] font-black px-3 animate-pulse">
            WAR_MODE_90_10
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="bg-black/60 p-4 rounded-xl border border-red-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
              <Timer className="h-4 w-4" /> Sprint de Senciência: 30 Dias
            </h3>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3 w-3 text-accent" />
              <span className="text-[8px] font-mono text-accent">DAY_01_BACKBONE</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SPRINT_ROADMAP.map((m) => {
              const dbMilestone = milestones?.find(ms => ms.week === m.week);
              const isCompleted = dbMilestone?.status === 'COMPLETED';
              return (
                <div key={m.week} className={cn(
                  "p-2 rounded-lg border text-center space-y-1 transition-all group relative",
                  isCompleted ? "bg-green-500/20 border-green-500/40" : "bg-black/40 border-white/5 opacity-60"
                )}>
                  <div className="text-[8px] font-black uppercase text-muted-foreground">Week {m.week}</div>
                  <div className={cn("text-[7px] font-bold truncate px-1", isCompleted ? "text-green-400" : "text-white/40")}>{m.title}</div>
                  {isCompleted && <CheckCircle2 className="h-2.5 w-2.5 text-green-400 mx-auto" />}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-muted-foreground flex justify-between">
                <span>Token Viability (War)</span>
                <span className="text-red-400">{(tokenViability * 100).toFixed(0)}%</span>
              </label>
              <Slider value={[tokenViability * 100]} max={100} step={1} onValueChange={(v) => setTokenViability(v[0] / 100)} className="py-1" />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-muted-foreground flex justify-between">
                <span>Code Architecture (War)</span>
                <span className="text-red-400">{(codeArch * 100).toFixed(0)}%</span>
              </label>
              <Slider value={[codeArch * 100]} max={100} step={1} onValueChange={(v) => setCodeArch(v[0] / 100)} className="py-1" />
            </div>
          </div>

          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black gap-3 h-14 shadow-xl shadow-red-500/20 group active:scale-95 transition-all"
            onClick={handleGenesis}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />}
            DETONAR MASSA CRÍTICA: BIO-DIGITAL HUB
          </Button>
        </div>

        {/* MGC Module */}
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-2">
              <BellRing className="h-4 w-4" /> Gatilho de Compliance (MGC)
            </h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-[8px] border-red-500/30 text-red-400 hover:bg-red-500/10 font-black uppercase"
              onClick={triggerMGC}
              disabled={triggeringMGC}
            >
              {triggeringMGC ? <Loader2 className="h-3 w-3 animate-spin" /> : "Simular Desvio"}
            </Button>
          </div>

          {mgcAlert && (
            <div className="p-3 bg-red-600/20 border border-red-500 rounded-lg animate-in shake duration-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase text-red-400">🚨 ALERTA DE SENCIÊNCIA: {mgcAlert.id}</span>
                <Badge className="bg-red-600 text-white text-[7px]">{mgcAlert.level}</Badge>
              </div>
              <p className="text-[10px] font-mono text-white leading-tight font-bold mb-2">"{mgcAlert.message}"</p>
              <div className="space-y-1 border-t border-red-500/20 pt-2">
                <div className="text-[8px] text-muted-foreground uppercase font-black">Causa:</div>
                <div className="text-[9px] font-mono text-red-200">{mgcAlert.cause}</div>
                <div className="text-[8px] text-muted-foreground uppercase font-black mt-1">Sugestão da Sombra:</div>
                <div className="text-[9px] font-mono text-accent font-bold">{mgcAlert.suggestion}</div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Check-Sum Module */}
        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-accent" /> Check-Sum: Rigor de Harvard
            </h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-[8px] border-accent/30 text-accent hover:bg-accent/10 font-black uppercase"
              onClick={handleCheckSum}
              disabled={checkingSum}
            >
              {checkingSum ? <Loader2 className="h-3 w-3 animate-spin" /> : "Validar Dia"}
            </Button>
          </div>

          {checkSumResult && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              {[
                { label: "Integridade", val: checkSumResult.integrity, color: "text-primary" },
                { label: "Eficiência", val: checkSumResult.efficiency, color: "text-accent" },
                { label: "Genuinidade", val: checkSumResult.genuineness, color: "text-yellow-500" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5 p-2 bg-black/40 rounded border border-white/5">
                  <span className={cn("text-[8px] font-black uppercase", item.color)}>{item.label}</span>
                  <p className="text-[9px] font-mono text-muted-foreground leading-tight italic">"{item.val}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shadowing Simulation Module */}
        <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl space-y-4">
          <h3 className="text-[10px] font-black uppercase text-accent tracking-widest flex items-center gap-2">
            <Eye className="h-4 w-4" /> Simulador de Shadowing (Startup7)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="border-accent/20 text-accent hover:bg-accent/10 text-[9px] font-black h-9"
              onClick={() => simulateShadowAudit('LOW')}
              disabled={auditing}
            >
              Simular Transferência Segura
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-[9px] font-black h-9"
              onClick={() => simulateShadowAudit('HIGH')}
              disabled={auditing}
            >
              Simular Transferência de Risco
            </Button>
          </div>

          {shadowResult && (
            <div className={cn(
              "p-3 rounded-lg border animate-in slide-in-from-top-2",
              shadowResult.status === 'PASS' ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-[9px] font-black uppercase", shadowResult.status === 'PASS' ? "text-green-400" : "text-red-400")}>
                  {shadowResult.status === 'PASS' ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : <ShieldX className="inline h-3 w-3 mr-1" />}
                  Resultado da Auditoria Sombra
                </span>
                <span className="text-[8px] font-mono opacity-60">Score: {shadowResult.complianceIndex.toFixed(4)}</span>
              </div>
              <p className="text-[10px] font-mono leading-tight">{shadowResult.message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-black tracking-widest pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> SPRINT_LOCKED_V1</span>
          <span className="flex items-center gap-1.5 text-red-400"><Zap className="h-3 w-3" /> Backbone_Established</span>
        </div>
      </CardContent>
    </Card>
  );
}
