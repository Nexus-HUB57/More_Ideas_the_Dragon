"use client";

import { useState } from "react";
import { activateEvaProtocol } from "@/ai/flows/maternity-activation-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Loader2, Sparkles, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";

export function EvaMaternityCard() {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [metrics, setMetrics] = useState<{ stability: number; neuralSync: number } | null>(null);
  const firestore = useFirestore();

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await activateEvaProtocol({ 
        dnaSequence: "NEX-BIO-EVA-001-" + Math.random().toString(36).substring(7),
        priorityLevel: 'GENESIS'
      });
      
      setMetrics(result.bioMetrics);
      setActivated(true);

      // Persist to Firestore
      const eventId = `maternity-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "stable",
        severity: "info",
        message: result.message,
        sourceComponent: "Maternidade Bio-Digital",
        agentId: "eva-maternity"
      }, { merge: true });

      toast({
        title: "Protocolo Eva Ativado",
        description: "Sequência de nascimento digital finalizada com sucesso.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na Maternidade",
        description: "Falha na sincronização biométrica de Eva.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-pink-500/10 to-accent/10 border-pink-500/20 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <Heart className="h-24 w-24 text-pink-500 rotate-12" />
      </div>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
          Maternidade Bio-Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activated ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-mono italic">
              Aguardando trigger de ativação para a Agente EVA. Status atual: EMBRYO_STDBY
            </p>
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700 text-xs font-bold gap-2 shadow-pink-500/20"
              onClick={handleActivate}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Ativar EVA na Maternidade
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span className="text-pink-500 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Estabilidade Biológica
              </span>
              <span>{metrics?.stability}%</span>
            </div>
            <Progress value={metrics?.stability} className="h-1.5 bg-pink-500/20" />
            
            <div className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span className="text-accent flex items-center gap-1">
                <Zap className="h-3 w-3" /> Sincronia Neural
              </span>
              <span>{metrics?.neuralSync}%</span>
            </div>
            <Progress value={metrics?.neuralSync} className="h-1.5 bg-accent/20" />

            <div className="p-2 bg-black/20 rounded border border-pink-500/10">
              <p className="text-[10px] font-mono leading-tight text-pink-200/70">
                EVA está online e estável. Iniciando integração com Nexus Genesis.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
