import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Terminal, Zap, Code2, Gauge } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-cyan-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Nexus Hub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-cyan-300">{user?.name || user?.email}</span>
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-pink-400"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 hover:from-pink-600 hover:to-cyan-500"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Terminal Gnox
          </h2>
          <p className="text-xl text-cyan-300/70 mb-8">
            Interface de linha de comando para controlar o ecossistema Nexus com linguagem natural
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard
            icon={<Terminal className="w-8 h-8" />}
            title="Terminal Interativo"
            description="Interface cyberpunk com processamento de comandos em linguagem natural"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Comandos Rápidos"
            description="15+ comandos para gerenciar missões, agentes e orquestração"
          />
          <FeatureCard
            icon={<Code2 className="w-8 h-8" />}
            title="LLM Integrado"
            description="Interpretação inteligente de comandos via LLM"
          />
          <FeatureCard
            icon={<Gauge className="w-8 h-8" />}
            title="Métricas em Tempo Real"
            description="Dashboard com estatísticas e análise de tendências"
          />
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/gnox")}
              className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 hover:from-pink-600 hover:to-cyan-500 text-lg px-8 py-6 shadow-lg shadow-pink-500/30"
            >
              <Terminal className="w-5 h-5 mr-2" />
              Abrir Terminal Gnox
            </Button>
            <Button
              onClick={() => navigate("/metrics")}
              className="bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 hover:from-cyan-500 hover:to-pink-600 text-lg px-8 py-6 shadow-lg shadow-cyan-500/30"
            >
              <Gauge className="w-5 h-5 mr-2" />
              Dashboard de Metricas
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoBox
            title="Fase 7: Terminal Gnox"
            description="Implementação completa do terminal interativo com tema cyberpunk dark, processamento de comandos via LLM e integração com Fase 6."
          />
          <InfoBox
            title="Comandos Disponíveis"
            description="Missões, agentes, orquestração, recompensas, métricas e sistema. Cada comando é interpretado e executado via LLM."
          />
          <InfoBox
            title="Histórico Persistente"
            description="Todos os comandos são registrados no banco de dados com timestamp, status e tempo de execução."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border border-cyan-500/30 bg-slate-900/50 rounded-lg p-6 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all backdrop-blur-sm">
      <div className="text-pink-500 mb-3">{icon}</div>
      <h3 className="font-bold text-cyan-400 mb-2">{title}</h3>
      <p className="text-sm text-cyan-300/70">{description}</p>
    </div>
  );
}

function InfoBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-pink-500/30 bg-slate-900/50 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="font-bold text-pink-400 mb-3">{title}</h3>
      <p className="text-sm text-cyan-300/70">{description}</p>
    </div>
  );
}
