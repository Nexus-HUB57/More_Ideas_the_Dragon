import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Governance() {
  const { data: councilMembers, isLoading: membersLoading } = trpc.council.members.useQuery();
  const { data: proposals, isLoading: proposalsLoading } = trpc.proposals.list.useQuery({});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Governança</h1>
        <p className="text-slate-400">Conselho dos Arquitetos com votação ponderada</p>
      </div>

      {/* Council Members */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Conselho dos 7 Arquitetos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {membersLoading ? (
            Array(7)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)
          ) : (
            councilMembers?.map((member) => (
              <Card key={member.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{member.specialization}</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-300">Poder: {member.votingPower}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Proposals */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Propostas em Votação</h2>
        <div className="space-y-4">
          {proposalsLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-24 bg-slate-700" />)
          ) : (
            proposals?.map((proposal) => (
              <Card key={proposal.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{proposal.title}</h3>
                      <p className="text-sm text-slate-400">{proposal.description}</p>
                    </div>
                    <Badge
                      className={
                        proposal.status === "approved"
                          ? "bg-green-500"
                          : proposal.status === "rejected"
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{proposal.votesYes} Sim</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-slate-300">{proposal.votesNo} Não</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
