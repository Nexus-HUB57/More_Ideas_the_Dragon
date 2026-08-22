import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Send, History, HelpCircle, Zap } from "lucide-react";

interface CommandEntry {
  id: string;
  command: string;
  result: any;
  timestamp: Date;
  status: "success" | "error";
}

export default function GnoxTerminal() {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const availableCommands = [
    "create_mission",
    "list_missions",
    "complete_mission",
    "fail_mission",
    "list_agents",
    "get_agent_info",
    "get_agent_report",
    "orchestrate",
    "get_orchestration_stats",
    "get_reward_stats",
    "get_transaction_history",
    "get_dashboard",
    "get_mission_metrics",
    "help",
    "status",
  ];

  // Auto-scroll para o final
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Gerar sugestões
    const matching = availableCommands.filter((cmd) =>
      cmd.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(matching.slice(0, 5));
  };

  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      // Simular execução de comando
      const entry: CommandEntry = {
        id: Math.random().toString(36).substr(2, 9),
        command,
        result: { message: "Command executed successfully" },
        timestamp: new Date(),
        status: "success",
      };

      setCommandHistory([...commandHistory, entry]);
      setInput("");
      setSuggestions([]);
    } catch (error) {
      const entry: CommandEntry = {
        id: Math.random().toString(36).substr(2, 9),
        command,
        result: { error: error instanceof Error ? error.message : "Unknown error" },
        timestamp: new Date(),
        status: "error",
      };

      setCommandHistory([...commandHistory, entry]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  const quickCommands = [
    { label: "Dashboard", command: "get_dashboard" },
    { label: "List Missions", command: "list_missions" },
    { label: "List Agents", command: "list_agents" },
    { label: "Orchestrate", command: "orchestrate" },
    { label: "System Status", command: "status" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8 border-b border-cyan-500/30 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2 flex items-center gap-3">
              <Terminal className="w-8 h-8" />
              ◆ GNOX TERMINAL ◆
            </h1>
            <p className="text-cyan-400/70 text-sm tracking-widest">
              [NATURAL LANGUAGE COMMAND INTERFACE v1.0]
            </p>
          </div>
          <Button
            onClick={() => setShowHelp(!showHelp)}
            className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 border border-purple-400/50"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Terminal Output */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm h-96 flex flex-col">
            <div className="p-4 border-b border-cyan-500/20">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                [COMMAND OUTPUT]
              </h2>
            </div>

            {/* Terminal Output Area */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3"
            >
              {commandHistory.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <p>Welcome to Nexus Gnox Terminal</p>
                  <p className="text-xs mt-2">Type a command to get started...</p>
                </div>
              ) : (
                commandHistory.map((entry) => (
                  <div key={entry.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400">$</span>
                      <span className="text-cyan-400">{entry.command}</span>
                    </div>
                    <div
                      className={`ml-4 text-xs ${
                        entry.status === "success" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {typeof entry.result === "object"
                        ? JSON.stringify(entry.result, null, 2)
                        : String(entry.result)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-cyan-500/20 space-y-2">
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 text-xs rounded border border-cyan-400/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleExecuteCommand(input);
                    }
                  }}
                  placeholder="Enter command (e.g., list_missions, get_dashboard)..."
                  className="bg-slate-800 border-cyan-500/30 text-cyan-400 placeholder-gray-600 focus:border-cyan-400"
                />
                <Button
                  onClick={() => handleExecuteCommand(input)}
                  className="bg-pink-500/20 hover:bg-pink-500/40 text-pink-400 border border-pink-400/50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Commands */}
          <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm p-4">
            <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              [QUICK COMMANDS]
            </h3>
            <div className="space-y-2">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => handleExecuteCommand(cmd.command)}
                  className="w-full px-3 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-sm rounded border border-pink-400/30 transition-colors text-left"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Command History */}
          <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-4">
            <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              [RECENT COMMANDS]
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {commandHistory.slice(-5).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setInput(entry.command)}
                  className="w-full px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-400/30 transition-colors text-left truncate"
                  title={entry.command}
                >
                  {entry.command}
                </button>
              ))}
            </div>
          </Card>

          {/* Help Panel */}
          {showHelp && (
            <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur-sm p-4">
              <h3 className="text-sm font-bold text-green-400 mb-3">[HELP]</h3>
              <div className="text-xs text-green-400/70 space-y-2">
                <p>
                  <strong>Missions:</strong> create_mission, list_missions, complete_mission
                </p>
                <p>
                  <strong>Agents:</strong> list_agents, get_agent_info, get_agent_report
                </p>
                <p>
                  <strong>System:</strong> orchestrate, get_dashboard, status
                </p>
                <p className="mt-3 text-green-400">
                  Type command names or use natural language!
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-cyan-500/30 pt-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500 font-mono">
          <div>
            <span className="text-cyan-400">▸</span> Commands Executed: {commandHistory.length}
          </div>
          <div>
            <span className="text-pink-400">◆</span> Last Command:{" "}
            {commandHistory.length > 0
              ? new Date(commandHistory[commandHistory.length - 1].timestamp).toLocaleTimeString()
              : "None"}
          </div>
          <div>
            <span className="text-green-400">●</span> Terminal Status: Ready
          </div>
          <div className="text-right">
            <span className="text-purple-400">⚡</span> Gnox v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
