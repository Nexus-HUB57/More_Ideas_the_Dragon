
"use client";

import { useState } from "react";
import { orchestrationCommandSuggestion } from "@/ai/flows/orchestration-command-suggestion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Terminal, Send, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function InteractionConsole() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  const firestore = useFirestore();

  const handleSuggest = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const result = await orchestrationCommandSuggestion({ naturalLanguageDescription: input });
      setSuggestions(result.suggestedCommands);
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = (cmd?: string) => {
    const commandToExecute = cmd || input;
    if (!commandToExecute) return;

    const commandId = `cmd-${Date.now()}`;
    const logRef = doc(firestore, "orchestration_command_logs", commandId);
    
    setDocumentNonBlocking(logRef, {
      id: commandId,
      timestamp: new Date().toISOString(),
      commandName: commandToExecute,
      status: "executed",
      parameters: JSON.stringify({ rawInput: input }),
      responseMessage: "Command acknowledged by Nexus Orchestrator."
    }, { merge: true });

    setInput("");
    setSuggestions([]);
  };

  return (
    <Card className="bg-card/30 border-border/50 h-full flex flex-col backdrop-blur-sm shadow-inner">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          Nexus-in Interaction Console
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4">
        <div className="relative">
          <Textarea 
            placeholder="Describe orchestration action (e.g., 'Restart all hubs in high priority mode')" 
            className="min-h-[120px] bg-background/50 resize-none text-xs font-body border-border/30 focus:border-primary/50 transition-colors"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-[10px] gap-1 bg-background/80 border-border/50 hover:bg-accent/10"
              onClick={handleSuggest}
              disabled={loading || !input}
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-accent" />}
              AI Suggest
            </Button>
            <Button 
              size="sm" 
              className="h-7 text-[10px] gap-1 bg-primary hover:bg-primary/90"
              disabled={loading || !input}
              onClick={() => handleExecute()}
            >
              <Send className="h-3 w-3" />
              Execute
            </Button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-2 p-3 rounded-md bg-accent/5 border border-accent/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-accent flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Suggested Commands
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((cmd, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="font-code text-[10px] py-0.5 border border-accent/30 bg-background/50 hover:bg-accent/20 cursor-pointer flex items-center gap-1 transition-all hover:scale-105"
                  onClick={() => handleExecute(cmd)}
                >
                  <ChevronRight className="h-2.5 w-2.5" />
                  {cmd}
                </Badge>
              ))}
            </div>
            {explanation && (
              <p className="text-[10px] text-muted-foreground leading-relaxed italic border-t border-accent/20 pt-2 mt-1">
                {explanation}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
