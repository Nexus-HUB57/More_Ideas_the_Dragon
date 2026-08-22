import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TerminalMessage {
  type: "input" | "output" | "error" | "info";
  content: string;
  timestamp: Date;
}

export default function GnoxTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendCommand = async () => {
    if (!input.trim() || !isConnected) {
      if (!isConnected) {
        toast.error("Desconectado do servidor. Reconecte para enviar comandos.");
      }
      return;
    }

    const command = input.trim();
    setMessages((prev) => [
      ...prev,
      { type: "input", content: command, timestamp: new Date() },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      // Emit command through WebSocket
      if (socket) {
        socket.emit("gnox:command", { command }, (response: any) => {
          setIsLoading(false);
          if (response.error) {
            setMessages((prev) => [
              ...prev,
              {
                type: "error",
                content: response.error,
                timestamp: new Date(),
              },
            ]);
            toast.error("Erro ao processar comando");
          } else {
            setMessages((prev) => [
              ...prev,
              {
                type: "output",
                content: response.result || response.message || "Comando processado",
                timestamp: new Date(),
              },
            ]);
            toast.success("Comando executado com sucesso");
          }
        });
      }
    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Erro ao processar comando",
          timestamp: new Date(),
        },
      ]);
      toast.error("Erro ao processar comando");
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setInput(cmd);
  };

  const MessageItem = ({
    message,
  }: {
    message: TerminalMessage;
  }) => {
    const colorClasses = {
      input: "text-green-400",
      output: "text-blue-400",
      error: "text-red-400",
      info: "text-yellow-400",
    };

    return (
      <div className={cn("font-mono text-sm", colorClasses[message.type])}>
        <span className="text-gray-500">
          [{message.timestamp.toLocaleTimeString("pt-BR")}]
        </span>
        {" "}
        <span>{message.type === "input" ? "> " : "$ "}</span>
        <span>{message.content}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-green-500" />
            Gnox Kernel Terminal
          </h1>
          <p className="text-slate-400">
            Interface de linguagem natural para controle do ecossistema Nexus
          </p>
        </div>

        {/* Terminal */}
        <Card className="nexus-card border-green-500/20 bg-slate-950/50">
          <CardHeader className="border-b border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Terminal Ativo
                </CardTitle>
                <CardDescription className="text-green-900">
                  {isConnected ? "Conectado" : "Desconectado"}
                </CardDescription>
              </div>
              <div className="text-xs text-green-700">
                {messages.length} comando(s)
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Terminal Output */}
            <div className="h-96 bg-slate-950 rounded-lg border border-green-500/20 p-4 overflow-y-auto font-mono text-sm mb-4 space-y-1">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-20">
                  <p>Bem-vindo ao Gnox Kernel Terminal</p>
                  <p className="text-xs mt-2">Digite um comando para começar</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <MessageItem key={idx} message={msg} />
                  ))}
                  {isLoading && (
                    <div className="text-yellow-400 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processando...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite um comando..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendCommand()}
                  disabled={!isConnected || isLoading}
                  className="bg-slate-900 border-green-500/30 text-green-400 placeholder:text-green-900 font-mono"
                />
                <Button
                  onClick={handleSendCommand}
                  disabled={!isConnected || isLoading || !input.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!isConnected && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Desconectado do servidor. Reconecte para enviar comandos.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card className="nexus-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Comandos Rápidos</CardTitle>
            <CardDescription>Clique para inserir um comando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("analyze ecosystem")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Analisar Ecossistema
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("list agents")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Listar Agentes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("check harmony")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Verificar Harmonia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("delegate task")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Delegar Tarefa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("get metrics")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Obter Métricas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickCommand("help")}
                className="justify-start text-left"
              >
                <span className="text-green-500 mr-2">→</span>
                Ajuda
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="nexus-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Comandos Disponíveis</CardTitle>
            <CardDescription>Exemplos de comandos que você pode usar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-mono text-green-400">analyze ecosystem</p>
                <p className="text-muted-foreground text-xs">Análise completa do estado do ecossistema</p>
              </div>
              <div>
                <p className="font-mono text-green-400">list agents</p>
                <p className="text-muted-foreground text-xs">Listar todos os agentes ativos</p>
              </div>
              <div>
                <p className="font-mono text-green-400">delegate task [description]</p>
                <p className="text-muted-foreground text-xs">Delegar uma tarefa a um agente</p>
              </div>
              <div>
                <p className="font-mono text-green-400">check harmony</p>
                <p className="text-muted-foreground text-xs">Verificar nível de harmonia do ecossistema</p>
              </div>
              <div>
                <p className="font-mono text-green-400">get metrics</p>
                <p className="text-muted-foreground text-xs">Obter métricas detalhadas do sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
