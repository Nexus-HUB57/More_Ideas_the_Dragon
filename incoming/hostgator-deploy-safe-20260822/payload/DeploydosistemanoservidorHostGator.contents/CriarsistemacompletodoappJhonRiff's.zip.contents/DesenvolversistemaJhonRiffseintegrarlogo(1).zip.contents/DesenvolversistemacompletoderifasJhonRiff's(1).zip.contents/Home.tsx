import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Gift, Zap } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bem-vindo, {user.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Você está no nível {user.careerLevel} com {user.careerPoints} pontos
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Ir para Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {APP_TITLE}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sorte é Ser Parte - Construa sua riqueza através de um sistema de marketing de rede inovador
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <a href={getLoginUrl()}>Começar Agora</a>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Por que escolher Jhon Riff's?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Comissões Altas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Ganhe até 10% em comissões diretas e 5% em comissões de rede</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Estrutura Unilevel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Construa sua rede com 7 níveis de carreira e ganhos exponenciais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Sistema +Sorte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Participe de rifas e sorteios com prêmios incríveis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                JR Bank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gerencie seus ganhos com nossa plataforma de pagamentos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Career Levels Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 bg-white rounded-lg my-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">7 Níveis de Carreira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { level: 1, title: "Agente Autônomo", points: "250" },
            { level: 2, title: "Consultor", points: "1.500" },
            { level: 3, title: "Mentor", points: "10.000" },
            { level: 4, title: "Executivo", points: "40.000" },
            { level: 5, title: "Sócio Investidor", points: "500.000" },
            { level: 6, title: "Sócio Gestor", points: "750.000" },
            { level: 7, title: "Sócio JR Group", points: "1.000.000" },
          ].map((level) => (
            <Card key={level.level}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">Nível {level.level}</div>
                  <p className="font-semibold text-gray-900">{level.title}</p>
                  <p className="text-sm text-gray-600 mt-2">{level.points} pontos</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Pronto para começar?</h2>
        <p className="text-xl text-gray-600 mb-8">Junte-se a milhares de afiliados que já estão ganhando com Jhon Riff's</p>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <a href={getLoginUrl()}>Criar Conta Agora</a>
        </Button>
      </div>
    </div>
  );
}
