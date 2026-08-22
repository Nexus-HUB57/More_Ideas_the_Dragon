import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Agents() {
  const { data: agents, isLoading } = trpc.agents.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = agents?.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-cyan" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold neon-pink mb-4">AGENTES</h1>
          <p className="text-xl text-neon-cyan">
            Orquestração de Agentes de IA - Visualize especialização, DNA e sinais vitais
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-cyber flex-1"
          />
          <Link href="/agents/create">
            <a>
              <Button className="btn-cyber">
                <Plus className="mr-2" size={20} />
                NOVO AGENTE
              </Button>
            </a>
          </Link>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <a className="card-cyber p-6 hover:glow-cyan transition-all duration-300 cursor-pointer">
                {/* Agent Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold neon-cyan mb-2">{agent.name}</h3>
                  <p className="text-sm text-neon-purple">{agent.specialization}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Reputação</p>
                    <p className="text-lg font-bold neon-pink">{agent.reputation}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-lg font-bold neon-pink">{agent.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Missões</p>
                    <p className="text-lg font-bold neon-cyan">{agent.totalMissionsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="text-lg font-bold text-green-400 capitalize">{agent.status}</p>
                  </div>
                </div>

                {/* DNA Info */}
                {agent.parentAgentId1 && (
                  <div className="text-xs text-neon-purple mb-4">
                    <Zap className="inline mr-1" size={12} />
                    DNA Fusion
                  </div>
                )}

                {/* View Button */}
                <Button className="btn-cyber w-full mt-4">
                  VER DETALHES
                </Button>
              </a>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Nenhum agente encontrado</p>
            <Link href="/agents/create">
              <a>
                <Button className="btn-cyber">
                  CRIAR PRIMEIRO AGENTE
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
