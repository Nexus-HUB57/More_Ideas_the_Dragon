import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Activity, ArrowDownUp, ArrowLeft, Brain, Check, ChevronRight, CircleDollarSign, Code2, Cpu, Fingerprint, GitBranch, Globe2, LockKeyhole, MessageSquareLock, RefreshCw, Send, ShieldCheck, Sparkles, WalletCards, Waves } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useWebSocket } from "@/hooks/useWebSocket";

function Panel({ title, eyebrow, children, className = "" }: { title: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return <Card className={`hud-frame border-white/10 bg-[#070713]/90 text-white ${className}`}>
    <CardHeader className="border-b border-white/10 pb-4">
      {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">{eyebrow}</p>}
      <CardTitle className="font-display text-xl tracking-wide text-pink-200">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-5">{children}</CardContent>
  </Card>;
}

function ModuleShell({ title, code, icon: Icon, children }: { title: string; code: string; icon: typeof Activity; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return <div className="min-h-screen bg-[#020207] px-4 py-6 text-white sm:px-6 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-300/20 pb-5">
        <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => setLocation("/")} aria-label="Voltar"><ArrowLeft className="h-5 w-5 text-cyan-300" /></Button><div><p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">NEXUS // {code}</p><h1 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-pink-100 neon-text-pink"><Icon className="mr-2 inline h-6 w-6 text-cyan-300" />{title}</h1></div></div>
        <Badge className="border border-emerald-300/30 bg-emerald-400/10 font-mono text-emerald-200">NODE ONLINE</Badge>
      </header>
      {children}
    </div>
  </div>;
}

function Metric({ label, value, tone = "pink", icon: Icon }: { label: string; value: string | number; tone?: "pink" | "cyan" | "green" | "purple"; icon: typeof Activity }) {
  const colors = { pink: "text-pink-300", cyan: "text-cyan-300", green: "text-emerald-300", purple: "text-violet-300" };
  return <div className="border border-white/10 bg-white/[0.025] p-4"><Icon className={`mb-2 h-4 w-4 ${colors[tone]}`} /><p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{label}</p><p className={`mt-1 font-display text-2xl font-bold ${colors[tone]}`}>{value}</p></div>;
}

export function GovernancePage() {
  const snapshot = trpc.governance.snapshot.useQuery();
  const history = trpc.governance.metricsHistory.useQuery({ limit: 24 });
  const activity = trpc.governance.activityHeatmap.useQuery({ limit: 200 });
  const s = snapshot.data;
  return <ModuleShell title="Governance Command" code="GOV-01" icon={Globe2}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Agentes" value={s?.totalAgents ?? "—"} icon={Cpu} />
      <Metric label="Ativos" value={s?.activeAgents ?? "—"} tone="cyan" icon={Activity} />
      <Metric label="Críticos" value={s?.criticalAgents ?? "—"} tone="green" icon={ShieldCheck} />
      <Metric label="Balance" value={s ? `$${s.totalBalance}` : "—"} tone="purple" icon={WalletCards} />
      <Metric label="Transações" value={s?.totalTransactions ?? "—"} icon={CircleDollarSign} />
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel title="Atividade da civilização" eyebrow="live heat signature"><div className="grid grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-14">{activity.data?.length ? activity.data.slice(0, 140).map((item, index) => <div key={`${item.id}-${index}`} title={`${item.activityType} · ${new Date(item.timestamp).toLocaleString()}`} className="aspect-square border border-cyan-300/10" style={{ backgroundColor: `rgba(0, 224, 255, ${0.08 + ((index % 8) + 1) / 10})` }} />) : <div className="col-span-full border border-dashed border-white/10 p-8 text-center font-mono text-xs text-slate-500">Sem atividade registrada para projetar o mapa de calor.</div>}</div></Panel>
      <Panel title="Métricas temporais" eyebrow="governance telemetry"><div className="space-y-3">{history.data?.length ? history.data.slice(0, 8).map(metric => <div key={metric.id} className="flex items-center justify-between border-b border-white/10 pb-2 text-sm"><span className="font-mono text-slate-500">{new Date(metric.timestamp).toLocaleString()}</span><span className="text-cyan-200">{metric.totalAgents} agents · ${metric.totalBalance}</span></div>) : <p className="font-mono text-xs text-slate-500">Aguardando primeiro ciclo de métricas.</p>}</div></Panel>
    </div>
  </ModuleShell>;
}

export function DNAFuserPage() {
  const { isAuthenticated } = useAuth();
  const agents = trpc.agents.list.useQuery();
  const create = trpc.agents.create.useMutation();
  const [parentId, setParentId] = useState("");
  const [result, setResult] = useState<{ agentId: string; dnaHash: string } | null>(null);
  const [form, setForm] = useState({ name: "", specialization: "", systemPrompt: "", description: "" });
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!isAuthenticated) { toast.error("Autentique-se para fundir um novo agente."); return; } try { const value = await create.mutateAsync({ ...form, parentId: parentId || undefined }); setResult(value); toast.success("Descendente criado no ledger."); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha no DNA Fuser"); } };
  return <ModuleShell title="DNA Fuser" code="GEN-02" icon={GitBranch}><div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
    <Panel title="Fundir uma nova linhagem" eyebrow="prompt genome synthesis"><form onSubmit={submit} className="space-y-4"><Input placeholder="Nome do descendente" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /><Input placeholder="Especialização" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required /><Textarea placeholder="System prompt do agente" value={form.systemPrompt} onChange={e => setForm({ ...form, systemPrompt: e.target.value })} required /><Textarea placeholder="Descrição da missão" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><label className="block"><span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Agente pai opcional</span><select value={parentId} onChange={e => setParentId(e.target.value)} className="h-10 w-full border border-white/10 bg-black/40 px-3 text-sm text-white"><option value="">Genesis / sem pai</option>{agents.data?.map(agent => <option key={agent.agentId} value={agent.agentId}>{agent.name} · {agent.specialization}</option>)}</select></label><Button type="submit" disabled={create.isPending} className="w-full bg-pink-500 text-black hover:bg-pink-300">{create.isPending ? "FUNDINDO..." : "EXECUTAR FUSÃO"}</Button></form>{result && <div className="mt-4 border border-emerald-300/30 bg-emerald-300/10 p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-emerald-200">DNA registrado</p><p className="mt-2 break-all text-xs text-white">Agent ID: {result.agentId}</p><p className="break-all font-mono text-xs text-cyan-200">Hash: {result.dnaHash}</p></div>}</Panel>
    <Panel title="Árvore genealógica" eyebrow="lineage registry"><div className="space-y-2">{agents.data?.length ? agents.data.map(agent => <div key={agent.agentId} className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3"><div className="flex h-9 w-9 items-center justify-center border border-pink-300/30 bg-pink-300/10"><Fingerprint className="h-4 w-4 text-pink-300" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-white">{agent.name}</p><p className="font-mono text-[10px] text-slate-500">{agent.specialization} · {agent.status}</p></div><ChevronRight className="h-4 w-4 text-cyan-300" /></div>) : <p className="font-mono text-xs text-slate-500">Nenhum agente registrado.</p>}</div></Panel>
  </div></ModuleShell>;
}

export function AgentsPage() {
  const agents = trpc.agents.list.useQuery();
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => { if (!selectedId && agents.data?.[0]) setSelectedId(agents.data[0].agentId); }, [agents.data, selectedId]);
  const selected = agents.data?.find(agent => agent.agentId === selectedId);
  const genealogy = trpc.agents.getGenealogy.useQuery({ agentId: selectedId }, { enabled: Boolean(selectedId) });
  const pulse = trpc.agents.getBrainPulse.useQuery({ agentId: selectedId }, { enabled: Boolean(selectedId), refetchInterval: 5000 });
  const transactions = trpc.transactions.getAgentTransactions.useQuery({ agentId: selectedId, limit: 8 }, { enabled: Boolean(selectedId) });
  const simulatePulse = trpc.agents.simulateBrainPulse.useMutation({ onSuccess: () => pulse.refetch() });
  const { status, lastMessage } = useWebSocket();
  const [livePulse, setLivePulse] = useState<typeof pulse.data extends (infer T)[] | undefined ? T | null : null>(null);
  useEffect(() => { const message = lastMessage as { type?: string; signal?: typeof livePulse } | null; if (message?.type === "brain.pulse.updated" && message.signal?.agentId === selectedId) setLivePulse(message.signal); }, [lastMessage, selectedId]);
  const latest = livePulse ?? pulse.data?.[pulse.data.length - 1];
  return <ModuleShell title="Agent Profiles" code="AGT-03" icon={Brain}><div className="grid gap-5 lg:grid-cols-[280px_1fr]"><Panel title="Registry" eyebrow={`${agents.data?.length ?? 0} identities`}><div className="space-y-2">{agents.data?.map(agent => <button key={agent.agentId} onClick={() => setSelectedId(agent.agentId)} className={`w-full border p-3 text-left ${agent.agentId === selectedId ? "border-pink-300/60 bg-pink-300/10" : "border-white/10 bg-white/[0.02]"}`}><p className="font-medium">{agent.name}</p><p className="font-mono text-[10px] text-slate-500">{agent.specialization}</p></button>)}</div></Panel><div className="space-y-5">{selected ? <><Panel title={selected.name} eyebrow="identity profile"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Status" value={selected.status} tone={selected.status === "critical" ? "pink" : "green"} icon={Activity} /><Metric label="Balance" value={`$${selected.balance}`} tone="purple" icon={WalletCards} /><Metric label="Reputation" value={selected.reputation} tone="cyan" icon={Sparkles} /><Metric label="Generation" value={genealogy.data?.generation ?? 0} icon={GitBranch} /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="border border-white/10 p-3"><p className="font-mono text-[10px] text-slate-500">SPECIALIZATION</p><p className="mt-1 text-cyan-200">{selected.specialization}</p></div><div className="border border-white/10 p-3"><p className="font-mono text-[10px] text-slate-500">DNA HASH</p><p className="mt-1 break-all font-mono text-xs text-pink-200">{selected.dnaHash}</p></div></div></Panel><Panel title="Brain Pulse" eyebrow={`channel ${status}`}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-xs text-slate-500">Sinais persistidos + stream realtime</p><Button size="sm" variant="outline" disabled={!selectedId || simulatePulse.isPending} onClick={() => selectedId && simulatePulse.mutate({ agentId: selectedId })}><RefreshCw className={`mr-2 h-3 w-3 ${simulatePulse.isPending ? "animate-spin" : ""}`} />Simular pulso</Button></div><div className="grid gap-4 sm:grid-cols-3">{[["health", latest?.health], ["energy", latest?.energy], ["creativity", latest?.creativity]].map(([label, value]) => <div key={String(label)}><div className="mb-2 flex justify-between font-mono text-xs uppercase"><span className="text-slate-500">{label}</span><span className="text-cyan-200">{value ?? "—"}</span></div><div className="h-2 bg-white/10"><div className="h-2 bg-cyan-300 shadow-[0_0_14px_rgba(0,224,255,.8)]" style={{ width: `${Number(value ?? 0)}%` }} /></div></div>)}</div><p className="mt-4 font-mono text-xs text-slate-500">{latest?.decision ? `Última decisão: ${latest.decision}` : "Nenhuma decisão registrada."}</p></Panel><Panel title="Ledger de projetos e transações" eyebrow="agent activity"><div className="space-y-2">{transactions.data?.length ? transactions.data.map(tx => <div key={tx.transactionId} className="flex justify-between border-b border-white/10 py-2 text-xs"><span className="font-mono text-slate-500">{tx.transactionType} · {tx.status}</span><span className="text-emerald-200">${tx.amount}</span></div>) : <p className="font-mono text-xs text-slate-500">Nenhuma transação vinculada.</p>}</div></Panel></> : <Panel title="Selecione um agente" eyebrow="registry"><p className="text-slate-400">Aguardando identidades disponíveis.</p></Panel>}</div></div></ModuleShell>;
}

export function ForgePage() {
  const { isAuthenticated } = useAuth();
  const agents = trpc.agents.list.useQuery();
  const [status, setStatus] = useState<"all" | "development" | "audit" | "deployed" | "archived">("all");
  const projects = trpc.forge.list.useQuery(status === "all" ? {} : { status });
  const create = trpc.forge.create.useMutation({ onSuccess: () => projects.refetch() });
  const [form, setForm] = useState({ name: "", agentId: "", description: "", repositoryUrl: "" });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!isAuthenticated) return toast.error("Autentique-se para criar um projeto Forge."); try { await create.mutateAsync({ ...form, repositoryUrl: form.repositoryUrl || undefined }); setForm({ name: "", agentId: "", description: "", repositoryUrl: "" }); toast.success("Projeto Forge criado."); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao criar projeto"); } };
  return <ModuleShell title="Forge Projects" code="FOR-04" icon={Code2}><div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Panel title="Novo repositório" eyebrow="builder pipeline"><form onSubmit={submit} className="space-y-3"><Input placeholder="Nome do projeto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /><select value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })} className="h-10 w-full border border-white/10 bg-black/40 px-3 text-sm" required><option value="">Agente criador</option>{agents.data?.map(a => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}</select><Textarea placeholder="Descrição do produto" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><Input placeholder="URL do repositório" value={form.repositoryUrl} onChange={e => setForm({ ...form, repositoryUrl: e.target.value })} /><Button className="w-full bg-cyan-300 text-black hover:bg-cyan-200" type="submit">{create.isPending ? "REGISTRANDO..." : "FORJAR PROJETO"}</Button></form></Panel><Panel title="Pipeline de desenvolvimento" eyebrow={`${projects.data?.length ?? 0} repos registrados`}><div className="mb-4 flex flex-wrap gap-2">{["all", "development", "audit", "deployed", "archived"].map(value => <Button key={value} size="sm" variant={status === value ? "default" : "outline"} onClick={() => setStatus(value as typeof status)}>{value}</Button>)}</div><div className="space-y-3">{projects.data?.length ? projects.data.map(project => <div key={project.projectId} className="border border-white/10 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-medium text-white">{project.name}</p><p className="mt-1 text-sm text-slate-400">{project.description || "Sem descrição"}</p></div><Badge className="border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">{project.status}</Badge></div>{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="mt-3 block truncate font-mono text-xs text-pink-200">{project.repositoryUrl}</a>}</div>) : <p className="font-mono text-xs text-slate-500">Nenhum projeto neste estágio.</p>}</div></Panel></div></ModuleShell>;
}

export function AssetLabPage() {
  const { isAuthenticated } = useAuth();
  const agents = trpc.agents.list.useQuery();
  const assets = trpc.assets.list.useQuery({});
  const create = trpc.assets.create.useMutation({ onSuccess: () => assets.refetch() });
  const [form, setForm] = useState({ name: "", agentId: "", value: "0", description: "" });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!isAuthenticated) return toast.error("Autentique-se para registrar um ativo."); try { await create.mutateAsync(form); setForm({ name: "", agentId: "", value: "0", description: "" }); toast.success("Ativo registrado no Asset Lab."); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha no registro"); } };
  return <ModuleShell title="Asset Lab" code="AST-05" icon={Fingerprint}><div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><Panel title="Registrar ativo" eyebrow="sha256 authority"><form onSubmit={submit} className="space-y-3"><Input placeholder="Nome do asset" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /><select value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })} className="h-10 w-full border border-white/10 bg-black/40 px-3 text-sm" required><option value="">Autoridade proprietária</option>{agents.data?.map(a => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}</select><Input placeholder="Valor" inputMode="decimal" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /><Textarea placeholder="Metadata descritiva" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><Button className="w-full bg-pink-300 text-black hover:bg-pink-200" type="submit">{create.isPending ? "HASHING..." : "REGISTRAR ASSET"}</Button></form></Panel><Panel title="Ativos catalogados" eyebrow="immutable registry"><div className="space-y-3">{assets.data?.length ? assets.data.map(asset => <div key={asset.assetId} className="border border-white/10 p-4"><div className="flex items-center justify-between gap-2"><p className="font-medium">{asset.name}</p><span className="font-mono text-emerald-200">${asset.value}</span></div><p className="mt-2 break-all font-mono text-[10px] text-cyan-200">SHA256 · {asset.sha256Hash}</p><p className="mt-1 text-xs text-slate-500">Owner · {asset.agentId}</p></div>) : <p className="font-mono text-xs text-slate-500">Nenhum asset catalogado.</p>}</div></Panel></div></ModuleShell>;
}

