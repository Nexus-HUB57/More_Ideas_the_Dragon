import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Activity, Radio, Zap, Plus } from "lucide-react";
import { useState } from "react";
import RegisterNucleusDialog from "@/components/RegisterNucleusDialog";

export default function NucleusMonitoring() {
  const { isAuthenticated } = useAuth();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const nucleusQuery = trpc.nucleus.list.useQuery();
  const nucleuses = nucleusQuery.data || [];

  if (!isAuthenticated) {
    return <div className="p-8">Carregando...</div>;
  }

  const onlineCount = nucleuses.filter(n => n.status === "online").length;
  const syncingCount = nucleuses.filter(n => n.status === "syncing").length;
  const offlineCount = nucleuses.filter(n => n.status === "offline").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Radio className="w-5 h-5 text-green-500 animate-pulse" />;
      case "syncing":
        return <Zap className="w-5 h-5 text-yellow-500 animate-spin" />;
      case "error":
        return <Activity className="w-5 h-5 text-red-500" />;
      default:
        return <Radio className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "syncing":
        return "Sincronizando";
      case "error":
        return "Erro";
      default:
        return "Offline";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "primary":
        return "Primário";
      case "secondary":
        return "Secundário";
      case "tertiary":
        return "Terciário";
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Núcleos</h1>
            <p className="text-muted-foreground mt-2">Acompanhe o status em tempo real dos núcleos trinucleares</p>
          </div>
          <Button onClick={() => setShowRegisterDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Registrar Núcleo
          </Button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Núcleos ativos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sincronizando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Em processo</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offlineCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Desconectados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nucleuses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Núcleos registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Nucleus List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Núcleos Trinucleares
            </CardTitle>
            <CardDescription>Lista completa de núcleos e seus status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nucleuses.length > 0 ? (
                nucleuses.map((nucleus) => (
                  <div key={nucleus.nucleusId} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(nucleus.status)}
                        <div>
                          <p className="font-semibold">{nucleus.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{nucleus.nucleusId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(nucleus.status)}>
                          {getStatusLabel(nucleus.status)}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(nucleus.type)}</Badge>
                      </div>
                    </div>

                    {/* Sync Progress */}
                    {nucleus.status === "syncing" && (
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso de sincronização</span>
                          <span className="font-semibold">{nucleus.syncProgress}%</span>
                        </div>
                        <Progress value={nucleus.syncProgress || 0} className="h-2" />
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {nucleus.lastHeartbeat && (
                        <div>
                          <p className="text-muted-foreground">Último Heartbeat</p>
                          <p className="font-mono text-xs">
                            {new Date(nucleus.lastHeartbeat).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      )}
                      {nucleus.lastSyncAt && (
                        <div>
                          <p className="text-muted-foreground">Última Sincronização</p>
                          <p className="font-mono text-xs">
                            {new Date(nucleus.lastSyncAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum núcleo registrado ainda</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowRegisterDialog(true)}
                  >
                    Registrar Primeiro Núcleo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Register Nucleus Dialog */}
      <RegisterNucleusDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog} />
    </DashboardLayout>
  );
}
