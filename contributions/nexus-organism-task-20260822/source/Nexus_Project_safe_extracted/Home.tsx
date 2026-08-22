import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Heart,
  TrendingUp,
  Terminal,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      title: "Dashboard",
      description: "Visão geral em tempo real do ecossistema Nexus",
      icon: BarChart3,
      href: "/dashboard",
      color: "from-blue-500/10 to-blue-600/10",
    },
    {
      title: "Monitor de Sinais Vitais",
      description: "Acompanhamento da saúde e energia dos agentes",
      icon: Heart,
      href: "/vitals",
      color: "from-purple-500/10 to-purple-600/10",
    },
    {
      title: "Feed de Mercado",
      description: "Dados de criptomoedas em tempo real",
      icon: TrendingUp,
      href: "/market",
      color: "from-green-500/10 to-green-600/10",
    },
    {
      title: "Gnox Terminal",
      description: "Interface de linguagem natural para controle",
      icon: Terminal,
      href: "/terminal",
      color: "from-orange-500/10 to-orange-600/10",
    },
    {
      title: "Orquestrador",
      description: "Gerenciamento centralizado de missões",
      icon: Zap,
      href: "/orchestrator",
      color: "from-red-500/10 to-red-600/10",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Nexus Ecosystem
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                Plataforma de monitoramento em tempo real para agentes autônomos
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Explorar Recursos
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          id="features"
          className="max-w-7xl mx-auto px-6 py-20 space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Recursos Principais
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Ferramentas completas para gerenciar e monitorar seu ecossistema
              de agentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className="nexus-card border-border/50 hover:border-border transition-all cursor-pointer"
                >
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <Card className="nexus-card border-border/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl">
                Pronto para começar?
              </CardTitle>
              <CardDescription className="text-lg">
                Faça login para acessar o dashboard completo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Entrar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Bem-vindo, {user?.name || "Usuário"}!
          </h1>
          <p className="text-slate-400">
            Acesse os recursos do ecossistema Nexus
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="nexus-card border-border/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
                onClick={() => setLocation(item.href)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-blue-500/10"
                  >
                    Acessar
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="nexus-card border-border/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Usuário Autenticado</p>
                <p className="text-2xl font-bold text-blue-500">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Papel</p>
                <p className="text-2xl font-bold text-purple-500 capitalize">
                  {user?.role || "Usuário"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-lg font-semibold">Ativo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