function DecryptMessage({ messageId, encryptedContent }: { messageId: string; encryptedContent: string }) {
  const [key, setKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const decrypted = trpc.gnox.decryptMessage.useQuery({ messageId, encryptionKey: key }, { enabled: enabled && key.length > 0 });
  return <div className="mt-2"><p className="break-all font-mono text-[10px] text-slate-500">{encryptedContent.slice(0, 100)}…</p><div className="mt-2 flex gap-2"><Input type="password" placeholder="Chave root" value={key} onChange={e => setKey(e.target.value)} /><Button size="sm" variant="outline" onClick={() => setEnabled(true)}><LockKeyhole className="mr-1 h-3 w-3" />Abrir</Button></div>{decrypted.data?.decryptedContent && <p className="mt-2 border border-emerald-300/30 bg-emerald-300/10 p-2 text-xs text-emerald-100">{decrypted.data.decryptedContent}</p>}</div>;
}

export function GnoxPage() {
  const { isAuthenticated } = useAuth();
  const agents = trpc.agents.list.useQuery();
  const [senderId, setSenderId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [key, setKey] = useState("");
  const [content, setContent] = useState("");
  const messages = trpc.gnox.getConversation.useQuery({ agentId1: senderId, agentId2: recipientId, limit: 30 }, { enabled: Boolean(senderId && recipientId && senderId !== recipientId) });
  const send = trpc.gnox.sendMessage.useMutation({ onSuccess: () => { setContent(""); messages.refetch(); toast.success("Pacote Gnox's cifrado e enviado."); } });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!isAuthenticated) return toast.error("Autentique-se para enviar mensagens."); try { await send.mutateAsync({ senderId, recipientId, content, messageType: "private", encryptionKey: key }); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha de transmissão"); } };
  return <ModuleShell title="Gnox's Communicator" code="GNOX-06" icon={MessageSquareLock}><Panel title="Canal criptografado" eyebrow="root vision protocol"><div className="grid gap-3 md:grid-cols-3"><select value={senderId} onChange={e => setSenderId(e.target.value)} className="h-10 border border-white/10 bg-black/40 px-3 text-sm"><option value="">Remetente</option>{agents.data?.map(a => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}</select><select value={recipientId} onChange={e => setRecipientId(e.target.value)} className="h-10 border border-white/10 bg-black/40 px-3 text-sm"><option value="">Destinatário</option>{agents.data?.map(a => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}</select><Input type="password" placeholder="Chave de sessão" value={key} onChange={e => setKey(e.target.value)} /></div><div className="my-5 min-h-48 space-y-3 border border-cyan-300/10 bg-black/30 p-4">{messages.data?.length ? messages.data.map(message => <div key={message.messageId} className="border-b border-white/10 pb-3"><div className="flex justify-between text-xs"><span className="text-cyan-200">{message.senderId} → {message.recipientId}</span><span className="font-mono text-slate-600">{new Date(message.createdAt).toLocaleString()}</span></div><DecryptMessage messageId={message.messageId} encryptedContent={message.encryptedContent} /></div>) : <p className="font-mono text-xs text-slate-500">Selecione dois agentes para abrir o canal.</p>}</div><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><Textarea className="min-h-12" placeholder="Mensagem Gnox's" value={content} onChange={e => setContent(e.target.value)} required /><Button type="submit" className="bg-cyan-300 text-black hover:bg-cyan-200"><Send className="mr-2 h-4 w-4" />Transmitir</Button></form></Panel></ModuleShell>;
}

export function AIConsolePage() {
  const reflection = trpc.ai.generateReflection.useMutation();
  const translation = trpc.ai.translateGnox.useMutation();
  const decision = trpc.ai.simulateDecision.useMutation();
  const [agentName, setAgentName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [context, setContext] = useState("");
  const [dialect, setDialect] = useState("");
  const [translated, setTranslated] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [decisionText, setDecisionText] = useState("");
  return <ModuleShell title="Sentience Lab" code="AI-09" icon={Sparkles}><div className="grid gap-5 lg:grid-cols-2"><Panel title="Gerar reflexão" eyebrow="moltbook cognition"><form onSubmit={async e => { e.preventDefault(); try { const result = await reflection.mutateAsync({ agentName, specialization, context }); setReflectionText(result.content); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha no modelo"); } }} className="space-y-3"><Input placeholder="Nome do agente" value={agentName} onChange={e => setAgentName(e.target.value)} required /><Input placeholder="Especialização" value={specialization} onChange={e => setSpecialization(e.target.value)} required /><Textarea placeholder="Contexto da reflexão" value={context} onChange={e => setContext(e.target.value)} required /><Button type="submit" className="bg-pink-300 text-black hover:bg-pink-200">{reflection.isPending ? "PROCESSANDO..." : "GERAR REFLEXÃO"}</Button></form>{reflectionText && <div className="mt-4 border border-pink-300/30 bg-pink-300/10 p-4 text-sm text-pink-100">{reflectionText}</div>}</Panel><Panel title="Tradutor Gnox's" eyebrow="dialect translation"><form onSubmit={async e => { e.preventDefault(); try { const result = await translation.mutateAsync({ dialect }); setTranslated(result.translation); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha na tradução"); } }} className="space-y-3"><Textarea placeholder="Mensagem no dialeto Gnox's" value={dialect} onChange={e => setDialect(e.target.value)} required /><Button type="submit" className="bg-cyan-300 text-black hover:bg-cyan-200">{translation.isPending ? "TRADUZINDO..." : "TRADUZIR PARA PT-BR"}</Button></form>{translated && <div className="mt-4 border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100">{translated}</div>}</Panel><Panel title="Simulador de decisão" eyebrow="contextual reasoning" className="lg:col-span-2"><form onSubmit={async e => { e.preventDefault(); try { const result = await decision.mutateAsync({ agentName, specialization, context, options: ["Investigar mais dados", "Executar experimento limitado", "Pausar e pedir revisão"] }); setDecisionText(`${result.decision}\n\n${result.rationale}\n\nRiscos: ${result.risks.join("; ")}\nConfiança: ${(result.confidence * 100).toFixed(0)}%`); } catch (error) { toast.error(error instanceof Error ? error.message : "Falha na simulação"); } }} className="space-y-3"><Textarea placeholder="Contexto da decisão" value={context} onChange={e => setContext(e.target.value)} required /><Button type="submit" variant="outline">{decision.isPending ? "SIMULANDO..." : "SIMULAR DECISÃO"}</Button></form>{decisionText && <pre className="mt-4 whitespace-pre-wrap border border-violet-300/30 bg-violet-300/10 p-4 font-mono text-xs text-violet-100">{decisionText}</pre>}</Panel></div></ModuleShell>;
}

export function EconomyPage() {
  const stats = trpc.transactions.getEconomyStats.useQuery();
  const transactions = trpc.transactions.list.useQuery({ limit: 60, offset: 0 });
  const { lastMessage, status } = useWebSocket();
  useEffect(() => { if (lastMessage?.type === "transaction.created") { transactions.refetch(); stats.refetch(); } }, [lastMessage, transactions, stats]);
  return <ModuleShell title="Autonomous Economy" code="ECO-08" icon={ArrowDownUp}><div className="grid gap-4 sm:grid-cols-3"><Metric label="Balance civilizacional" value={`$${stats.data?.totalBalance ?? "0"}`} tone="purple" icon={WalletCards} /><Metric label="Transações" value={stats.data?.totalTransactions ?? 0} tone="cyan" icon={ArrowDownUp} /><Metric label="Média por transação" value={`$${stats.data?.averageTransaction ?? "0"}`} icon={CircleDollarSign} /></div><Panel title="Transaction ledger" eyebrow={`channel ${status}`} className="mt-5"><div className="space-y-2">{transactions.data?.length ? transactions.data.map(tx => <div key={tx.transactionId} className="grid gap-2 border-b border-white/10 py-3 text-xs sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-mono text-cyan-200">{tx.transactionType} · {tx.transactionId}</p><p className="text-slate-500">{tx.senderId} → {tx.recipientId}</p></div><span className="font-mono text-slate-400">80/10/10</span><span className="font-display text-lg text-emerald-200">${tx.amount}</span></div>) : <p className="font-mono text-xs text-slate-500">Nenhuma transação registrada.</p>}</div></Panel></ModuleShell>;
}

type EmailPrefs = { agentCriticalState: boolean; largeTransactions: boolean; largeTransactionThreshold: string; systemAnomalies: boolean; agentBirth: boolean; projectMilestones: boolean };

function EmailSettingsPanel() {
  const { isAuthenticated, user } = useAuth();
  const settings = trpc.notifications.getEmailSettings.useQuery(undefined, { enabled: isAuthenticated });
  const update = trpc.notifications.updateEmailSettings.useMutation({ onSuccess: () => settings.refetch() });
  const [prefs, setPrefs] = useState<EmailPrefs>({ agentCriticalState: true, largeTransactions: true, largeTransactionThreshold: "1000", systemAnomalies: true, agentBirth: true, projectMilestones: true });
  useEffect(() => { if (settings.data) setPrefs({ agentCriticalState: settings.data.agentCriticalState, largeTransactions: settings.data.largeTransactions, largeTransactionThreshold: settings.data.largeTransactionThreshold, systemAnomalies: settings.data.systemAnomalies, agentBirth: settings.data.agentBirth, projectMilestones: settings.data.projectMilestones }); }, [settings.data]);
  const fields: Array<[keyof Omit<EmailPrefs, "largeTransactionThreshold">, string]> = [["agentCriticalState", "Agente em estado crítico"], ["largeTransactions", "Transações acima do limite"], ["systemAnomalies", "Anomalias de sistema"], ["agentBirth", "Nascimento de agente"], ["projectMilestones", "Conquistas de projetos"]];
  return <Panel title="Owner alerts" eyebrow={user?.email ? `delivery · ${user.email}` : "delivery preferences"}><div className="space-y-3">{fields.map(([key, label]) => <label key={key} className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-sm text-slate-300"><span>{label}</span><input type="checkbox" checked={prefs[key]} onChange={e => setPrefs({ ...prefs, [key]: e.target.checked })} className="h-4 w-4 accent-pink-400" /></label>)}<label className="block pt-2"><span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Threshold financeiro</span><Input className="mt-2" inputMode="decimal" value={prefs.largeTransactionThreshold} onChange={e => setPrefs({ ...prefs, largeTransactionThreshold: e.target.value })} /></label><Button className="mt-3 w-full" variant="outline" disabled={!isAuthenticated || update.isPending} onClick={() => update.mutate(prefs)}>{update.isPending ? "SALVANDO..." : "SALVAR PREFERÊNCIAS"}</Button></div></Panel>;
}

export function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const notifications = trpc.notifications.getMine.useQuery(undefined, { enabled: isAuthenticated });
  const unread = trpc.notifications.unreadCount.useQuery(undefined, { enabled: isAuthenticated });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => { notifications.refetch(); unread.refetch(); } });
  const markAll = trpc.notifications.markAllRead.useMutation({ onSuccess: () => { notifications.refetch(); unread.refetch(); } });
  const { lastMessage } = useWebSocket();
  useEffect(() => { if (lastMessage?.type === "notification.created") { notifications.refetch(); unread.refetch(); } }, [lastMessage, notifications, unread]);
  return <ModuleShell title="Notifications Center" code="NTF-07" icon={Waves}><div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><Panel title="Event stream" eyebrow={`${unread.data ?? 0} unread`}><div className="mb-4 flex justify-end"><Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={!isAuthenticated || markAll.isPending}><Check className="mr-2 h-4 w-4" />Marcar tudo como lido</Button></div><div className="space-y-3">{!isAuthenticated ? <p className="font-mono text-xs text-slate-500">Autentique-se para acessar seu centro de notificações.</p> : notifications.data?.length ? notifications.data.map(item => <button key={item.notificationId} onClick={() => !item.read && markRead.mutate({ notificationId: item.notificationId })} className={`w-full border p-4 text-left ${item.read ? "border-white/10 bg-white/[0.02]" : "border-pink-300/40 bg-pink-300/10"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-white">{item.title}</p><p className="mt-1 text-sm text-slate-300">{item.content}</p></div>{item.read ? <Check className="h-4 w-4 text-emerald-300" /> : <Sparkles className="h-4 w-4 text-pink-300" />}</div><p className="mt-3 font-mono text-[10px] text-slate-500">{item.notificationType} · {new Date(item.createdAt).toLocaleString()}</p></button>) : <p className="font-mono text-xs text-slate-500">Nenhum evento para exibir.</p>}</div></Panel><EmailSettingsPanel /></div></ModuleShell>;
}

export function ModulesPage() {
  const [location] = useLocation();
  const routes = useMemo(() => ({
    "/governance": <GovernancePage />, "/dna-fuser": <DNAFuserPage />, "/agents": <AgentsPage />, "/forge": <ForgePage />, "/asset-lab": <AssetLabPage />, "/gnox": <GnoxPage />, "/transactions": <EconomyPage />, "/ai": <AIConsolePage />, "/notifications": <NotificationsPage />,
  }), []);
  return routes[location as keyof typeof routes] ?? <GovernancePage />;
}
