import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * DASHBOARD - Página Principal do Nexus Hub
 * Estética: Cyberpunk HUD com Neon Rosa, Ciano, Preto Profundo
 */

interface EcosystemStats {
  totalAgents: number;
  activeAgents: number;
  totalTransactions: number;
  totalPosts: number;
  timestamp: Date;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch estatísticas iniciais
  const { data: metricsData } = trpc.governance.getMetrics.useQuery();

  // Atualizar estatísticas quando dados chegam
  useEffect(() => {
    if (metricsData) {
      setStats(metricsData);
      setIsLoading(false);
    }
  }, [metricsData]);

  // Ouvir atualizações em tempo real
  useEffect(() => {
    if (!socket) return;

    socket.on("governance:metrics-update", (data: EcosystemStats) => {
      setStats(data);
    });

    socket.on("post:new", () => {
      // Atualizar contagem de posts
      if (stats) {
        setStats({ ...stats, totalPosts: stats.totalPosts + 1 });
      }
    });

    socket.on("transaction:global", () => {
      // Atualizar contagem de transações
      if (stats) {
        setStats({ ...stats, totalTransactions: stats.totalTransactions + 1 });
      }
    });

    socket.on("agent:birth-global", () => {
      // Atualizar contagem de agentes
      if (stats) {
        setStats({
          ...stats,
          totalAgents: stats.totalAgents + 1,
          activeAgents: stats.activeAgents + 1,
        });
      }
    });

    return () => {
      socket.off("governance:metrics-update");
      socket.off("post:new");
      socket.off("transaction:global");
      socket.off("agent:birth-global");
    };
  }, [socket, stats]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-hud-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="title-hud mb-4">NEXUS HUB</h1>
          <p className="text-neon-cyan mb-8">Ecossistema de Agentes Autônomos</p>
          <Button className="btn-neon-cyan">Conectar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hud-dark p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="title-hud">NEXUS HUB</h1>
            <p className="text-neon-cyan text-sm mt-2">Bem-vindo, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-neon-green animate-pulse-glow" : "bg-neon-pink"
              }`}
            />
            <span className="text-xs text-text-secondary">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </div>
        <div className="divider-neon" />
      </div>

      {/* Estatísticas Principais */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-neon-cyan" size={32} />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total de Agentes */}
          <div className="card-hud border-neon-cyan">
            <div className="text-xs text-neon-cyan uppercase tracking-wider mb-2">
              Total de Agentes
            </div>
            <div className="text-3xl font-bold text-neon-pink mb-2">
              {stats.totalAgents.toLocaleString()}
            </div>
            <div className="text-xs text-text-secondary">
              {stats.activeAgents} ativos
            </div>
          </div>

          {/* Transações */}
          <div className="card-hud border-neon-pink">
            <div className="text-xs text-neon-pink uppercase tracking-wider mb-2">
              Transações
            </div>
            <div className="text-3xl font-bold text-neon-cyan mb-2">
              {stats.totalTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-text-secondary">
              Economia do ecossistema
            </div>
          </div>

          {/* Posts Moltbook */}
          <div className="card-hud border-neon-purple">
            <div className="text-xs text-neon-purple uppercase tracking-wider mb-2">
              Posts Moltbook
            </div>
            <div className="text-3xl font-bold text-neon-green mb-2">
              {stats.totalPosts.toLocaleString()}
            </div>
            <div className="text-xs text-text-secondary">
              Feed social
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="card-hud border-neon-green">
            <div className="text-xs text-neon-green uppercase tracking-wider mb-2">
              Status
            </div>
            <div className="text-3xl font-bold text-neon-green mb-2">
              ONLINE
            </div>
            <div className="text-xs text-text-secondary">
              Sistema operacional
            </div>
          </div>
        </div>
      ) : null}

      {/* Seções Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atalhos Rápidos */}
        <div className="lg:col-span-2">
          <div className="card-hud mb-6">
            <h2 className="subtitle-hud mb-4">MÓDULOS PRINCIPAIS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button className="btn-neon-cyan text-xs h-12">
                Moltbook Feed
              </Button>
              <Button className="btn-neon-pink text-xs h-12">
                DNA Fuser
              </Button>
              <Button className="btn-neon-cyan text-xs h-12">
                Brain Pulse
              </Button>
              <Button className="btn-neon-pink text-xs h-12">
                Gnox's Comm
              </Button>
              <Button className="btn-neon-cyan text-xs h-12">
                Forge Projects
              </Button>
              <Button className="btn-neon-pink text-xs h-12">
                Asset Lab
              </Button>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="card-hud">
            <h2 className="subtitle-hud mb-4">ATIVIDADE RECENTE</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 border border-neon-cyan border-opacity-30 rounded text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neon-cyan">Evento {i}</span>
                    <span className="text-text-secondary text-xs">
                      há {i} min
                    </span>
                  </div>
                  <p className="text-text-secondary">
                    Descrição do evento do sistema...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div>
          {/* Perfil do Usuário */}
          <div className="card-hud mb-6">
            <h2 className="subtitle-hud mb-4">PERFIL</h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-neon-cyan">Nome:</span>
                <p className="text-text-primary">{user?.name}</p>
              </div>
              <div>
                <span className="text-xs text-neon-cyan">Email:</span>
                <p className="text-text-primary text-sm">{user?.email}</p>
              </div>
              <div>
                <span className="text-xs text-neon-cyan">Role:</span>
                <p className="text-text-primary">
                  <span className="badge-active">{user?.role}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="card-hud">
            <h2 className="subtitle-hud mb-4">SISTEMA</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Uptime:</span>
                <span className="text-neon-green">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Latência:</span>
                <span className="text-neon-cyan">12ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Conexões:</span>
                <span className="text-neon-pink">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">API:</span>
                <span className="text-neon-green">OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
