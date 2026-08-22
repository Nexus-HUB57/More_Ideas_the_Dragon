import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, DollarSign, Zap, Lock, Bitcoin, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: financialData, isLoading: financialLoading } = trpc.financial.getAllData.useQuery();
  const { data: funds, isLoading: fundsLoading } = trpc.funds.getByUser.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.security.getAlerts.useQuery();

  const latestYear = financialData?.[financialData.length - 1];
  const previousYear = financialData?.[financialData.length - 2];

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ""));
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Bem-vindo, {user?.name}
        </h1>
        <p className="text-slate-400">Dashboard de Alta Performance - Legado Lucas</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patrimônio Líquido */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-400" />
              Patrimônio Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">
                  {latestYear ? formatCurrency(latestYear.patrimonioLiquido) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-2">Ano {latestYear?.year || "—"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lucro Anual */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              Lucro Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">
                  {latestYear ? formatCurrency(latestYear.lucroAnual) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-2">Crescimento: {latestYear?.crescimentoPL || "—"}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Valor de Mercado */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap size={16} className="text-blue-400" />
              Valor de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">
                  {latestYear ? formatCurrency(latestYear.valorMercado) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-2">Múltiplo: {latestYear?.multiploVMPC || "—"}x</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Valor Intangível */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Lock size={16} className="text-purple-400" />
              Valor Intangível
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">
                  {latestYear ? formatCurrency(latestYear.valorIntangivel) : "—"}
                </p>
                <p className="text-xs text-slate-400 mt-2">Ativos intangíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fundos Ativos */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bitcoin size={16} className="text-orange-400" />
              Fundos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fundsLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">{funds?.length || 0}</p>
                <p className="text-xs text-slate-400 mt-2">FP, FS, FIQ, Endowment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Segurança */}
        <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <Loader2 className="animate-spin text-slate-500" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-white">{alerts?.length || 0}</p>
                <p className="text-xs text-slate-400 mt-2">Últimos eventos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Gestão Financeira</CardTitle>
            <CardDescription>Visualize KPIs e análise de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/financial">
              <a className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition">
                Acessar Dashboard
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Carteiras Bitcoin</CardTitle>
            <CardDescription>Gênesis (Hot) e Cerberus (Cold Storage)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/genesis">
              <a className="block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-center">
                Gênesis (Hot Wallet)
              </a>
            </Link>
            <Link href="/cerberus">
              <a className="block px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-center">
                Cerberus (Cold Storage)
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>Últimos eventos de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    <p className="text-xs text-slate-400">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
