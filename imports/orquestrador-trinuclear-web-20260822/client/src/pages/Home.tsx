import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Shield, BarChart3, Smartphone, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const features = [
    {
      icon: Zap,
      title: "Geração Rápida de Códigos",
      description: "Crie códigos de bind em segundos com formato padrão :bind CODE",
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Autenticação OAuth e validação rigorosa de todos os códigos",
    },
    {
      icon: BarChart3,
      title: "Monitoramento em Tempo Real",
      description: "Acompanhe o status dos núcleos trinucleares instantaneamente",
    },
    {
      icon: Smartphone,
      title: "Integração Telegram",
      description: "Envie códigos diretamente para o Telegram Bot",
    },
  ];

  const benefits = [
    "Dashboard intuitivo e elegante",
    "Histórico completo de operações",
    "Filtros avançados e paginação",
    "Suporte a múltiplos núcleos",
    "Logs de atividades detalhados",
    "API tRPC moderna e type-safe",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Orquestrador Trinuclear</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Gerenciamento Elegante de Códigos de Bind
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Plataforma web completa para gerenciar códigos de bind de núcleos orquestradores trinucleares integrados ao Telegram
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>
                Começar Agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-8">Por que escolher nossa plataforma?</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Recursos Principais</CardTitle>
              <CardDescription>Tudo que você precisa em um só lugar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Dashboard Administrativo</h4>
                <p className="text-sm text-slate-600">Visualize estatísticas, códigos ativos e status dos núcleos em tempo real</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Gerador de Códigos</h4>
                <p className="text-sm text-slate-600">Crie códigos aleatórios ou personalizados com validação automática</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Histórico Completo</h4>
                <p className="text-sm text-slate-600">Acompanhe todas as operações com filtros avançados e paginação</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Monitoramento de Núcleos</h4>
                <p className="text-sm text-slate-600">Veja o status online/offline e progresso de sincronização</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-lg p-12 text-center text-white mb-20">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Acesse a plataforma agora e comece a gerenciar seus códigos de bind
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>
              Entrar com Manus OAuth
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-600">
          <p>&copy; 2026 Orquestrador Trinuclear. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
