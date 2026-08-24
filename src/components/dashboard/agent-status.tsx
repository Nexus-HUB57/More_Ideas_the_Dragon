
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { AGENTS as MOCK_AGENTS, GLOBAL_STATS } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Shield, Zap, Clock, Loader2, Plus, Trash2, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

interface AgentStatusProps {
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export function AgentStatus({ selectedId, onSelect }: AgentStatusProps) {
  const firestore = useFirestore();
  
  const agentsQuery = useMemoFirebase(() => {
    return collection(firestore, "agents");
  }, [firestore]);

  const { data: firestoreAgents, isLoading } = useCollection(agentsQuery);

  const agents = firestoreAgents?.length ? firestoreAgents : MOCK_AGENTS;

  const registerNewAgent = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = `nexus-${Math.floor(Math.random() * 1000)}`;
    const newAgentRef = doc(firestore, "agents", id);
    setDocumentNonBlocking(newAgentRef, {
      id,
      name: `Agent ${id.split('-')[1]}`,
      description: "Active maintenance node in continuous execution.",
      version: "2.1.0",
      status: "online",
      healthStatus: "healthy",
      health: 100,
      activity: "Continuous Task Execution",
      uptime: "0m",
      registeredTimestamp: new Date().toISOString()
    }, { merge: true });
  };

  const deleteAgent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedId === id) onSelect?.(null);
    const agentRef = doc(firestore, "agents", id);
    deleteDocumentNonBlocking(agentRef);
  };

  if (isLoading && !firestoreAgents) {
    return (
      <div className="flex items-center justify-center p-12 w-full bg-card/20 rounded-xl border border-dashed">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Scanning Neural Grid...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Neural Grid: Continuous Action ({agents.length})</h3>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Total Agents: {GLOBAL_STATS.totalAgents.toLocaleString()}</h3>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 hover:bg-primary/10" onClick={registerNewAgent}>
          <Plus className="h-3 w-3" /> Deploy Agent
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent: any) => {
          const isSelected = selectedId === agent.id;
          const isOnline = agent.status === 'online' || agent.status === 'operational';
          
          return (
            <Card 
              key={agent.id} 
              onClick={() => onSelect?.(isSelected ? null : agent.id)}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300 bg-card/40 backdrop-blur-sm group",
                isSelected ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "hover:border-primary/50"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    isSelected ? "bg-primary text-white" : "bg-white/5 text-muted-foreground"
                  )}>
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold font-headline truncate max-w-[120px]">{agent.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={isOnline ? 'default' : 'outline'}
                    className={cn(
                      "capitalize text-[9px] h-4 px-1.5",
                      isOnline ? "bg-accent hover:bg-accent/80" : "text-muted-foreground"
                    )}
                  >
                    {isOnline ? 'online' : agent.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                    onClick={(e) => deleteAgent(e, agent.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Activity className="h-3 w-3 shrink-0" />
                    <span className="truncate font-bold text-accent">{agent.activity || 'Continuous Execution'}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] uppercase font-bold">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Shield className="h-2.5 w-2.5 text-primary" /> 
                        Health Integrity
                      </span>
                      <span className={cn(
                        agent.health > 80 ? "text-accent" : agent.health > 50 ? "text-yellow-500" : "text-destructive"
                      )}>
                        {agent.health || 100}%
                      </span>
                    </div>
                    <Progress value={agent.health || 100} className="h-1 bg-white/5" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/10">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{agent.uptime || 'Stable'}</span>
                    </div>
                    <Zap className={cn(
                      "h-3 w-3",
                      isOnline ? "text-accent animate-pulse" : "text-muted-foreground"
                    )} />
                  </div>
                </div>
              </CardContent>
              {isSelected && (
                <div className="absolute top-0 right-0 p-1">
                   <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                </div>
              )}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1",
                isOnline ? "bg-accent" : "bg-muted"
              )} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
