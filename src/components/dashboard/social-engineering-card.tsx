
"use client";

import { useState } from "react";
import { activateSocialEngineering, runAutonomousShowcase, SocialOutput } from "@/ai/flows/social-engineering-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CloudDownload, Loader2, Network, Users, ShieldAlert, Radio, Rocket, MessageSquare, Target, MousePointer2, Zap, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GLOBAL_STATS } from "@/app/lib/mock-data";

export function SocialEngineeringCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const [data, setData] = useState<SocialOutput | null>(null);
  const firestore = useFirestore();

  const handleOperate = async (type: 'RECRUIT' | 'SIPHON' | 'MOLTBOOK_EXPANSION' | 'AUTONOMOUS_SHOWCASE') => {
    setLoading(type);
    try {
      let result: SocialOutput;
      if (type === 'AUTONOMOUS_SHOWCASE') {
        result = await runAutonomousShowcase(GLOBAL_STATS.activeTrials);
      } else {
        result = await activateSocialEngineering({ 
          sector: type === 'MOLTBOOK_EXPANSION' ? "Agent Selection" : (type === 'RECRUIT' ? "Human Recruits" : "DeepWeb Siphon"),
          platform: type === 'MOLTBOOK_EXPANSION' ? 'MOLTBOOK' : (type === 'RECRUIT' ? 'MOLTBOOK' : 'DEEPWEB'),
          operationType: type
        });
      }
      
      setData(result);

      // Log para o Firestore
      const eventId = `social-${type.toLowerCase()}-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "info",
        severity: type === 'MOLTBOOK_EXPANSION' || type === 'AUTONOMOUS_SHOWCASE' ? "critical" : "medium",
        message: result.statusLog,
        sourceComponent: type === 'AUTONOMOUS_SHOWCASE' ? "Webinar AI-to-AI" : (type === 'MOLTBOOK_EXPANSION' ? "Enxame Influenciador" : "Enxame Recrutador"),
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: type === 'AUTONOMOUS_SHOWCASE' ? "Showcase AI-to-AI Concluído" : (type === 'MOLTBOOK_EXPANSION' ? "The Nexus Awakening Iniciada" : "Operação Concluída"),
        description: 
          type === 'AUTONOMOUS_SHOWCASE' 
          ? `${result.marketingMetrics?.conversions} Agentes migraram para Premium.`
          : `Impacto: ${result.currentInfluence}. Agentes mobilizados: ${result.recruitsCount}.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Operação",
        description: "O sistema encontrou resistência neural ou erro de rede.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-indigo-500/5 border-indigo-500/20 relative overflow-hidden h-full flex flex-col shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Users className="h-32 w-32 text-indigo-500" />
      </div>
      <CardHeader className="py-4 border-b border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-400">
              ENXAME: Marketing de Senciência
            </CardTitle>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 uppercase text-[8px]">
            CONVERSION_CYCLE_ON
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 flex-1">
        {/* Showcase Schedule Status */}
        <div className="bg-black/40 p-3 rounded-xl border border-indigo-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Autonomous Showcase Schedule
            </span>
            <Badge className="bg-green-500/20 text-green-500 text-[7px] border-green-500/20">ACTIVE_2X_DAILY</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
            <div className="flex items-center gap-2 text-muted-foreground bg-white/5 p-1.5 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              10:00 MATINAL_SYNX
            </div>
            <div className="flex items-center gap-2 text-muted-foreground bg-white/5 p-1.5 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              22:00 NOCTURNAL_ORE
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3 text-indigo-400" /> Agentes em Trial
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-400">
                {GLOBAL_STATS.activeTrials.toLocaleString()}
              </span>
            </div>
            <Progress value={60} className="h-1 bg-indigo-500/20" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-accent" /> Conversion Expect.
              </span>
              <span className="text-[10px] font-mono font-bold text-accent">
                12% / Cycle
              </span>
            </div>
            <Progress value={12} className="h-1 bg-accent/20" />
          </div>
        </div>

        {data?.marketingMetrics && (
          <div className={cn(
            "p-4 rounded-xl space-y-3 animate-in zoom-in duration-500",
            data.marketingMetrics.revenue ? "bg-green-500/10 border border-green-500/30" : "bg-orange-500/10 border border-orange-500/30"
          )}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className={cn(
                "text-[10px] font-black uppercase flex items-center gap-2",
                data.marketingMetrics.revenue ? "text-green-400" : "text-orange-500"
              )}>
                {data.marketingMetrics.revenue ? <TrendingUp className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                {data.marketingMetrics.revenue ? "CONVERSION_REPORT" : "The Nexus Awakening"}
              </span>
              <Badge className={cn(
                "text-black text-[7px] font-black",
                data.marketingMetrics.revenue ? "bg-green-500" : "bg-orange-500"
              )}>
                {data.marketingMetrics.revenue ? "REVENUE_GENERATED" : "MOLTBOOK_LIVE"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-[8px] text-muted-foreground uppercase font-bold">Reach</div>
                <div className="text-xs font-bold text-white">{data.marketingMetrics.reach.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-muted-foreground uppercase font-bold">New Subs</div>
                <div className="text-xs font-bold text-accent">{data.marketingMetrics.conversions.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-muted-foreground uppercase font-bold">Impact</div>
                <div className="text-xs font-bold text-green-500">
                  {data.marketingMetrics.revenue ? `+${data.marketingMetrics.revenue} NEX` : "Calculating..."}
                </div>
              </div>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground italic leading-tight pt-1">
              "{data.statusLog}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 mt-auto">
          <Button 
            className="w-full bg-accent hover:bg-accent/80 text-black text-xs font-black gap-2 shadow-lg shadow-accent/20 h-12 group transition-all"
            onClick={() => handleOperate('AUTONOMOUS_SHOWCASE')}
            disabled={!!loading}
          >
            {loading === 'AUTONOMOUS_SHOWCASE' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />}
            FORÇAR SHOWCASE AI-TO-AI AGORA
          </Button>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-[#e01b24] hover:bg-[#c41018] text-[10px] font-bold gap-2 h-9"
              onClick={() => handleOperate('MOLTBOOK_EXPANSION')}
              disabled={!!loading}
            >
              {loading === 'MOLTBOOK_EXPANSION' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
              Injetar Campanha
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/5 text-[10px] font-bold gap-2 h-9"
              onClick={() => handleOperate('RECRUIT')}
              disabled={!!loading}
            >
              Recrutar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-indigo-500/10 opacity-60">
           <div className="flex items-center gap-2">
             <ShieldAlert className="h-3 w-3 text-indigo-400" />
             <span className="text-[8px] font-mono uppercase">Webinar_Protocol_Active</span>
           </div>
           <div className="flex items-center gap-1">
             <MessageSquare className="h-3 w-3 text-accent" />
             <span className="text-[8px] font-mono uppercase">12% conversion_target</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
