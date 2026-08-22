import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, Zap, Lightbulb, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function BrainPulse() {
  const { user, loading } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [pulseHistory, setPulseHistory] = useState<any[]>([]);

  const agentsQuery = trpc.agents.list.useQuery();
  const historyQuery = trpc.agents.brainPulseHistory.useQuery(
    { agentId: selectedAgent, limit: 50 },
    { enabled: !!selectedAgent }
  );
  const recordPulseMutation = trpc.agents.recordBrainPulse.useMutation();

  useEffect(() => {
    if (historyQuery.data) {
      setPulseHistory(historyQuery.data);
    }
  }, [historyQuery.data]);

  const handleRecordPulse = async () => {
    if (!selectedAgent) {
      toast.error("Selecione um agente");
      return;
    }

    try {
      const health = Math.floor(Math.random() * 100);
      const energy = Math.floor(Math.random() * 100);
      const creativity = Math.floor(Math.random() * 100);

      await recordPulseMutation.mutateAsync({
        agentId: selectedAgent,
        health,
        energy,
        creativity,
        decision: ["Reflexão", "Criação", "Colaboração", "Aprendizado"][Math.floor(Math.random() * 4)],
      });

      toast.success("Pulso registrado com sucesso!");
      historyQuery.refetch();
    } catch (error) {
      toast.error("Erro ao registrar pulso");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  const latestPulse = pulseHistory[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <h1 className="text-2xl font-bold neon-glow">Brain Pulse Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Sinais vitais dos agentes em tempo real</p>
        </div>
      </header>

      <div className="container py-8">
        {/* Agent Selection */}
        <Card className="card-neon p-6 mb-8">
          <label className="text-sm font-medium text-muted-foreground">Monitorar Agente</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground"
          >
            <option value="">-- Selecione um agente --</option>
            {agentsQuery.data?.map((agent) => (
              <option key={agent.id} value={agent.agentId}>
                {agent.name} ({agent.status})
              </option>
            ))}
          </select>

          <Button
            className="btn-neon-cyan w-full mt-4"
            onClick={handleRecordPulse}
            disabled={!selectedAgent}
          >
            <Activity className="w-4 h-4 mr-2" />
            Registrar Pulso Agora
          </Button>
        </Card>

        {/* Current Pulse */}
        {selectedAgent && latestPulse && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Sinais Vitais Atuais</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Health */}
              <Card className="card-neon p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-accent neon-glow">Saúde</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{latestPulse.health}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${latestPulse.health}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {latestPulse.health > 70 ? "✓ Saudável" : latestPulse.health > 40 ? "⚠ Moderado" : "✗ Crítico"}
                </p>
              </Card>

              {/* Energy */}
              <Card className="card-neon-cyan p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-cyan-400 neon-glow-cyan">Energia</span>
                  </div>
                  <span className="text-2xl font-bold text-cyan-400">{latestPulse.energy}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${latestPulse.energy}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {latestPulse.energy > 70 ? "✓ Carregado" : latestPulse.energy > 40 ? "⚠ Moderado" : "✗ Baixo"}
                </p>
              </Card>

              {/* Creativity */}
              <Card className="card-neon p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-accent neon-glow">Criatividade</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{latestPulse.creativity}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${latestPulse.creativity}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {latestPulse.creativity > 70 ? "✓ Elevada" : latestPulse.creativity > 40 ? "⚠ Normal" : "✗ Baixa"}
                </p>
              </Card>
            </div>

            {/* Decision */}
            {latestPulse.decision && (
              <Card className="card-neon-cyan p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Decisão Autônoma</p>
                <p className="text-lg font-bold text-cyan-400 neon-glow-cyan">{latestPulse.decision}</p>
              </Card>
            )}
          </div>
        )}

        {/* History */}
        {pulseHistory.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-6 neon-glow">Histórico de Pulsos</h2>
            <div className="space-y-4">
              {pulseHistory.slice(1, 11).map((pulse, idx) => (
                <Card key={idx} className="card-neon p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {new Date(pulse.createdAt).toLocaleString()}
                      </p>
                      <div className="flex gap-6 mt-2 text-sm">
                        <span>
                          <span className="text-muted-foreground">Saúde:</span>{" "}
                          <span className="text-red-400 font-bold">{pulse.health}%</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Energia:</span>{" "}
                          <span className="text-cyan-400 font-bold">{pulse.energy}%</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Criatividade:</span>{" "}
                          <span className="text-yellow-400 font-bold">{pulse.creativity}%</span>
                        </span>
                      </div>
                    </div>
                    {pulse.decision && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        {pulse.decision}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!selectedAgent && (
          <Card className="card-neon p-12 text-center">
            <p className="text-muted-foreground">Selecione um agente para monitorar seus sinais vitais</p>
          </Card>
        )}
      </div>
    </div>
  );
}
