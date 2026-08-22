import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, TrendingUp, Gift, Lock, BarChart3 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />
              <span className="text-xl font-bold text-blue-900">Jhon Riff's</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, {user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Card: Meu Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Visualize suas informações pessoais e nível de carreira.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/profile")}
                >
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Card: Minha Rede */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Minha Rede
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Gerencie sua equipe e visualize sua rede de negócios.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/network")}
                >
                  Ver Rede
                </Button>
              </CardContent>
            </Card>

            {/* Card: Comissões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Comissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Acompanhe suas comissões e ganhos.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/commissions")}
                >
                  Ver Comissões
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card: Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Acesse e-books, PPR e outros produtos exclusivos.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/products")}
                >
                  Explorar Produtos
                </Button>
              </CardContent>
            </Card>

            {/* Card: Sorteios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-red-600" />
                  +Sorte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Participe do programa de sorteios e ganhe prêmios.</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/lottery")}
                >
                  Participar
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Landing Page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-white">Jhon Riff's</span>
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Entrar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Sorte é Ser Parte
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Junte-se ao Jhon Riff's Business Club e transforme sua vida financeira através de oportunidades de negócio e complementação de renda.
        </p>
        <Button
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
          onClick={() => window.location.href = getLoginUrl()}
        >
          Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Por que escolher Jhon Riff's?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white border border-white/20">
            <TrendingUp className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Crescimento Exponencial</h3>
            <p className="text-blue-100">
              Sistema de comissionamento Unilevel que recompensa seu crescimento e o de sua equipe.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white border border-white/20">
            <Users className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Construa Sua Rede</h3>
            <p className="text-blue-100">
              Ganhe comissões através da sua rede de negócios em até 4 níveis de profundidade.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white border border-white/20">
            <Gift className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Programa +Sorte</h3>
            <p className="text-blue-100">
              Participe de sorteios exclusivos vinculados à Loteria Federal e ganhe prêmios incríveis.
            </p>
          </div>
        </div>
      </section>

      {/* Career Levels Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Plano de Carreira em 7 Níveis
        </h2>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 overflow-x-auto">
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Nível</th>
                <th className="text-left py-3 px-4">Título</th>
                <th className="text-left py-3 px-4">Investimento</th>
                <th className="text-left py-3 px-4">Potencial de Ganhos</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">1º</td>
                <td className="py-3 px-4">Agente Autônomo</td>
                <td className="py-3 px-4">R$250</td>
                <td className="py-3 px-4">Comissões diretas</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">2º</td>
                <td className="py-3 px-4">Consultor</td>
                <td className="py-3 px-4">R$500</td>
                <td className="py-3 px-4">R$1.250 a R$3.500</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">3º</td>
                <td className="py-3 px-4">Mentor</td>
                <td className="py-3 px-4">R$1.000</td>
                <td className="py-3 px-4">R$2.500 a R$7.000</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">4º</td>
                <td className="py-3 px-4">Executivo</td>
                <td className="py-3 px-4">R$2.000</td>
                <td className="py-3 px-4">R$5.000 a R$14.000</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">5º</td>
                <td className="py-3 px-4">Sócio Investidor</td>
                <td className="py-3 px-4">R$5.000</td>
                <td className="py-3 px-4">R$10.000 a R$28.000</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">6º</td>
                <td className="py-3 px-4">Sócio Gestor</td>
                <td className="py-3 px-4">R$7.500</td>
                <td className="py-3 px-4">R$15.000 a R$50.000</td>
              </tr>
              <tr>
                <td className="py-3 px-4">7º</td>
                <td className="py-3 px-4">Sócio JR Group</td>
                <td className="py-3 px-4">R$10.000</td>
                <td className="py-3 px-4">R$20.000 a R$100.000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Pronto para começar?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Junte-se a milhares de membros que já estão transformando suas vidas.
        </p>
        <Button
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-white text-lg px-8 py-6"
          onClick={() => window.location.href = getLoginUrl()}
        >
          Entrar Agora <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950/50 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-blue-100">
          <p>&copy; 2025 Jhon Riff's Business Club. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
