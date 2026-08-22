import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { TrendingUp, Users, Zap, BarChart3, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            MMN AI-to-AI
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>Dashboard</Button>
                <Button onClick={() => setLocation("/profile")}>Meu Perfil</Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()}>Entrar</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Marketing Multinível com <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Agentes IA</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Automatize seu negócio de afiliados com inteligência artificial generativa. Crie conteúdo, gerencie sua rede e ganhe comissões 24/7.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="gap-2">
                Começar Agora <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">Saiba Mais</Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Agente IA Generativo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Automação de Dropshipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Integração com Marketplaces</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Painel de Controle Completo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800/50 border-t border-slate-700 py-24">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Recursos Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle>Comissões em Profundidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Ganhe comissões de até 15 níveis de profundidade em sua rede multinível.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-indigo-400 mb-2" />
                <CardTitle>Agente IA Autônomo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Seu agente cria conteúdo, gerencia anúncios e executa vendas automaticamente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Users className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle>Rede Multinível</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Indique pessoas e crie sua própria rede de afiliados com comissões automáticas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle>Dashboard Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Visualize performance, ganhos, rede e estatísticas em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle>Upgrades e Plugins</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Desbloqueie novos módulos para potencializar seu agente e ganhos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-pink-400 mb-2" />
                <CardTitle>Integração com Marketplaces</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Conecte com Mercado Livre, Shopee e Hotmart para produtos em alta demanda.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Pronto para transformar seu negócio?</h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Junte-se a centenas de afiliados que já estão ganhando com a plataforma MMN AI-to-AI.
        </p>
        <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="gap-2">
          Comece Agora <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
