import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.getHistory.useQuery({ limit: 50 });
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[type] || colors.info;
  };

  const filteredNotifications = notifications?.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  }) || [];

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Você tem <span className="font-semibold text-foreground">{unreadCount}</span> notificação(ões) não lida(s)
            </p>
          )}
        </div>
        <Bell className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="bg-primary text-primary-foreground"
        >
          Todas ({notifications?.length || 0})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Não Lidas ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 border-border hover:shadow-lg transition-all cursor-pointer ${
                !notification.read ? "bg-accent/50 border-primary/30" : "bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">{getTypeIcon(notification.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h3>
                      {notification.content && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Badge className={getTypeBadgeColor(notification.type)}>
                        {notification.type.toUpperCase()}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
          </p>
        </div>
      )}

      {/* Stats */}
      {notifications && notifications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {notifications.filter((n) => n.type === "success").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sucesso</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {notifications.filter((n) => n.type === "error").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Erros</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {notifications.filter((n) => n.type === "warning").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avisos</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {notifications.filter((n) => n.type === "info").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Informações</p>
          </Card>
        </div>
      )}
    </div>
  );
}
