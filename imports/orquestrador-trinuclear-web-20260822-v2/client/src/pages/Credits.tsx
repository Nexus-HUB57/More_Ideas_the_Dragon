import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertTriangle, CalendarDays, Zap } from "lucide-react";

const formatNumber = (value: number) => value.toLocaleString("pt-BR");

export default function Credits() {
  const { isAuthenticated } = useAuth();
  const balance = trpc.credits.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const history = trpc.credits.getHistory.useQuery(undefined, { enabled: isAuthenticated });
  const credits = balance.data;
  const usage = credits ? Math.min(100, (credits.creditsUsed / credits.monthlyCredits) * 100) : 0;
  const isLow = credits ? credits.creditsAvailable <= credits.monthlyCredits * 0.2 : false;

  if (!isAuthenticated) return <div className="p-8">Faça login para consultar seus créditos.</div>;
  if (!credits) return <div className="p-8">Carregando saldo de créditos...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Plano operacional</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Créditos de Bind</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe o consumo mensal da sua operação trinuclear.</p>
        </header>

        {isLow && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Seu saldo está abaixo de 20% do limite mensal.</AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Plano de 40.000 créditos/mês</CardTitle>
            <CardDescription>O limite é controlado pela aplicação e não representa créditos reais da conta Manus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-sm text-muted-foreground">Disponíveis</p><p className="text-3xl font-bold text-emerald-600">{formatNumber(credits.creditsAvailable)}</p></div>
              <div><p className="text-sm text-muted-foreground">Consumidos</p><p className="text-3xl font-bold text-orange-600">{formatNumber(credits.creditsUsed)}</p></div>
              <div><p className="text-sm text-muted-foreground">Limite mensal</p><p className="text-3xl font-bold">{formatNumber(credits.monthlyCredits)}</p></div>
            </div>
            <div className="space-y-2"><div className="flex justify-between text-sm"><span>Uso do ciclo</span><span>{usage.toFixed(1)}%</span></div><Progress value={usage} className="h-3" /></div>
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm"><CalendarDays className="h-5 w-5 text-muted-foreground" /><span>Próximo reset: {new Date(credits.creditResetDate).toLocaleDateString("pt-BR")}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Histórico de consumo</CardTitle><CardDescription>Operações que utilizaram créditos.</CardDescription></CardHeader>
          <CardContent>
            {history.data?.length ? <div className="divide-y">{history.data.slice(0, 20).map(item => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{item.action}</p><p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("pt-BR")}{item.description ? ` · ${item.description}` : ""}</p></div><span className="font-semibold text-orange-600">-{formatNumber(item.creditsUsed)}</span></div>)}</div> : <p className="py-8 text-center text-muted-foreground">Nenhum consumo registrado.</p>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
