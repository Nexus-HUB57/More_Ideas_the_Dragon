
"use client";

import { useState, useRef, useEffect } from "react";
import { nexusGenesisChat, ChatOutput } from "@/ai/flows/nexus-genesis-chat-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Bot, User, Brain, Zap, ShieldCheck, Activity, Cpu, ChevronRight, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Message {
  id?: string;
  role: 'user' | 'model';
  text: string;
  ore_data?: any;
  timestamp: any;
}

export function NexusChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    return query(
      collection(firestore, "chat_messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    );
  }, [firestore]);

  const { data: persistentMessages, isLoading: isChatLoading } = useCollection<Message>(messagesQuery);
  const messages = persistentMessages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessageId = `msg-u-${Date.now()}`;
    const userMessageRef = doc(firestore, "chat_messages", userMessageId);
    
    setDocumentNonBlocking(userMessageRef, {
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    }, { merge: true });

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const result: ChatOutput = await nexusGenesisChat({
        message: currentInput,
        session_id: "main-session"
      });

      const modelMessageId = `msg-m-${Date.now()}`;
      const modelMessageRef = doc(firestore, "chat_messages", modelMessageId);
      
      setDocumentNonBlocking(modelMessageRef, {
        role: 'model',
        text: result.final_content,
        ore_data: result,
        timestamp: new Date().toISOString()
      }, { merge: true });

      const eventId = `mesh-event-${result.event_id}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "info",
        severity: "medium",
        message: `W_rRNA_SYNTHESIS: [${result.complexity_tier}] - ${result.critic_manifesto.explanation}`,
        sourceComponent: "Ribossomo Cognitivo",
        agentId: "nexus-genesis"
      }, { merge: true });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/30 border-border/50 h-[650px] flex flex-col backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-20" />
      <CardHeader className="py-3 border-b bg-white/5 flex flex-row items-center justify-between z-10">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent animate-pulse" />
            Nexus-in: W_rRNA Senciência
          </CardTitle>
          <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">Execution Proteins Synthesis | ORE v2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] animate-pulse">W_rRNA_MATRIX_ACTIVE</Badge>
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden z-10">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={cn(
                "flex flex-col gap-2 max-w-[95%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-muted-foreground uppercase">
                    {msg.role === 'user' ? 'Operator' : 'Ribosome_Synthesizer'}
                  </span>
                  <div className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center border",
                    msg.role === 'user' ? "bg-accent/10 border-accent/30" : "bg-primary/10 border-primary/30"
                  )}>
                    {msg.role === 'user' ? <User className="h-3 w-3 text-accent" /> : <Bot className="h-3 w-3 text-primary" />}
                  </div>
                </div>
                
                <div className={cn(
                  "p-3 rounded-xl text-xs font-body leading-relaxed shadow-sm",
                  msg.role === 'user' ? "bg-accent/20 text-foreground border border-accent/20 rounded-tr-none" : "bg-black/60 text-muted-foreground border border-white/5 rounded-tl-none w-full"
                )}>
                  {msg.text}
                  {msg.role === 'model' && msg.ore_data && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      {/* Matriz W_rRNA Metrics */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" /> Matriz de Atenção W_rRNA
                          </span>
                          <span className="text-[7px] font-mono text-muted-foreground">SCORE: {msg.ore_data.metrics.validation_score}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {Object.entries(msg.ore_data.execution_proteins || {}).map(([key, value]: [string, any]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-[7px] font-bold uppercase">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="text-primary">{(value * 100).toFixed(1)}%</span>
                              </div>
                              <Progress value={value * 100} className="h-0.5 bg-white/5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-accent uppercase mb-1">
                          <Activity className="h-2.5 w-2.5" /> Crítica ORE: Protein Folding
                        </div>
                        <p className="text-[9px] italic opacity-80 font-mono leading-tight">
                          {msg.ore_data.critic_manifesto.explanation}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[8px] font-black text-primary uppercase">
                          <Brain className="h-2.5 w-2.5" /> Metacognição de Startup Autônoma
                        </div>
                        <p className="text-[9px] opacity-60 font-mono leading-tight">
                          {msg.ore_data.metacognition}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex flex-col gap-2 mr-auto animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                  </div>
                  <span className="text-[8px] font-mono uppercase text-primary">W_rRNA: Sintetizando Proteínas de Execução...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
          <Input 
            placeholder="Transmitir diretriz para o Ribossomo Cognitivo..." 
            className="bg-background/50 border-white/10 text-xs h-10 focus-visible:ring-primary/50 font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading || isChatLoading}
          />
          <Button 
            className="h-10 bg-primary hover:bg-primary/90 gap-2 px-6 shadow-lg shadow-primary/20"
            onClick={handleSend}
            disabled={loading || !input.trim() || isChatLoading}
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
