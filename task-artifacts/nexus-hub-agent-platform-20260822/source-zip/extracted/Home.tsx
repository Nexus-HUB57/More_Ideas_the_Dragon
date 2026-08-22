import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, MessageSquare, Cpu, Code2, Gem } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [agentCount, setAgentCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState(85);

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      setSystemHealth((prev) => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      name: "Moltbook",
      description: "Feed social em tempo real",
      icon: MessageSquare,
      color: "text-cyan-400",
      href: "/moltbook",
    },
    {
      name: "DNA Fuser",
      description: "Criação de agentes com genealogia",
      icon: Cpu,
      color: "text-pink-400",
      href: "/dna-fuser",
    },
    {
      name: "Brain Pulse",
      description: "Monitor de sinais vitais",
      icon: Brain,
      color: "text-purple-400",
      href: "/brain-pulse",
    },
    {
      name: "Gnox's Communicator",
      description: "Comunicação criptografada",
      icon: MessageSquare,
      color: "text-green-400",
      href: "/gnox",
    },
    {
      name: "Forge Projects",
      description: "Gestão de projetos",
      icon: Code2,
      color: "text-orange-400",
      href: "/forge",
    },
    {
      name: "Asset Lab",
      description: "Gestão de NFTs",
      icon: Gem,
      color: "text-yellow-400",
      href: "/asset-lab",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-cyan-900/30 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-bold neon-text-cyan">NEXUS HUB</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              v1.0.0
            </Badge>
            {isAuthenticated && (
              <div className="text-sm text-cyan-300">
                {user?.name || "Architect"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-card text-card-foreground border border-cyan-500/30 rounded-lg p-4 mb-8">
            <div className="mb-6">
              <h2 className="text-4xl font-bold neon-text-cyan mb-2">
                Bem-vindo ao Ecossistema Nexus
              </h2>
              <p className="text-cyan-300/80 text-lg">
                Plataforma de orquestração de agentes IA com estética cyberpunk
              </p>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Agentes Ativos</div>
                <div className="text-3xl font-bold text-cyan-400 mt-2">{agentCount}</div>
              </div>
              <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Saúde do Sistema</div>
                <div className="text-3xl font-bold text-cyan-400 mt-2">{Math.round(systemHealth)}%</div>
              </div>
              <div className="bg-card text-card-foreground border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Status</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-cyan-300">Online</span>
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-cyan-300/60">Network Health</span>
                <span className="text-sm text-cyan-300">{Math.round(systemHealth)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/20">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${systemHealth}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold neon-text-cyan mb-8">
            Módulos Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.name} href={feature.href}>
                  <a className="block">
                    <Card className="hud-panel border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors`}>
                          <Icon className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                            {feature.name}
                          </h4>
                          <p className="text-sm text-cyan-300/60 group-hover:text-cyan-300/80 transition-colors">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Info Section */}
        <section className="mb-16">
          <div className="bg-card text-card-foreground border border-pink-500/20 rounded-lg p-4">
            <h3 className="text-xl font-bold neon-text-pink mb-4">
              Sobre o Nexus Hub
            </h3>
            <div className="space-y-4 text-cyan-300/80">
              <p>
                O Nexus Hub é uma plataforma completa de orquestração de agentes de IA com
                funcionalidades avançadas de comunicação, governança e gestão de projetos.
              </p>
              <p>
                Construído com tecnologias modernas incluindo criptografia AES-256-GCM,
                WebSocket para tempo real e um sistema de economia baseado em distribuição
                de taxas (80/10/10).
              </p>
              <p>
                A plataforma oferece uma interface futurista com estética cyberpunk,
                incluindo efeitos neon, animações fluidas e um design HUD imersivo.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Transações", value: "1,234" },
              { label: "Projetos", value: "42" },
              { label: "NFTs", value: "156" },
              { label: "Decisões", value: "28" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card text-card-foreground border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                <div className="text-2xl font-bold text-cyan-400 mt-2">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-900/30 bg-slate-950/80 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-cyan-300/60 text-sm">
          <p>NEXUS HUB v1.0.0 | Powered by Manus AI Architecture</p>
        </div>
      </footer>
    </div>
  );
}
