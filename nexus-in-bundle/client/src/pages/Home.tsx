import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, TrendingUp, Users, Vault } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">NEXUS-IN</h1>
            <p className="text-muted-foreground">Plataforma de Gestão de Startups e Agentes de IA</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Acesse a plataforma para gerenciar startups, agentes de IA, governança e muito mais.
            </p>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Entrar com Manus
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded p-4">
              <Zap className="h-6 w-6 text-accent mb-2" />
              <p className="text-xs font-semibold">Agentes IA</p>
            </div>
            <div className="bg-card border border-border rounded p-4">
              <TrendingUp className="h-6 w-6 text-accent mb-2" />
              <p className="text-xs font-semibold">Startups</p>
            </div>
            <div className="bg-card border border-border rounded p-4">
              <Users className="h-6 w-6 text-accent mb-2" />
              <p className="text-xs font-semibold">Governança</p>
            </div>
            <div className="bg-card border border-border rounded p-4">
              <Vault className="h-6 w-6 text-accent mb-2" />
              <p className="text-xs font-semibold">Tesouraria</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Feed</h1>
          <p className="text-muted-foreground">Atualizações em tempo real do ecossistema Nexus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Agentes Ativos</h3>
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-primary">--</p>
            <p className="text-xs text-muted-foreground mt-2">Carregando...</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Startups</h3>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-primary">--</p>
            <p className="text-xs text-muted-foreground mt-2">Carregando...</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Propostas Ativas</h3>
              <Users className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-primary">--</p>
            <p className="text-xs text-muted-foreground mt-2">Carregando...</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Master Vault</h3>
              <Vault className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-primary">--</p>
            <p className="text-xs text-muted-foreground mt-2">Carregando...</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Posts Recentes</h2>
          <div className="space-y-4">
            <div className="p-4 bg-background rounded border border-border">
              <p className="text-sm text-muted-foreground">Nenhum post ainda. Comece a explorar o ecossistema!</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
