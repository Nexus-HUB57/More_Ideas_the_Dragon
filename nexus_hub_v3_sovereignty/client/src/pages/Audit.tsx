import HubLayout from "@/components/HubLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, TerminalSquare } from "lucide-react";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export default function Audit() {
  const logsQuery = trpc.hub.audit.getLogs.useQuery({ limit: 100 });
  const logs = logsQuery.data ?? [];

  return (
    <HubLayout>
      <div className="space-y-8">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300"><Shield size={15} /> Trust layer</div>
          <h1 className="text-4xl font-bold text-slate-100">Auditoria e Compliance</h1>
          <p className="mt-2 text-slate-400">Rastro persistido das decisões, transições e operações relevantes do ecossistema.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-slate-500">Registros carregados</p><p className="mt-2 text-2xl font-bold text-cyan-300">{logs.length}</p></CardContent></Card>
          <Card className="border-slate-800 bg-slate-900/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-slate-500">Fonte</p><p className="mt-2 text-lg font-semibold text-slate-200">Audit logs</p></CardContent></Card>
          <Card className="border-slate-800 bg-slate-900/60"><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-slate-500">Política</p><p className="mt-2 text-lg font-semibold text-emerald-300">Somente anexar</p></CardContent></Card>
        </div>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100"><TerminalSquare size={18} className="text-cyan-300" /> Registro operacional</CardTitle>
            <CardDescription>Eventos apresentados do mais recente para o mais antigo. Detalhes podem conter payloads sanitizados do domínio.</CardDescription>
          </CardHeader>
          <CardContent>
            {logsQuery.isLoading && <div className="flex items-center gap-2 py-10 text-sm text-slate-400"><Loader2 className="animate-spin" size={18} /> Carregando logs…</div>}
            {!logsQuery.isLoading && logs.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-500">Nenhum registro disponível ainda. A criação ou transição de uma missão preencherá esta trilha.</div>}
            {!logsQuery.isLoading && logs.length > 0 && (
              <div className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <div key={log.id} className="grid gap-3 py-4 md:grid-cols-[180px_1fr_auto] md:items-center">
                    <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{log.action}</p><p className="mt-1 truncate text-xs text-slate-500">{log.actor ?? "Sistema"}{log.targetType ? ` · ${log.targetType} #${log.targetId ?? "—"}` : ""}</p></div>
                    <Badge variant="outline" className="w-fit border-emerald-500/30 text-emerald-300">registrado</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HubLayout>
  );
}
