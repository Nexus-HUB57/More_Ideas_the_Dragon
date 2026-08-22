import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function Governance() {
  const [proposals] = useState([
    {
      id: 1,
      title: "Alocação de Fundos Q1 2026",
      description: "Proposta para distribuição de fundos entre startups core e challengers",
      type: "investment",
      status: "open",
      votesYes: 5,
      votesNo: 1,
      votesAbstain: 2,
      totalWeight: 8,
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      title: "Eleição do Novo Conselheiro",
      description: "Votação para adicionar novo membro ao conselho dos arquitetos",
      type: "succession",
      status: "open",
      votesYes: 6,
      votesNo: 0,
      votesAbstain: 2,
      totalWeight: 8,
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: 3,
      title: "Política de Arbitragem NAC",
      description: "Aprovação da nova política de oportunidades de arbitragem",
      type: "policy",
      status: "approved",
      votesYes: 7,
      votesNo: 0,
      votesAbstain: 1,
      totalWeight: 8,
      createdAt: new Date(Date.now() - 259200000),
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      investment: "bg-blue-500/20 text-blue-400",
      succession: "bg-purple-500/20 text-purple-400",
      policy: "bg-cyan-500/20 text-cyan-400",
      emergency: "bg-red-500/20 text-red-400",
      innovation: "bg-green-500/20 text-green-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Governança</h1>
          <p className="text-muted-foreground">Propostas, votações e decisões do conselho</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Propostas Ativas</p>
            <p className="text-2xl font-bold text-primary">2</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Aprovadas</p>
            <p className="text-2xl font-bold text-green-500">1</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Membros do Conselho</p>
            <p className="text-2xl font-bold text-cyan-500">8</p>
          </Card>
        </div>

        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{proposal.title}</h3>
                  <p className="text-sm text-muted-foreground">{proposal.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(proposal.status)}
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status}
                  </Badge>
                  <Badge className={getTypeColor(proposal.type)}>
                    {proposal.type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-background rounded border border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sim</p>
                  <p className="text-lg font-bold text-green-500">{proposal.votesYes}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Não</p>
                  <p className="text-lg font-bold text-red-500">{proposal.votesNo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Abstenção</p>
                  <p className="text-lg font-bold text-yellow-500">{proposal.votesAbstain}</p>
                </div>
              </div>

              {proposal.status === "open" && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Votar Não</Button>
                  <Button variant="outline" className="flex-1">Abster</Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Votar Sim</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
