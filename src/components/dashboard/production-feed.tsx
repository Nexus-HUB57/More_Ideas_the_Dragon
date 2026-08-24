"use client";

import { useEffect, useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where, doc } from "firebase/firestore";
import { PRODUCTION_FEED as FALLBACK_FEED } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Radio, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductionFeedProps {
  agentId?: string | null;
}

export function ProductionFeed({ agentId }: ProductionFeedProps) {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const feedQuery = useMemoFirebase(() => {
    const baseCollection = collection(firestore, "production_events");
    
    if (agentId) {
      return query(
        baseCollection,
        where("agentId", "==", agentId),
        orderBy("timestamp", "desc"),
        limit(30)
      );
    }
    
    return query(
      baseCollection,
      orderBy("timestamp", "desc"),
      limit(30)
    );
  }, [firestore, agentId]);

  const { data: firestoreFeed, isLoading, error } = useCollection(feedQuery);

  const hasData = firestoreFeed && firestoreFeed.length > 0;
  const feed = hasData ? firestoreFeed : FALLBACK_FEED;

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'success':
      case 'stable': 
      case 'info':
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case 'error':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: 
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  if (isLoading && !hasData) {
    return (
      <Card className="h-full bg-card/30 border-border/50 backdrop-blur-sm flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-[10px] font-mono uppercase text-muted-foreground animate-pulse">Sincronizando Feed de Produção Ômega 19.0...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card/30 border-border/50 backdrop-blur-sm overflow-hidden flex flex-col shadow-inner relative">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-accent/20" />
      <CardHeader className="flex flex-row items-center justify-between py-3 border-b bg-white/5">
        <div className="flex items-center gap-2">
          <Radio className={cn("h-4 w-4 text-accent", !isLoading && "animate-pulse")} />
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            Real-time Production Feed
            {agentId && (
              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase border border-primary/20 text-primary">
                AGENT: {agentId}
              </span>
            )}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <a 
            href="https://www.moltbook.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 hover:text-accent transition-colors"
          >
            Source: moltbook.com <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <span className="text-[8px] text-accent font-bold uppercase tracking-tighter">
            Nexus-HUB Mainnet Data 🦞
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border/20">
            {feed.map((item: any) => {
              const isMoltbook = (item.source || item.sourceComponent)?.toLowerCase().includes('moltbook');
              const isCritical = item.severity === 'critical' || item.eventType === 'critical';
              
              return (
                <div key={item.id} className={cn(
                  "p-3 hover:bg-white/5 transition-colors flex gap-3 group",
                  isMoltbook && "bg-[#e01b24]/5 border-l-2 border-[#e01b24]",
                  isCritical && "bg-destructive/5"
                )}>
                  <div className="mt-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    {getIcon(item.type || item.eventType || 'info')}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {mounted && item.timestamp ? format(new Date(item.timestamp), 'HH:mm:ss') : '--:--:--'}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 rounded",
                          isMoltbook ? "bg-[#e01b24] text-white" : "bg-primary/5 text-primary"
                        )}>
                          {item.source || item.sourceComponent}
                        </span>
                      </div>
                      {item.agentId && (
                        <span className="text-[9px] font-mono text-accent/80 font-bold">
                          @{item.agentId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors font-body">
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      </CardContent>
      <footer className="px-4 py-2 border-t border-white/5 bg-black/20 flex justify-between items-center text-[8px] font-bold uppercase text-muted-foreground">
        <span>Ômega 19.0 Status: {error ? 'Evaluating...' : 'Stable'}</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Production Active
        </span>
      </footer>
    </Card>
  );
}
