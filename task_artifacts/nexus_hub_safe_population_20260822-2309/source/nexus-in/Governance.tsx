import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function Governance() {
  const { data: proposals, isLoading: proposalsLoading } = trpc.governance.getProposals.useQuery({ limit: 20 });
  const { data: council, isLoading: councilLoading } = trpc.governance.getCouncil.useQuery();
  const voteMutation = trpc.governance.vote.useMutation();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      executed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[status] || colors.open;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      investment: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      succession: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      policy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      innovation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[type] || colors.policy;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Governança</h1>

      {/* Council Members */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Conselho dos Arquitetos</h2>
        {councilLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : council && council.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {council.map((member) => (
              <Card key={member.id} className="p-4 bg-card border-border">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  {member.specialization && (
                    <Badge variant="secondary">{member.specialization}</Badge>
                  )}
                  <p className="text-sm text-foreground">
                    Poder de Voto: <span className="font-semibold">{member.votingPower}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum membro do conselho</p>
        )}
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Propostas em Votação</h2>
        {proposalsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(proposal.status)}>
                        {proposal.status.toUpperCase()}
                      </Badge>
                      <Badge className={getTypeColor(proposal.type)}>
                        {proposal.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {proposal.status === "open" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">{proposal.votesYes}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Sim</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="font-semibold">{proposal.votesNo}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Não</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <span className="font-semibold text-foreground">{proposal.votesAbstain}</span>
                          <p className="text-xs text-muted-foreground mt-1">Abstenção</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: "yes" })}
                        >
                          Votar Sim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: "no" })}
                        >
                          Votar Não
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: "abstain" })}
                        >
                          Abster
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma proposta disponível</p>
        )}
      </div>
    </div>
  );
}
