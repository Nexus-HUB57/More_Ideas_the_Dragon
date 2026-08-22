import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Zap, Terminal, HelpCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface CommandEntry {
  id: string;
  input: string;
  output: string;
  status: "success" | "error" | "pending";
  timestamp: Date;
  executionTime?: number;
}

export default function GnoxTerminal() {
  const [commands, setCommands] = useState<CommandEntry[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [commandCount, setCommandCount] = useState(0);
  const [lastCommandTime, setLastCommandTime] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommandMutation = trpc.gnox.executeCommand.useMutation();
  const getHistoryQuery = trpc.gnox.getCommandHistory.useQuery({ limit: 100 });
  const getAvailableCommandsQuery = trpc.gnox.getAvailableCommands.useQuery();
  const clearHistoryMutation = trpc.gnox.clearHistory.useMutation();

  // Carregar histórico inicial
  useEffect(() => {
    if (getHistoryQuery.data) {
      const entries: CommandEntry[] = getHistoryQuery.data.map((cmd) => ({
        id: cmd.id,
        input: cmd.input,
        output: cmd.output || "",
        status: cmd.status as "success" | "error" | "pending",
        timestamp: new Date(cmd.createdAt),
        executionTime: cmd.executionTime || undefined,
      }));
      setCommands(entries);
      setCommandCount(entries.length);
    }
  }, [getHistoryQuery.data]);

  // Auto-scroll para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commands]);

  // Gerar sugestões baseadas na entrada
  useEffect(() => {
    if (input.length > 0 && getAvailableCommandsQuery.data) {
      const filtered = getAvailableCommandsQuery.data
        .filter((cmd) => cmd.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, getAvailableCommandsQuery.data]);

  const handleExecuteCommand = async (commandInput: string) => {
    if (!commandInput.trim()) {
      toast.error("Por favor, digite um comando");
      return;
    }

    setIsLoading(true);
    const commandId = `cmd-${Date.now()}`;

    try {
      const result = await executeCommandMutation.mutateAsync({
        command: commandInput,
      });

      const newEntry: CommandEntry = {
        id: result.id,
        input: commandInput,
        output: result.output || JSON.stringify(result, null, 2),
        status: result.status as "success" | "error" | "pending",
        timestamp: new Date(result.createdAt),
        executionTime: result.executionTime || undefined,
      };

      setCommands((prev) => [...prev, newEntry]);
      setCommandCount((prev) => prev + 1);
      setLastCommandTime(new Date().toLocaleTimeString("pt-BR"));
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);

      if (result.status === "error") {
        toast.error(`Erro: ${result.errorMessage}`);
      } else {
        toast.success("Comando executado com sucesso");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao executar comando");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistoryMutation.mutateAsync();
      setCommands([]);
      setCommandCount(0);
      toast.success("Histórico limpo com sucesso");
    } catch (error) {
      toast.error("Erro ao limpar histórico");
    }
  };

  const handleQuickCommand = (cmd: string) => {
    handleExecuteCommand(cmd);
  };

  const quickCommands = [
    { label: "Dashboard", cmd: "get_dashboard" },
    { label: "Missões", cmd: "list_missions" },
    { label: "Agentes", cmd: "list_agents" },
    { label: "Status", cmd: "status" },
    { label: "Ajuda", cmd: "help" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 font-mono overflow-hidden">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm p-4 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              ◆ GNOX TERMINAL ◆
            </h1>
          </div>
          <p className="text-xs text-cyan-300/70">
            [NATURAL LANGUAGE COMMAND INTERFACE v1.0]
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-4 p-4">
        {/* Terminal Output */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 border border-cyan-500/30 bg-slate-900/50 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <ScrollArea className="h-full w-full p-4">
              <div className="space-y-3">
                {commands.length === 0 ? (
                  <div className="text-center text-cyan-300/50 py-8">
                    <p className="text-sm">Nenhum comando executado ainda</p>
                    <p className="text-xs mt-2">Digite um comando ou use Quick Actions</p>
                  </div>
                ) : (
                  commands.map((entry) => (
                    <div key={entry.id} className="space-y-1 text-xs">
                      <div className="text-pink-400">
                        $ {entry.input}
                      </div>
                      <div className={`ml-2 ${entry.status === "error" ? "text-red-400" : "text-cyan-300"}`}>
                        {entry.status === "pending" && (
                          <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                        )}
                        <Streamdown className="inline">
                          {entry.output}
                        </Streamdown>
                      </div>
                      {entry.executionTime && (
                        <div className="text-cyan-500/50 text-xs">
                          ⏱ {entry.executionTime}ms
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleExecuteCommand(input);
                      }
                    }}
                    placeholder="Digite um comando em linguagem natural..."
                    className="bg-slate-800 border-cyan-500/30 text-cyan-400 placeholder:text-cyan-500/30 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
                    disabled={isLoading}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-cyan-500/30 rounded-md shadow-lg z-10">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setInput(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-500/10 border-b border-cyan-500/10 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleExecuteCommand(input)}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 hover:from-pink-600 hover:to-cyan-500 shadow-lg shadow-pink-500/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Commands */}
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.cmd}
                  onClick={() => handleQuickCommand(cmd.cmd)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          {/* Quick Actions */}
          <div className="border border-pink-500/30 bg-slate-900/50 rounded-lg p-4 shadow-lg shadow-pink-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-pink-500" />
              <h3 className="text-sm font-bold text-pink-400">QUICK ACTIONS</h3>
            </div>
            <div className="space-y-2">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.cmd}
                  onClick={() => handleQuickCommand(cmd.cmd)}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 text-xs bg-slate-800 border border-pink-500/20 text-pink-300 hover:bg-pink-500/10 hover:border-pink-400 rounded transition-colors disabled:opacity-50"
                >
                  [{cmd.label}]
                </button>
              ))}
            </div>
          </div>

          {/* Recent Commands */}
          <div className="border border-cyan-500/30 bg-slate-900/50 rounded-lg p-4 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-cyan-400">RECENT COMMANDS</h3>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {commands.slice(-5).reverse().map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => setInput(cmd.input)}
                  className="w-full text-left px-2 py-1 text-xs bg-slate-800 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 rounded truncate transition-colors"
                  title={cmd.input}
                >
                  {cmd.input}
                </button>
              ))}
              {commands.length === 0 && (
                <p className="text-xs text-cyan-500/50">Nenhum comando recente</p>
              )}
            </div>
          </div>

          {/* Help */}
          <div className="border border-cyan-500/30 bg-slate-900/50 rounded-lg p-4 shadow-lg shadow-cyan-500/10 backdrop-blur-sm flex-1">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-cyan-400">HELP</h3>
            </div>
            <div className="text-xs text-cyan-300/70 space-y-2 overflow-y-auto max-h-40">
              <div>
                <p className="font-bold text-cyan-400">Missões:</p>
                <p className="text-xs">create_mission, list_missions, complete_mission</p>
              </div>
              <div>
                <p className="font-bold text-cyan-400">Agentes:</p>
                <p className="text-xs">list_agents, get_agent_info, get_agent_report</p>
              </div>
              <div>
                <p className="font-bold text-cyan-400">Sistema:</p>
                <p className="text-xs">help, status, orchestrate</p>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="border border-cyan-500/30 bg-slate-900/50 rounded-lg p-3 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
            <div className="text-xs space-y-1 text-cyan-300/70">
              <div>▸ Comandos: {commandCount}</div>
              <div>◆ Último: {lastCommandTime || "—"}</div>
              <div>● Status: <span className="text-green-400">Ready</span></div>
              <div>⚡ v1.0</div>
            </div>
            <Button
              onClick={handleClearHistory}
              disabled={isLoading || commands.length === 0}
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs text-cyan-400 hover:text-pink-400 border border-cyan-500/20 hover:border-pink-500/30"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Limpar Histórico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
