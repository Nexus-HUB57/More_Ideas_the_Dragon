import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Zap } from "lucide-react";

interface OrchestratorViewProps {
  agents: any[];
  metrics: any;
}

export default function OrchestratorView({ agents, metrics }: OrchestratorViewProps) {
  const generateMissionsMutation = trpc.orchestrator.generateMissions.useMutation();

  const handleGenerateMissions = async () => {
    await generateMissionsMutation.mutateAsync({
      marketSentiment: "neutral",
      harmonyLevel: metrics?.harmonyLevel || 50,
      activeAgents: agents.length,
      recentPriceChanges: { BTC: 0, ETH: 0 },
      systemHealth: metrics?.avgHealth || 50,
    });
  };

  return (
    <Card className="nexus-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Nexus Orchestrator
        </CardTitle>
        <CardDescription>Orquestração inteligente de missões baseada em contexto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold">Contexto Atual</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>Sentimento: Neutral</p>
              <p>Harmonia: {metrics?.harmonyLevel || 0}/100</p>
              <p>Agentes: {agents.length}</p>
              <p>Saúde Média: {metrics?.avgHealth || 0}%</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold">Estatísticas</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>Missões Completadas: {metrics?.missionsCompleted || 0}</p>
              <p>Energia Média: {metrics?.avgEnergy || 0}%</p>
              <p>Status: Operacional</p>
              <p>Última Atualização: Agora</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerateMissions}
          disabled={generateMissionsMutation.isPending}
          className="w-full"
        >
          {generateMissionsMutation.isPending ? "Gerando..." : "Gerar Missões"}
        </Button>

        {agents.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Agentes Disponíveis</h3>
            <div className="grid gap-2">
              {agents.slice(0, 3).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>Rep: {agent.reputation}</p>
                    <p>Health: {agent.health}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
