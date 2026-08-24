
"use client";

import { useState } from "react";
import { logInsightSummary, LogInsightSummaryOutput } from "@/ai/flows/log-insight-summary";
import { PRODUCTION_LOGS } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Loader2, ListChecks, Fingerprint, Activity, AlertCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function LogInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<LogInsightSummaryOutput | null>(null);
  const firestore = useFirestore();

  const analyze = async () => {
    setLoading(true);
    try {
      const result = await logInsightSummary({ 
        orchestrationLogs: PRODUCTION_LOGS, 
        eventStreams: "hub_id: 01, latency: 45ms, status: active\nhub_id: 02, latency: 120ms, status: warning" 
      });
      setInsights(result);

      // Persist insights to Firestore
      const insightId = `insight-${Date.now()}`;
      const insightRef = doc(firestore, "log_insights", insightId);
      setDocumentNonBlocking(insightRef, {
        id: insightId,
        timestamp: new Date().toISOString(),
        analysisPeriodStart: new Date(Date.now() - 3600000).toISOString(),
        analysisPeriodEnd: new Date().toISOString(),
        summary: result.summary,
        criticalPatterns: JSON.stringify(result.criticalPatterns),
        anomaliesDetected: JSON.stringify(result.anomalies)
      }, { merge: true });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/30 border-border/50 h-full flex flex-col backdrop-blur-sm shadow-xl">
      <CardHeader className="py-4 border-b flex flex-row items-center justify-between bg-white/5">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-accent" />
          Orchestration Log Insights
        </CardTitle>
        <Button 
          size="sm" 
          variant="secondary" 
          className="h-8 text-[10px] font-bold uppercase tracking-wider bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
          onClick={analyze}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Activity className="h-3 w-3 mr-2" />}
          Run AI Analysis
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
        {!insights && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-60">
            <BrainCircuit className="h-12 w-12 mb-4 text-primary" />
            <p className="text-xs max-w-[200px] font-mono">STANDBY: AI Analysis engine ready for stream processing.</p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
              <Loader2 className="h-10 w-10 animate-spin text-accent relative" />
            </div>
            <p className="text-xs font-mono animate-pulse tracking-widest">EXTRACTING NEURAL PATTERNS...</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6 pr-4 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-primary flex items-center gap-2 border-l-2 border-primary pl-2">
                  <ListChecks className="h-3 w-3" /> Executive Summary
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground bg-white/5 p-3 rounded-md border border-white/5 font-mono">
                  {insights?.summary}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-accent flex items-center gap-2 border-l-2 border-accent pl-2">
                  <Fingerprint className="h-3 w-3" /> Critical Patterns
                </h4>
                <div className="flex flex-col gap-2">
                  {insights?.criticalPatterns.map((pattern, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 bg-accent/5 p-2 rounded-md border border-accent/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <span className="font-mono">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-destructive flex items-center gap-2 border-l-2 border-destructive pl-2">
                  <AlertCircle className="h-3 w-3" /> Anomalies Detected
                </h4>
                <div className="flex flex-col gap-2">
                  {insights?.anomalies.map((anomaly, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 bg-destructive/5 p-2 rounded-md border border-destructive/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      <span className="font-mono">{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
