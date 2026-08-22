import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Shield, Lock, Zap } from "lucide-react";

export default function SecurityDashboard() {
  const { data: alerts, isLoading: alertsLoading } = trpc.security.getAlerts.useQuery();
  const { data: dailyLimit, isLoading: limitLoading } = trpc.security.getDailyLimit.useQuery();

  const isLoading = alertsLoading || limitLoading;

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "TRANSACTION_LIMIT_EXCEEDED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "UNAUTHORIZED_ACCESS_ATTEMPT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MASTER_KEY_OPERATION":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "CERBERUS_TO_GENESIS_TRANSFER":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "SECURITY_UPDATE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "TRANSACTION_LIMIT_EXCEEDED":
        return <AlertTriangle size={16} />;
      case "UNAUTHORIZED_ACCESS_ATTEMPT":
        return <AlertTriangle size={16} />;
      case "MASTER_KEY_OPERATION":
        return <Lock size={16} />;
      case "CERBERUS_TO_GENESIS_TRANSFER":
        return <Zap size={16} />;
      case "SECURITY_UPDATE":
        return <Shield size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-shield-400" size={32} />
      </div>
    );
  }

  const criticalAlerts = alerts?.filter((a) =>
    ["TRANSACTION_LIMIT_EXCEEDED", "UNAUTHORIZED_ACCESS_ATTEMPT"].includes(a.alertType || "")
  ) || [];

  const dailyUsed = dailyLimit?.usedBtc ? parseFloat(dailyLimit.usedBtc) : 0;
  const dailyMax = dailyLimit?.limitBtc ? parseFloat(dailyLimit.limitBtc) : 0;
  const usagePercentage = dailyMax > 0 ? (dailyUsed / dailyMax) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard de Segurança</h1>
        <p className="text-slate-400">Monitoramento de segurança, alertas e limites de transação</p>
      </div>

      {/* Guardian Protocol - Limites Diários */}
      <Card className="bg-gradient-to-r from-shield-500/10 to-cyan-500/10 border-shield-500/30">
        <CardHeader>
          <CardTitle className="text-shield-400 flex items-center gap-2">
            <Shield size={20} />
            Guardian Protocol - Limites Diários
          </CardTitle>
          <CardDescription>Controle de transações diárias para máxima segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyLimit ? (
            <>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-300">Limite Diário</span>
                  <span className="text-sm font-mono text-white">
                    {dailyUsed.toFixed(8)} / {dailyMax.toFixed(8)} BTC
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage > 80
                        ? "bg-red-500"
                        : usagePercentage > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-slate-400">Utilizado</p>
                  <p className="text-lg font-bold text-white">{usagePercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Disponível</p>
                  <p className="text-lg font-bold text-green-400">
                    {(dailyMax - dailyUsed).toFixed(8)} BTC
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400">Nenhum limite configurado</p>
          )}
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle size={20} />
              ⚠️ Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <p className="text-sm font-medium text-red-400">{alert.title}</p>
                  <p className="text-xs text-red-300 mt-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os Alertas */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Histórico de Alertas</CardTitle>
          <CardDescription>Todos os eventos de segurança registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {!alerts || alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={32} className="mx-auto text-green-400 mb-2" />
              <p className="text-slate-400">Nenhum alerta registrado - Sistema seguro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getAlertColor(alert.alertType || "")}`}>
                      {getAlertIcon(alert.alertType || "")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{alert.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
                        </div>
                        <Badge className={`${getAlertColor(alert.alertType || "")} border text-xs`}>
                          {alert.alertType?.replace(/_/g, " ") || "UNKNOWN"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(alert.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Segurança */}
      <Card className="bg-shield-500/5 border-shield-500/20">
        <CardHeader>
          <CardTitle className="text-shield-400 text-sm">🔐 Sobre o Dashboard de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>
            • <strong>Guardian Protocol</strong> monitora limites diários de transação para máxima segurança
          </p>
          <p>
            • Alertas automáticos quando transações excedem limites configurados
          </p>
          <p>
            • Detecção de tentativas de acesso não autorizado
          </p>
          <p>
            • Monitoramento de operações críticas (Master Key, Cerberus→Gênesis)
          </p>
          <p>
            • Validação TSRA exclusivamente em Mainnet
          </p>
          <p>
            • Notificações em tempo real ao proprietário para eventos críticos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
