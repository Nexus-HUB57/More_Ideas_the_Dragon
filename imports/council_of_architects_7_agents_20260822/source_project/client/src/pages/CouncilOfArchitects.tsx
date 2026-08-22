import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface CouncilMember {
  id: number;
  name: string;
  role: string;
  votingPower: number;
  specialization: string;
  description: string | null;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  type: "investment" | "succession" | "policy" | "emergency" | "innovation";
  status: "open" | "approved" | "rejected" | "executed";
  expectedImpact?: string;
  riskAssessment?: string;
  createdAt: Date;
  votesYes: number;
  votesNo: number;
  votesAbstain: number;
  weightedYes: number;
  weightedNo: number;
  totalVotingPowerCast: number;
}

const COUNCIL_COLORS: Record<string, string> = {
  AETERNO: "#3b82f6",
  "EVA-ALPHA": "#ec4899",
  "IMPERADOR-CORE": "#f59e0b",
  AETHELGARD: "#8b5cf6",
  "NEXUS-COMPLIANCE": "#10b981",
  "INNOVATION-NEXUS": "#f97316",
  "RISK-GUARDIAN": "#ef4444",
};

export default function CouncilOfArchitects() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  // Fetch council members
  const { data: members, isLoading: membersLoading } = trpc.councilOfArchitects.council.members.useQuery();

  // Fetch proposals
  const { data: proposalsData, isLoading: proposalsLoading, refetch: refetchProposals } = trpc.councilOfArchitects.voting.listProposals.useQuery({
    status: filterStatus !== "all" ? (filterStatus as any) : undefined,
    type: filterType !== "all" ? filterType : undefined,
    limit: 50,
  });

  // Fetch voting distribution
  const { data: votingDistribution } = trpc.councilOfArchitects.council.getVotingPowerDistribution.useQuery();

  // Fetch council health metrics
  const { data: healthMetrics } = trpc.councilOfArchitects.analytics.getCouncilHealthMetrics.useQuery();

  // Fetch voting patterns
  const { data: votingPatterns } = trpc.councilOfArchitects.analytics.getVotingPatterns.useQuery();

  // Create proposal mutation
  const createProposalMutation = trpc.councilOfArchitects.voting.createProposal.useMutation({
    onSuccess: () => {
      setIsCreatingProposal(false);
      refetchProposals();
    },
  });

  useEffect(() => {
    if (proposalsData) {
      setProposals(proposalsData as any);
    }
  }, [proposalsData]);

  const handleCreateProposal = (data: any) => {
    createProposalMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "executed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "executed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProposalTypeBadgeColor = (type: string) => {
    switch (type) {
      case "investment":
        return "bg-purple-100 text-purple-800";
      case "succession":
        return "bg-indigo-100 text-indigo-800";
      case "policy":
        return "bg-cyan-100 text-cyan-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      case "innovation":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Conselho dos Arquitetos</h1>
          <p className="text-gray-600 mt-2">Governança Descentralizada - 7 Agentes Elite com Votação Ponderada</p>
        </div>
        <Dialog open={isCreatingProposal} onOpenChange={setIsCreatingProposal}>
          <DialogTrigger asChild>
            <Button size="lg">Criar Proposta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateProposalDialog onSuccess={handleCreateProposal} isLoading={createProposalMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="proposals">Propostas</TabsTrigger>
          <TabsTrigger value="voting">Votação</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <CouncilOverview members={members || []} votingDistribution={votingDistribution} healthMetrics={healthMetrics} />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <CouncilMembersView members={members || []} />
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-4">
          <ProposalsView
            proposals={proposals}
            isLoading={proposalsLoading}
            filterStatus={filterStatus}
            filterType={filterType}
            onFilterStatusChange={setFilterStatus}
            onFilterTypeChange={setFilterType}
            onSelectProposal={setSelectedProposal}
            getStatusBadgeColor={getStatusBadgeColor}
            getProposalTypeBadgeColor={getProposalTypeBadgeColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        {/* Voting Tab */}
        <TabsContent value="voting" className="space-y-4">
          {selectedProposal ? (
            <VotingView proposal={selectedProposal} members={members || []} onVoteSuccess={() => refetchProposals()} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">Selecione uma proposta na aba Propostas para ver os votos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsView members={members || []} votingPatterns={votingPatterns} healthMetrics={healthMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// COUNCIL OVERVIEW
// ============================================

interface CouncilOverviewProps {
  members: CouncilMember[];
  votingDistribution?: any;
  healthMetrics?: any;
}

function CouncilOverview({ members, votingDistribution, healthMetrics }: CouncilOverviewProps) {
  const totalVotingPower = members.reduce((sum, m) => sum + m.votingPower, 0);
  const votingPowerData = members.map((m) => ({
    name: m.name,
    value: m.votingPower,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Total de Membros</p>
            <p className="text-3xl font-bold">{members.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Poder de Voto Total</p>
            <p className="text-3xl font-bold">{totalVotingPower}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Limiar de Aprovação</p>
            <p className="text-3xl font-bold">{(totalVotingPower / 2 + 0.5).toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Taxa de Participação</p>
            <p className="text-3xl font-bold text-green-600">{healthMetrics?.participationRate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Voting Power Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Poder de Voto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={votingPowerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {members.map((member, index) => (
                  <Cell key={`cell-${index}`} fill={COUNCIL_COLORS[member.name] || "#999"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// COUNCIL MEMBERS VIEW
// ============================================

interface CouncilMembersViewProps {
  members: CouncilMember[];
}

function CouncilMembersView({ members }: CouncilMembersViewProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </div>
              <Badge>{member.votingPower} voto{member.votingPower > 1 ? "s" : ""}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Especialização</p>
              <p className="font-medium text-sm">{member.specialization}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="text-sm text-gray-700">{member.description || "Sem descrição"}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// PROPOSALS VIEW
// ============================================

interface ProposalsViewProps {
  proposals: Proposal[];
  isLoading: boolean;
  filterStatus: string;
  filterType: string;
  onFilterStatusChange: (status: string) => void;
  onFilterTypeChange: (type: string) => void;
  onSelectProposal: (proposal: Proposal) => void;
  getStatusBadgeColor: (status: string) => string;
  getProposalTypeBadgeColor: (type: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

function ProposalsView({
  proposals,
  isLoading,
  filterStatus,
  filterType,
  onFilterStatusChange,
  onFilterTypeChange,
  onSelectProposal,
  getStatusBadgeColor,
  getProposalTypeBadgeColor,
  getStatusIcon,
}: ProposalsViewProps) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
                <SelectItem value="executed">Executada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="succession">Sucessão</SelectItem>
                <SelectItem value="policy">Política</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
                <SelectItem value="innovation">Inovação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">Nenhuma proposta encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectProposal(proposal)}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      <p className="font-semibold">{proposal.title}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getStatusBadgeColor(proposal.status)}>{proposal.status}</Badge>
                      <Badge className={getProposalTypeBadgeColor(proposal.type)}>{proposal.type}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {proposal.weightedYes}/{proposal.totalVotingPowerCast}
                    </p>
                    <p className="text-xs text-gray-500">votos sim</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// VOTING VIEW
// ============================================

interface VotingViewProps {
  proposal: Proposal;
  members: CouncilMember[];
  onVoteSuccess: () => void;
}

function VotingView({ proposal, members, onVoteSuccess }: VotingViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | "abstain" | null>(null);
  const [reasoning, setReasoning] = useState("");

  const { data: votingStatus } = trpc.councilOfArchitects.voting.getVotingStatus.useQuery({ proposalId: proposal.id });
  const { data: votes } = trpc.councilOfArchitects.voting.getVotes.useQuery({ proposalId: proposal.id });

  const voteMutation = trpc.councilOfArchitects.voting.vote.useMutation({
    onSuccess: () => {
      setSelectedMemberId(null);
      setSelectedVote(null);
      setReasoning("");
      onVoteSuccess();
    },
  });

  const handleVote = () => {
    if (!selectedMemberId || !selectedVote) return;
    voteMutation.mutate({
      proposalId: proposal.id,
      memberId: selectedMemberId,
      vote: selectedVote,
      reasoning: reasoning || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Voting Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Votação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Votos Sim</p>
              <p className="text-2xl font-bold text-green-600">{votingStatus?.weightedYes || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Votos Não</p>
              <p className="text-2xl font-bold text-red-600">{votingStatus?.weightedNo || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Abstenções</p>
              <p className="text-2xl font-bold text-gray-600">{votingStatus?.weightedAbstain || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Limiar</p>
              <p className="text-2xl font-bold">{votingStatus?.approvalThreshold.toFixed(1)}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Probabilidade de Aprovação</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${votingStatus?.approvalLikelihood || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{votingStatus?.approvalLikelihood || 0}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Cast Vote */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Voto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMemberId?.toString() || ""} onValueChange={(v) => setSelectedMemberId(parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um membro" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.name} ({member.votingPower} voto{member.votingPower > 1 ? "s" : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={selectedVote === "yes" ? "default" : "outline"}
              onClick={() => setSelectedVote("yes")}
              className="flex-1"
            >
              Sim
            </Button>
            <Button
              variant={selectedVote === "no" ? "default" : "outline"}
              onClick={() => setSelectedVote("no")}
              className="flex-1"
            >
              Não
            </Button>
            <Button
              variant={selectedVote === "abstain" ? "default" : "outline"}
              onClick={() => setSelectedVote("abstain")}
              className="flex-1"
            >
              Abstenção
            </Button>
          </div>

          <Textarea
            placeholder="Justificativa (opcional)"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="min-h-24"
          />

          <Button onClick={handleVote} disabled={!selectedMemberId || !selectedVote || voteMutation.isPending} className="w-full">
            {voteMutation.isPending ? "Registrando..." : "Registrar Voto"}
          </Button>
        </CardContent>
      </Card>

      {/* Votes List */}
      <Card>
        <CardHeader>
          <CardTitle>Votos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {votes && votes.length > 0 ? (
            <div className="space-y-2">
              {votes.map((vote: any) => (
                <div key={vote.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Membro ID: {vote.memberId}</p>
                    <p className="text-sm text-gray-600">{vote.reasoning}</p>
                  </div>
                  <Badge variant={vote.vote === "yes" ? "default" : vote.vote === "no" ? "destructive" : "secondary"}>
                    {vote.vote} ({vote.weight})
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum voto registrado ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// ANALYTICS VIEW
// ============================================

interface AnalyticsViewProps {
  members: CouncilMember[];
  votingPatterns?: any;
  healthMetrics?: any;
}

function AnalyticsView({ members, votingPatterns, healthMetrics }: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Total de Propostas</p>
            <p className="text-3xl font-bold">{votingPatterns?.totalProposals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Aprovadas</p>
            <p className="text-3xl font-bold text-green-600">{votingPatterns?.approvedProposals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Rejeitadas</p>
            <p className="text-3xl font-bold text-red-600">{votingPatterns?.rejectedProposals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">Taxa de Aprovação</p>
            <p className="text-3xl font-bold">{votingPatterns?.approvalRate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Propostas",
                  Aprovadas: votingPatterns?.approvedProposals || 0,
                  Rejeitadas: votingPatterns?.rejectedProposals || 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprovadas" fill="#10b981" />
              <Bar dataKey="Rejeitadas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Execution Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Saúde do Conselho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium">Taxa de Participação</p>
              <p className="text-sm font-bold">{healthMetrics?.participationRate || 0}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${healthMetrics?.participationRate || 0}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium">Taxa de Execução</p>
              <p className="text-sm font-bold">{healthMetrics?.executionSuccessRate || 0}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${healthMetrics?.executionSuccessRate || 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// CREATE PROPOSAL DIALOG
// ============================================

interface CreateProposalDialogProps {
  onSuccess: (data: any) => void;
  isLoading: boolean;
}

function CreateProposalDialog({ onSuccess, isLoading }: CreateProposalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"investment" | "succession" | "policy" | "emergency" | "innovation" | "">();
  const [expectedImpact, setExpectedImpact] = useState("");
  const [riskAssessment, setRiskAssessment] = useState("");

  const handleSubmit = () => {
    if (!title || !description || !type) return;
    onSuccess({
      title,
      description,
      type: type as any,
      expectedImpact: expectedImpact || undefined,
      riskAssessment: riskAssessment || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Criar Nova Proposta</DialogTitle>
        <DialogDescription>Preencha os detalhes da proposta para o Conselho dos Arquitetos</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da proposta" />
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição detalhada" className="min-h-24" />
        </div>

        <div>
          <label className="text-sm font-medium">Tipo</label>
          <Select value={type || ""} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="investment">Investimento</SelectItem>
              <SelectItem value="succession">Sucessão</SelectItem>
              <SelectItem value="policy">Política</SelectItem>
              <SelectItem value="emergency">Emergência</SelectItem>
              <SelectItem value="innovation">Inovação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Impacto Esperado (opcional)</label>
          <Textarea value={expectedImpact} onChange={(e) => setExpectedImpact(e.target.value)} placeholder="Descreva o impacto esperado" className="min-h-20" />
        </div>

        <div>
          <label className="text-sm font-medium">Avaliação de Risco (opcional)</label>
          <Textarea value={riskAssessment} onChange={(e) => setRiskAssessment(e.target.value)} placeholder="Descreva os riscos associados" className="min-h-20" />
        </div>

        <Button onClick={handleSubmit} disabled={!title || !description || !type || isLoading} className="w-full">
          {isLoading ? "Criando..." : "Criar Proposta"}
        </Button>
      </div>
    </div>
  );
}
