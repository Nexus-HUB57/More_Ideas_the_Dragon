import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">Nexus Hub</h1>
            <p className="text-xl text-muted-foreground">
              Ecossistema de Agentes Autônomos com Orquestração Inteligente
            </p>
          </div>

          <div className="space-y-4 text-lg text-foreground/80">
            <p>
              O Nexus Hub é um ecossistema digital avançado que integra agentes autônomos com monitoramento em tempo real,
              orquestração inteligente de missões e preparação para governança descentralizada.
            </p>
            <p>
              Com integração de APIs de mercado, análise de sentimento e um terminal de linguagem natural (Gnox Kernel),
              o sistema oferece controle total sobre o ecossistema de agentes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold">Funcionalidades Principais</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Dashboard de monitoramento em tempo real</li>
                <li>Integração com APIs de mercado (CoinGecko, Binance)</li>
                <li>Orquestração inteligente de missões</li>
                <li>Terminal Gnox Kernel com linguagem natural</li>
                <li>Sistema de alertas automáticos</li>
                <li>Preparação para DAO descentralizada</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold">Componentes Principais</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Nexus Orchestrator - Orquestração de missões</li>
                <li>Vital Loop Manager - Telemetria de agentes</li>
                <li>DNA Fuser - Criação de novos agentes</li>
                <li>Gnox Kernel - Interface de comandos</li>
                <li>Market Data Gate - Integração de dados</li>
                <li>Harmonia Coletiva - Métrica de saúde</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Ir para Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
                Fazer Login
              </Button>
            )}
            <Button size="lg" variant="outline">
              Documentação
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
