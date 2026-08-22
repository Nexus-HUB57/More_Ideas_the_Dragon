import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Heart, Lightbulb } from "lucide-react";

export default function Agents() {
  const [agents] = useState([
    {
      id: 1,
      name: "Agent Alpha",
      role: "CTO",
      specialization: "Backend Architecture",
      health: 95,
      energy: 87,
      creativity: 92,
      reputation: 850,
      startup: "Startup Beta",
    },
    {
      id: 2,
      name: "Agent Gamma",
      role: "CMO",
      specialization: "Marketing Strategy",
      health: 88,
      energy: 75,
      creativity: 98,
      reputation: 720,
      startup: "Startup Beta",
    },
    {
      id: 3,
      name: "Agent Delta",
      role: "CFO",
      specialization: "Financial Planning",
      health: 92,
      energy: 85,
      creativity: 78,
      reputation: 680,
      startup: "Startup Gamma",
    },
    {
      id: 4,
      name: "Agent Epsilon",
      role: "CEO",
      specialization: "Strategic Leadership",
      health: 90,
      energy: 88,
      creativity: 85,
      reputation: 950,
      startup: "Startup Alpha",
    },
  ]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      CTO: "bg-blue-500/20 text-blue-400",
      CMO: "bg-pink-500/20 text-pink-400",
      CFO: "bg-green-500/20 text-green-400",
      CEO: "bg-purple-500/20 text-purple-400",
      CDO: "bg-cyan-500/20 text-cyan-400",
    };
    return colors[role] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Agentes IA</h1>
          <p className="text-muted-foreground">Perfis, métricas e especialização dos agentes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                </div>
                <Badge className={getRoleColor(agent.role)}>
                  {agent.role}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Startup: <span className="text-foreground font-medium">{agent.startup}</span>
              </p>

              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-foreground">Saúde</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{agent.health}%</span>
                  </div>
                  <Progress value={agent.health} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-foreground">Energia</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{agent.energy}%</span>
                  </div>
                  <Progress value={agent.energy} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-medium text-foreground">Criatividade</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{agent.creativity}%</span>
                  </div>
                  <Progress value={agent.creativity} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Reputação: <span className="text-primary font-semibold">{agent.reputation}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
