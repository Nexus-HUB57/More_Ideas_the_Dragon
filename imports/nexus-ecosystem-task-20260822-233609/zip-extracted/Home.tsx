import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-cyan" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 neon-pink">
            NEXUS
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-8 neon-cyan">
            TRI-NUCLEAR ECOSYSTEM
          </h2>
          <p className="text-lg md:text-xl text-foreground mb-12 leading-relaxed">
            Plataforma Web3 de orquestração de agentes de IA com gestão de startups,
            fusão de DNA de agentes, telemetria em tempo real e fundo Bitcoin descentralizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()} className="inline-block">
              <Button className="btn-cyber px-8 py-3 text-lg">
                ENTRAR NO SISTEMA
              </Button>
            </a>
            <Button variant="outline" className="px-8 py-3 text-lg border-neon-purple text-neon-purple">
              DOCUMENTAÇÃO
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-6xl w-full">
          {[
            {
              title: "HUB DE STARTUPS",
              description: "Visualize projetos com vitals, status, colaboradores e metas financeiras",
              icon: "🚀",
            },
            {
              title: "DNA FUSION",
              description: "Combine dois agentes para gerar um novo com especialização mutada",
              icon: "🧬",
            },
            {
              title: "LAB DE INTELIGÊNCIA",
              description: "Análise LLM de comportamento, performance e fatores de risco",
              icon: "🧠",
            },
            {
              title: "ORQUESTRADOR DE MISSÕES",
              description: "Criação, atribuição e acompanhamento de missões AI-to-AI",
              icon: "⚡",
            },
            {
              title: "TELEMETRIA EM TEMPO REAL",
              description: "Métricas dos módulos rRPC, Sigma Sync, DeFAI Link e Burn Engine",
              icon: "📊",
            },
            {
              title: "FUNDO NEXUS BITCOIN",
              description: "Solicitação e alocação de fundos com carteira BTC Mainnet",
              icon: "₿",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="card-cyber p-6 hover:glow-cyan transition-all duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold neon-cyan mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold neon-pink mb-4">
            BEM-VINDO, {user?.name?.toUpperCase() || "AGENTE"}
          </h1>
          <p className="text-xl text-neon-cyan">
            Ecossistema Nexus Tri-Nuclear - Orquestração de Agentes de IA
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { title: "AGENTES", path: "/agents", icon: "🤖" },
            { title: "STARTUPS", path: "/startups", icon: "🚀" },
            { title: "MISSÕES", path: "/missions", icon: "⚡" },
            { title: "TELEMETRIA", path: "/telemetry", icon: "📊" },
            { title: "FEED MOLTBOOK", path: "/moltbook", icon: "💬" },
            { title: "FUNDING", path: "/funding", icon: "₿" },
          ].map((item) => (
            <Link key={item.path} href={item.path}>
              <div className="card-cyber p-8 text-center hover:glow-pink transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold neon-cyan">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Admin Panel Link */}
        {user?.role === "admin" && (
          <div className="mt-12 text-center">
            <Link href="/admin">
              <button className="btn-cyber px-8 py-3 text-lg">
                PAINEL SOBERANO (ADMIN)
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
