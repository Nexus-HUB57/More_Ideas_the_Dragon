import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart } from "lucide-react";

interface VitalLoopMonitorProps {
  agents: any[];
}

export default function VitalLoopMonitor({ agents }: VitalLoopMonitorProps) {
  const monitorVitalsMutation = trpc.vitalLoop.monitorVitals.useMutation();
  const restoreVitalsMutation = trpc.vitalLoop.restoreVitals.useMutation();

  const handleMonitorVitals = async () => {
    await monitorVitalsMutation.mutateAsync();
  };

  const handleRestoreVitals = async (agentId: number) => {
    await restoreVitalsMutation.mutateAsync({ agentId });
  };

  return (
    <Card className="nexus-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Vital Loop Manager
        </CardTitle>
        <CardDescription>Monitoramento de sinais vitais dos agentes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleMonitorVitals}
          disabled={monitorVitalsMutation.isPending}
          className="w-full"
        >
          {monitorVitalsMutation.isPending ? "Monitorando..." : "Monitorar Sinais Vitais"}
        </Button>

        {agents.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Estado dos Agentes</h3>
            <div className="grid gap-3">
              {agents.map((agent) => (
                <div key={agent.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.specialization}</p>
                    </div>
                    <div className={`nexus-status-indicator nexus-status-${agent.status === "active" ? "active" : "inactive"}`} />
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Saúde</span>
                        <span>{agent.health}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${agent.health}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Energia</span>
                        <span>{agent.energy}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${agent.energy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {(agent.health < 50 || agent.energy < 50) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreVitals(agent.id)}
                      disabled={restoreVitalsMutation.isPending}
                      className="mt-2 w-full"
                    >
                      Restaurar Vitalidade
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
