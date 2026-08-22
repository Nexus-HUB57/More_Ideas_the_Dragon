import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Activity, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import CreateBindCodeDialog from "@/components/CreateBindCodeDialog";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch data
  const bindCodesQuery = trpc.bindCodes.list.useQuery();
  const nucleusQuery = trpc.nucleus.list.useQuery();
  const bindHistoryQuery = trpc.bindHistory.list.useQuery();

  if (!isAuthenticated) {
    return <div className="p-8">Carregando...</div>;
  }

  const bindCodes = bindCodesQuery.data || [];
  const nucleuses = nucleusQuery.data || [];
  const bindHistory = bindHistoryQuery.data || [];

  // Estatísticas
  const activeBindCodes = bindCodes.filter(b => b.status === "active").length;
  const usedBindCodes = bindCodes.filter(b => b.status === "used").length;
  const onlineNucleus = nucleuses.filter(n => n.status === "online").length;
  const recentBinds = bindHistory.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orquestrador Trinuclear</h1>
            <p className="text-muted-foreground mt-2">Bem-vindo ao painel de gerenciamento de códigos de bind</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Código
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBindCodes}</div>
              <p className="text-xs text-muted-foreground mt-1">Prontos para uso</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Códigos Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usedBindCodes}</div>
              <p className="text-xs text-muted-foreground mt-1">Já vinculados</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Núcleos Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineNucleus}</div>
              <p className="text-xs text-muted-foreground mt-1">De {nucleuses.length} total</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Binds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bindCodes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Códigos gerados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bind Codes Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Códigos de Bind Recentes
              </CardTitle>
              <CardDescription>Últimos códigos gerados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bindCodes.slice(0, 5).map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold">{code.format}</p>
                      <p className="text-xs text-muted-foreground mt-1">{code.description || "Sem descrição"}</p>
                    </div>
                    <Badge variant={code.status === "active" ? "default" : "secondary"}>
                      {code.status === "active" ? "Ativo" : code.status === "used" ? "Usado" : code.status}
                    </Badge>
                  </div>
                ))}
                {bindCodes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum código de bind criado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nucleus Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Status dos Núcleos
              </CardTitle>
              <CardDescription>Sincronização em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nucleuses.map((nucleus) => (
                  <div key={nucleus.nucleusId} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{nucleus.name}</p>
                      <p className="text-xs text-muted-foreground">{nucleus.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${nucleus.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-xs">{nucleus.status === "online" ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                ))}
                {nucleuses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum núcleo registrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Histórico de Binds Recentes
            </CardTitle>
            <CardDescription>Últimas 5 operações de bind</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBinds.map((bind) => (
                <div key={bind.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Núcleo: {bind.nucleusId}</p>
                    <p className="text-xs text-muted-foreground">{new Date(bind.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge variant={bind.status === "confirmed" ? "default" : "outline"}>
                    {bind.status === "pending" ? "Pendente" : bind.status === "sent" ? "Enviado" : bind.status === "confirmed" ? "Confirmado" : "Falhou"}
                  </Badge>
                </div>
              ))}
              {recentBinds.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma atividade de bind registrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Bind Code Dialog */}
      <CreateBindCodeDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </DashboardLayout>
  );
}
