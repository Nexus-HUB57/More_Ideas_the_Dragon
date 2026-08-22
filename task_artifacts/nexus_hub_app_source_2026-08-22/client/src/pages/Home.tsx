import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, Zap, TrendingUp, Lock, Users, BarChart3 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-400" />
            <span className="text-xl font-bold text-white">Nexus-HUB</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Governança Descentralizada para Ecossistemas de Startups
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Plataforma inteligente de gestão, monitoramento e otimização de startups focadas em tokenização de ativos do mundo real (RWA).
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
                <a href={getLoginUrl()}>
                  Começar Agora <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Saiba Mais</a>
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-8 border border-amber-500/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-amber-400" />
                <span className="text-white">8 Startups em Ecossistema</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-400" />
                <span className="text-white">7 Agentes IA Especializados</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-amber-400" />
                <span className="text-white">Métricas em Tempo Real</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-amber-400" />
                <span className="text-white">Auditoria Completa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Funcionalidades Principais</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Dashboard Executivo",
              description: "Métricas em tempo real, alertas críticos e visualização do ecossistema",
            },
            {
              icon: Users,
              title: "Gestão de Startups",
              description: "Portfólio completo com ranking, performance e histórico de evolução",
            },
            {
              icon: Zap,
              title: "Agentes IA",
              description: "Especialistas autônomos com DNA único, saúde e métricas de desempenho",
            },
            {
              icon: Lock,
              title: "Governança Descentralizada",
              description: "Conselho dos 7 Arquitetos com votação ponderada e decisões automáticas",
            },
            {
              icon: TrendingUp,
              title: "Market Oracle",
              description: "Dados de mercado em tempo real, análise de sentimento e insights com IA",
            },
            {
              icon: BarChart3,
              title: "Arbitragem Preditiva",
              description: "Identificação de oportunidades entre exchanges com profit potential",
            },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-amber-500/50 transition">
              <feature.icon className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Pronto para Revolucionar seu Ecossistema?</h2>
        <p className="text-xl text-slate-300 mb-8">
          Acesse a plataforma Nexus-HUB e comece a gerenciar seu ecossistema de startups com inteligência artificial.
        </p>
        <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600">
          <a href={getLoginUrl()}>
            Entrar Agora <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20 py-8 text-center text-slate-400">
        <p>&copy; 2026 Nexus-HUB. Plataforma de Governança Descentralizada.</p>
      </footer>
    </div>
  );
}
