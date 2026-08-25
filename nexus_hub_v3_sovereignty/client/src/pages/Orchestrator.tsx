import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import HubLayout from "@/components/HubLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  Plus,
  Rocket,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";

const statuses = ["backlog", "ready", "running", "blocked", "review", "completed", "cancelled"] as const;
const stages = ["discovery", "validation", "build", "launch", "scale"] as const;
const priorities = ["critical", "high", "medium", "low"] as const;

const statusLabels: Record<(typeof statuses)[number], string> = {
  backlog: "Backlog",
  ready: "Pronto",
  running: "Em execução",
  blocked: "Bloqueado",
  review: "Em revisão",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const stageLabels: Record<(typeof stages)[number], string> = {
  discovery: "Descoberta",
  validation: "Validação",
  build: "Construção",
  launch: "Lançamento",
  scale: "Escala",
};

const priorityLabels: Record<(typeof priorities)[number], string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const statusStyles: Record<(typeof statuses)[number], string> = {
  backlog: "border-slate-700 bg-slate-800/80 text-slate-300",
  ready: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  running: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  blocked: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  review: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const nextStatus: Partial<Record<(typeof statuses)[number], (typeof statuses)[number]>> = {
  backlog: "ready",
  ready: "running",
  running: "review",
  review: "completed",
  blocked: "ready",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Sem prazo";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Orchestrator() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startupId: "",
    title: "",
    description: "",
    stage: "discovery" as (typeof stages)[number],
    priority: "medium" as (typeof priorities)[number],
    owner: "Nexus Operations",
    dueAt: "",
  });

  const utils = trpc.useUtils();
  const startupsQuery = trpc.hub.startups.list.useQuery();
  const overviewQuery = trpc.hub.orchestrator.overview.useQuery();
  const missionsQuery = trpc.hub.orchestrator.listMissions.useQuery({ limit: 100 });
  const eventsQuery = trpc.hub.orchestrator.events.useQuery({ limit: 12 });
  const createMission = trpc.hub.orchestrator.createMission.useMutation();
  const transitionMission = trpc.hub.orchestrator.transition.useMutation();

  const startupNames = useMemo(
    () => new Map((startupsQuery.data ?? []).map((startup) => [startup.id, startup.name])),
    [startupsQuery.data],
  );

  const missionsByStatus = useMemo(() => {
    const grouped = Object.fromEntries(statuses.map((status) => [status, [] as NonNullable<typeof missionsQuery.data>])) as Record<string, NonNullable<typeof missionsQuery.data>>;
    for (const mission of missionsQuery.data ?? []) grouped[mission.status]?.push(mission);
    return grouped;
  }, [missionsQuery.data]);

  const refreshOrchestrator = async () => {
    await Promise.all([
      utils.hub.orchestrator.overview.invalidate(),
      utils.hub.orchestrator.listMissions.invalidate(),
      utils.hub.orchestrator.events.invalidate(),
    ]);
  };

  const handleCreateMission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const startupId = Number(formData.startupId);
    if (!startupId) {
      toast.error("Selecione uma startup para vincular a missão.");
      return;
    }

    try {
      const result = await createMission.mutateAsync({
        startupId,
        title: formData.title,
        description: formData.description || undefined,
        stage: formData.stage,
        priority: formData.priority,
        owner: formData.owner,
        dueAt: formData.dueAt ? new Date(`${formData.dueAt}T12:00:00`) : undefined,
      });
      toast.success(`Missão criada com risco estimado em ${result.riskScore}/100.`);
      setFormData({ ...formData, startupId: "", title: "", description: "", dueAt: "" });
      setShowForm(false);
      await refreshOrchestrator();
    } catch {
      toast.error("Não foi possível criar a missão. Verifique seu acesso e tente novamente.");
    }
  };

  const handleTransition = async (missionId: number, toStatus: (typeof statuses)[number]) => {
    try {
      await transitionMission.mutateAsync({ missionId, toStatus });
      toast.success(`Missão movida para ${statusLabels[toStatus]}.`);
      await refreshOrchestrator();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transição não permitida.");
    }
  };

  const overview = overviewQuery.data;
  const isLoading = startupsQuery.isLoading || overviewQuery.isLoading || missionsQuery.isLoading;

  return (
    <HubLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-6 md:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Workflow size={15} /> Control plane do ecossistema
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">Orquestração de Startups</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                Transforme estratégia em missões rastreáveis. Este painel organiza o portfólio, explicita riscos e mantém cada mudança de estado auditável.
              </p>
            </div>
            <Button onClick={() => setShowForm((value) => !value)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Plus size={18} className="mr-2" /> Nova missão
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Missões no portfólio", value: overview?.total ?? 0, icon: Target, tone: "text-cyan-300" },
            { label: "Em fluxo ativo", value: overview?.active ?? 0, icon: Activity, tone: "text-blue-300" },
            { label: "Risco médio", value: `${overview?.averageRisk ?? 0}/100`, icon: ShieldCheck, tone: "text-amber-300" },
            { label: "Eventos recentes", value: eventsQuery.data?.length ?? 0, icon: Clock3, tone: "text-violet-300" },
          ].map((metric) => (
            <Card key={metric.label} className="border-slate-800 bg-slate-900/60">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${metric.tone}`}>{metric.value}</p>
                </div>
                <metric.icon className={metric.tone} size={24} />
              </CardContent>
            </Card>
          ))}
        </section>

        {showForm && (
          <Card className="border-cyan-500/30 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-slate-100">Registrar nova missão</CardTitle>
              <CardDescription>O registro começa em Backlog. Nenhum serviço externo ou movimentação financeira é acionado.</CardDescription>
            </CardHeader>
            <CardContent>
              {startupsQuery.data?.length ? (
                <form onSubmit={handleCreateMission} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">Título da missão</label>
                    <Input value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Ex.: Validar canal B2B para o MVP" required minLength={3} className="border-slate-700 bg-slate-950/70" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">Descrição e resultado esperado</label>
                    <Textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Contexto, hipótese, saída esperada e critério de conclusão" className="min-h-24 border-slate-700 bg-slate-950/70" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Startup</label>
                    <select value={formData.startupId} onChange={(event) => setFormData({ ...formData, startupId: event.target.value })} required className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200">
                      <option value="">Selecione uma startup</option>
                      {startupsQuery.data.map((startup) => <option key={startup.id} value={startup.id}>{startup.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Responsável</label>
                    <Input value={formData.owner} onChange={(event) => setFormData({ ...formData, owner: event.target.value })} className="border-slate-700 bg-slate-950/70" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Estágio</label>
                    <select value={formData.stage} onChange={(event) => setFormData({ ...formData, stage: event.target.value as (typeof stages)[number] })} className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200">
                      {stages.map((stage) => <option key={stage} value={stage}>{stageLabels[stage]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Prioridade</label>
                    <select value={formData.priority} onChange={(event) => setFormData({ ...formData, priority: event.target.value as (typeof priorities)[number] })} className="h-10 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-200">
                      {priorities.map((priority) => <option key={priority} value={priority}>{priorityLabels[priority]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Prazo</label>
                    <Input type="date" value={formData.dueAt} onChange={(event) => setFormData({ ...formData, dueAt: event.target.value })} className="border-slate-700 bg-slate-950/70" />
                  </div>
                  <div className="flex items-end justify-end gap-2 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancelar</Button>
                    <Button type="submit" disabled={createMission.isPending} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                      {createMission.isPending ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Plus className="mr-2" size={16} />}
                      Criar missão
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
                  <p className="text-sm text-slate-400">Crie uma startup antes de registrar missões.</p>
                  <Link href="/startups"><Button variant="outline" className="mt-4 border-slate-700 text-slate-300">Ir para Startups</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Mission control</h2>
              <p className="mt-1 text-sm text-slate-500">Arranque explícito, bloqueios visíveis e revisão humana antes da conclusão.</p>
            </div>
            {isLoading && <Loader2 className="animate-spin text-cyan-300" size={18} />}
          </div>
          <div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-7">
            {statuses.map((status) => {
              const missions = missionsByStatus[status] ?? [];
              return (
                <div key={status} className="min-w-[250px] rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="outline" className={statusStyles[status]}>{statusLabels[status]}</Badge>
                    <span className="text-xs text-slate-600">{missions.length}</span>
                  </div>
                  <div className="space-y-3">
                    {missions.map((mission) => {
                      const next = nextStatus[mission.status];
                      return (
                        <Card key={mission.id} className="border-slate-800 bg-slate-900/80 shadow-none">
                          <CardContent className="space-y-3 p-4">
                            <div>
                              <p className="line-clamp-2 text-sm font-semibold text-slate-100">{mission.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{startupNames.get(mission.startupId) ?? `Startup #${mission.startupId}`}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">{stageLabels[mission.stage]}</Badge>
                              <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-400">{priorityLabels[mission.priority]}</Badge>
                            </div>
                            <div>
                              <div className="mb-1 flex justify-between text-[10px] text-slate-500"><span>Risco</span><span>{mission.riskScore}/100</span></div>
                              <Progress value={mission.riskScore} className="h-1.5 bg-slate-800" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1"><CalendarClock size={12} /> {formatDate(mission.dueAt)}</span>
                              <span>{mission.owner}</span>
                            </div>
                            {next && <Button size="sm" variant="outline" onClick={() => handleTransition(mission.id, next)} disabled={transitionMission.isPending} className="h-8 w-full border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/10"><ArrowRight size={13} className="mr-1" /> {statusLabels[next]}</Button>}
                            {mission.status === "completed" && <div className="flex items-center gap-1 text-xs text-emerald-300"><CheckCircle2 size={13} /> Entrega registrada</div>}
                            {mission.status === "blocked" && <div className="flex items-center gap-1 text-xs text-amber-300"><CircleAlert size={13} /> Ação necessária</div>}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {!missions.length && <p className="px-1 py-5 text-center text-xs text-slate-600">Nenhuma missão</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><Activity size={18} className="text-cyan-300" /> Timeline operacional</CardTitle>
              <CardDescription>Eventos recentes do ciclo de vida das missões.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(eventsQuery.data ?? []).map((event) => (
                  <div key={event.id} className="flex gap-3 border-b border-slate-800/70 pb-4 last:border-0 last:pb-0">
                    <div className="mt-0.5 rounded-full bg-cyan-500/10 p-2 text-cyan-300"><Activity size={14} /></div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300">{event.eventType.replaceAll("_", " ")}</p>
                      <p className="mt-1 text-xs text-slate-500">Missão #{event.missionId} · {event.actor} · {formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {!eventsQuery.data?.length && <p className="py-5 text-sm text-slate-500">A timeline será preenchida quando o primeiro operador criar uma missão.</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-gradient-to-br from-slate-900/80 to-blue-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100"><Rocket size={18} className="text-blue-300" /> Próximo nível</CardTitle>
              <CardDescription>Base pronta para o ecossistema completo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-400">
              <p>O control plane já separa intenção, execução e auditoria. As próximas integrações podem conectar OKRs, sinais de mercado e agentes especializados por adaptadores server-side.</p>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs leading-5 text-slate-400">Nenhuma missão altera saldo, publica conteúdo ou chama API externa sem um módulo de aprovação explícita.</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </HubLayout>
  );
}
