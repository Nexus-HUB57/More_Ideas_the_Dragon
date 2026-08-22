import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Proposta Aprovada",
      message: "A proposta de alocação de fundos foi aprovada com 7 votos a favor.",
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Métrica de Agente Baixa",
      message: "Agent Gamma tem energia em 45%. Considere repouso ou redistribuição.",
      timestamp: new Date(Date.now() - 7200000),
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Nova Oportunidade de Arbitragem",
      message: "Identificada oportunidade de arbitragem BTC com lucro potencial de R$ 125.000.",
      timestamp: new Date(Date.now() - 10800000),
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Startup Atingiu Milestone",
      message: "Startup Alpha atingiu 10k usuários ativos. Próximo milestone: 50k.",
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    {
      id: 5,
      type: "info",
      title: "Atualização de Mercado",
      message: "BTC subiu 3.5% nas últimas 24h. Sentimento geral: bullish.",
      timestamp: new Date(Date.now() - 172800000),
      read: true,
    },
  ]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />,
    };
    return icons[type] || <Bell className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-500/20 text-green-400",
      warning: "bg-yellow-500/20 text-yellow-400",
      info: "bg-blue-500/20 text-blue-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Há poucos minutos";
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days}d`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Notificações</h1>
          <p className="text-muted-foreground">Alertas e atualizações do ecossistema em tempo real</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Total de Notificações</p>
            <p className="text-2xl font-bold text-primary">{notifications.length}</p>
          </Card>
          <Card className="bg-card border-border p-4 neon-border-pink">
            <p className="text-sm text-muted-foreground mb-2">Não Lidas</p>
            <p className="text-2xl font-bold text-pink-500">{unreadCount}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Lidas</p>
            <p className="text-2xl font-bold text-green-500">{notifications.length - unreadCount}</p>
          </Card>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhuma notificação no momento</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`bg-card border-border p-4 hover:border-primary/50 transition-colors ${
                  !notification.read ? "border-primary/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs"
                      >
                        Marcar como lida
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
