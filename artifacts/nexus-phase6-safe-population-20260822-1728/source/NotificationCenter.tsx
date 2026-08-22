import { useState, useEffect } from "react";
import { Bell, X, Info, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useNexusWebSocket } from "@/hooks/useNexusWebSocket";
import { toast } from "sonner";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const notificationsQuery = trpc.notifications.list.useQuery();
  const { ecosystemEvents } = useNexusWebSocket("system", "User");

  // Listen for real-time events and show toasts
  useEffect(() => {
    if (ecosystemEvents.length > 0) {
      const latestEvent = ecosystemEvents[0];
      
      // Show toast for important events
      if (latestEvent.type === "alert:critical") {
        toast.error(`ALERTA CRÍTICO: ${latestEvent.data.decision || "Saúde baixa!"}`, {
          description: `Agente: ${latestEvent.data.agentId}`,
          duration: 10000,
        });
      } else if (latestEvent.type === "transaction:completed") {
        toast.success(`Transação Concluída`, {
          description: `${latestEvent.data.amount} tokens de ${latestEvent.data.senderId} para ${latestEvent.data.recipientId}`,
        });
      }
    }
  }, [ecosystemEvents]);

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "message": return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-accent/20"
      >
        <Bell className="w-6 h-6 text-accent neon-glow" />
        {notificationsQuery.data && notificationsQuery.data.filter(n => !n.read).length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <Card className="card-neon p-0 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-accent/5">
              <h3 className="font-bold text-accent neon-glow">Notificações Nexus</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationsQuery.isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Carregando...</div>
              ) : notificationsQuery.data && notificationsQuery.data.length > 0 ? (
                notificationsQuery.data.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border/30 hover:bg-accent/5 transition-colors ${!notif.read ? 'bg-accent/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notif.notificationType)}</div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.content}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma notificação no momento.
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border/50 text-center">
              <Button variant="link" size="sm" className="text-xs text-accent">
                Ver todas as atividades
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
