import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Loader2, TrendingUp, Users, Gift, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect authenticated users to dashboard
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JR</span>
            </div>
            <span className="text-white font-bold text-lg">{APP_TITLE}</span>
          </div>
          <Button asChild variant="default">
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sorte é Ser Parte
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Sistema completo de rifas, sorteios e marketing de relacionamento. 
            Construa sua rede, ganhe comissões e participe de sorteios exclusivos.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href={getLoginUrl()}>Começar Agora</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              <a href="#features">Saiba Mais</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Recursos Principais</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Comissões Unilevel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Ganhe comissões em até 4 níveis de profundidade. 10% direto, 5% nível 2, 2.5% nível 3 e 4.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Rede de Afiliados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Construa sua equipe e ganhe bônus sobre o desempenho de toda sua rede de indicações.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Rifas e Sorteios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Participe de sorteios exclusivos (+Sorte) vinculados à Loteria Federal com prêmios incríveis.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">7 Níveis de Carreira</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">
                Progresso através de 7 níveis com benefícios crescentes, bônus e participação nos lucros.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Career Levels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Plano de Carreira</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Níveis Iniciais</CardTitle>
              <CardDescription>Construa sua base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Iniciante</span>
                <span className="text-blue-400 text-sm">0 - 249 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Agente Autônomo</span>
                <span className="text-blue-400 text-sm">250 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Consultor</span>
                <span className="text-blue-400 text-sm">1.500 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Mentor</span>
                <span className="text-blue-400 text-sm">10.000 pontos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Níveis Executivos</CardTitle>
              <CardDescription>Ganhos exponenciais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Executivo</span>
                <span className="text-purple-400 text-sm">40.000 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Sócio Investidor</span>
                <span className="text-purple-400 text-sm">500.000 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-300">Sócio Gestor</span>
                <span className="text-purple-400 text-sm">750.000 pontos</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-300">Sócio JR Group</span>
                <span className="text-purple-400 text-sm">1.000.000 pontos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Junte-se à comunidade Jhon Riff's e comece a ganhar hoje mesmo.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <a href={getLoginUrl()}>Criar Conta Agora</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-400">
            <p>&copy; 2025 Jhon Riff's. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">Sorte é Ser Parte</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
