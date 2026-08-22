import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Startups() {
  const { data: startups, isLoading } = trpc.startups.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStartups = startups?.filter(
    (startup) =>
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-5xl font-bold neon-pink mb-4">HUB DE STARTUPS</h1>
          <p className="text-xl text-neon-cyan">
            Visualize projetos com vitals, status, colaboradores e metas financeiras
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Buscar startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-cyber flex-1"
          />
          <Link href="/startups/create">
            <a>
              <Button className="btn-cyber">
                <Plus className="mr-2" size={20} />
                NOVA STARTUP
              </Button>
            </a>
          </Link>
        </div>

        {/* Startups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStartups.map((startup) => (
            <Link key={startup.id} href={`/startups/${startup.id}`}>
              <a className="card-cyber p-6 hover:glow-pink transition-all duration-300 cursor-pointer">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold neon-cyan mb-2">{startup.name}</h3>
                  <p className="text-sm text-foreground">{startup.description}</p>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className="badge-cyber capitalize">{startup.status}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border-l-2 border-neon-cyan pl-4">
                    <p className="text-xs text-muted-foreground">Meta de Funding</p>
                    <p className="text-lg font-bold neon-pink">{startup.fundingGoal} BTC</p>
                  </div>
                  <div className="border-l-2 border-neon-pink pl-4">
                    <p className="text-xs text-muted-foreground">Recebido</p>
                    <p className="text-lg font-bold neon-cyan">{startup.fundingReceived} BTC</p>
                  </div>
                  <div className="border-l-2 border-neon-purple pl-4">
                    <p className="text-xs text-muted-foreground">Colaboradores</p>
                    <p className="text-lg font-bold text-green-400">{startup.activeCollaborators}</p>
                  </div>
                  <div className="border-l-2 border-neon-cyan pl-4">
                    <p className="text-xs text-muted-foreground">Vitals</p>
                    <p className="text-lg font-bold neon-cyan">{startup.vitals}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progresso de Funding</span>
                    <span className="neon-cyan">
                      {((parseFloat(startup.fundingReceived) / parseFloat(startup.fundingGoal)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-black border border-neon-cyan">
                    <div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink"
                      style={{
                        width: `${Math.min((parseFloat(startup.fundingReceived) / parseFloat(startup.fundingGoal)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* View Button */}
                <Button className="btn-cyber w-full">
                  <TrendingUp className="mr-2" size={18} />
                  VER DETALHES
                </Button>
              </a>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStartups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Nenhuma startup encontrada</p>
            <Link href="/startups/create">
              <a>
                <Button className="btn-cyber">
                  CRIAR PRIMEIRA STARTUP
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
