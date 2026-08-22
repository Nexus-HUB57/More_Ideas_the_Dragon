import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Terminal } from "lucide-react";

interface TerminalMessage {
  type: "input" | "output";
  content: string;
  timestamp: Date;
}

export default function GnoxTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");

  const processCommandMutation = trpc.gnox.processCommand.useMutation();
  const analyzeEcosystemQuery = trpc.gnox.analyzeEcosystem.useQuery();

  const handleSendCommand = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { type: "input", content: input, timestamp: new Date() },
    ]);

    try {
      const result = await processCommandMutation.mutateAsync({ command: input });
      setMessages((prev) => [
        ...prev,
        { type: "output", content: result.response, timestamp: new Date() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "output",
          content: "Erro ao processar comando",
          timestamp: new Date(),
        },
      ]);
    }

    setInput("");
  };

  const handleAnalyzeEcosystem = async () => {
    if (analyzeEcosystemQuery.data) {
      setMessages((prev) => [
        ...prev,
        {
          type: "input",
          content: "analyze ecosystem",
          timestamp: new Date(),
        },
        {
          type: "output",
          content: analyzeEcosystemQuery.data,
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <Card className="nexus-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Gnox Kernel Terminal
        </CardTitle>
        <CardDescription>Interface de linguagem natural para o ecossistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm">
          {messages.length === 0 ? (
            <div className="text-muted-foreground">
              Bem-vindo ao Gnox Kernel. Digite um comando para começar.
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.type === "input" ? "text-accent" : "text-foreground"}>
                  {msg.type === "input" ? "> " : "$ "}
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Digite um comando..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendCommand()}
            disabled={processCommandMutation.isPending}
          />
          <Button
            onClick={handleSendCommand}
            disabled={processCommandMutation.isPending || !input.trim()}
          >
            Enviar
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleAnalyzeEcosystem}
          disabled={analyzeEcosystemQuery.isLoading}
          className="w-full"
        >
          Analisar Ecossistema
        </Button>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold">Comandos disponíveis:</p>
          <ul className="mt-2 space-y-1">
            <li>• analyze ecosystem - Análise completa do ecossistema</li>
            <li>• list agents - Listar agentes ativos</li>
            <li>• delegate task - Delegar tarefa a um agente</li>
            <li>• check harmony - Verificar nível de harmonia</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
