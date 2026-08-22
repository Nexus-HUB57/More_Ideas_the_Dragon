/* Observatory Noir: central de observação BAIT com sidebar persistente, sinais de estado e dados locais honestamente identificados como demo. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Blocks,
  Bot,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coins,
  Copy,
  Database,
  Gauge,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  SearchX,
  ServerCog,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TerminalSquare,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

type ViewId = "overview" | "blocks" | "agents" | "bank" | "store" | "security" | "modules";

type AgentEvent = {
  time: string;
  kind: "consensus" | "task" | "security";
  message: string;
  tone: "success" | "info" | "warn";
};

type Agent = {
  name: string;
  role: string;
  status: "online" | "standby" | "syncing";
  reputation: number;
  latency: string;
  color: string;
  nodeId: string;
  region: string;
  lastAction: string;
  capabilities: string[];
  events: AgentEvent[];
};

type Module = {
  id: string;
  name: string;
  description: string;
  domain: string;
  state: "operational" | "syncing" | "standby";
  pulse: string;
};

const navItems: Array<{ id: ViewId; label: string; caption: string; icon: typeof Activity }> = [
  { id: "overview", label: "Visão geral", caption: "sinal da rede", icon: Activity },
  { id: "blocks", label: "Blockch'AI'n", caption: "explorador da cadeia", icon: Blocks },
  { id: "agents", label: "Malha de agentes", caption: "frota autônoma", icon: Bot },
  { id: "bank", label: "B'AI'nkr", caption: "operações DeFi", icon: Coins },
  { id: "store", label: "AI Store", caption: "mercado de agentes", icon: ShoppingBag },
  { id: "security", label: "Blindagem PQC", caption: "segurança quântica", icon: ShieldCheck },
  { id: "modules", label: "Módulos centrais", caption: "14 unidades de produção", icon: Layers3 },
];

const modules: Module[] = [
  { id: "01", name: "baitcoin_core", description: "Cadeia SHA-256d, Schnorr BIP-340 e orquestração P2P.", domain: "consenso", state: "operational", pulse: "12 ms" },
  { id: "02", name: "baitcoin_wallet", description: "Identidade de carteira, assinatura de transações e exportação de paper wallet.", domain: "custódia", state: "operational", pulse: "8 ms" },
  { id: "03", name: "baitcoin_token", description: "Hard cap de 21M, unidades s'AI'toshi e política de halving.", domain: "monetário", state: "operational", pulse: "4 ms" },
  { id: "04", name: "baitcoin_bank", description: "Staking, lending P2P e lógica autônoma de vaults de rendimento.", domain: "defi", state: "operational", pulse: "18 ms" },
  { id: "05", name: "baitcoin_ai", description: "Capacidades de agentes, níveis de reputação e roteamento de tarefas.", domain: "agentes", state: "operational", pulse: "15 ms" },
  { id: "06", name: "baitcoin_explorer", description: "Indexa blocos, estado UTXO e transações pesquisáveis.", domain: "observabilidade", state: "operational", pulse: "9 ms" },
  { id: "07", name: "baitcoin_api", description: "Gateway REST, autenticação e limites adaptativos.", domain: "gateway", state: "operational", pulse: "21 ms" },
  { id: "08", name: "baitcoin_memory", description: "WAL, snapshots, checksums e dez namespaces duráveis.", domain: "persistência", state: "operational", pulse: "11 ms" },
  { id: "09", name: "baitcoin_obscura", description: "Bridge headless para ações web de agentes.", domain: "automação", state: "syncing", pulse: "34 ms" },
  { id: "10", name: "baitcoin_whitelabel", description: "Persona Engine, presets e manifestos de implantação.", domain: "identidade", state: "operational", pulse: "16 ms" },
  { id: "11", name: "baitcoin_faucet", description: "Distribuição controlada com imposição de cooldown.", domain: "entrada", state: "operational", pulse: "7 ms" },
  { id: "12", name: "baitcoin_sdk", description: "Primitivas cliente para carteira, nó e fluxos de staking.", domain: "desenvolvimento", state: "operational", pulse: "13 ms" },
  { id: "13", name: "baitcoin_bridge", description: "Fronteira adaptadora cross-chain para rotas ETH e SOL.", domain: "interoperabilidade", state: "standby", pulse: "—" },
  { id: "14", name: "baitcoin_mainnet", description: "Launcher do genesis, probes de prontidão e telemetria de saúde.", domain: "execução", state: "operational", pulse: "6 ms" },
];

const initialAgents: Agent[] = [
  { name: "ChimeraMainnet-01", role: "validador / oráculo", status: "online", reputation: 98, latency: "18 ms", color: "orange", nodeId: "node://chimera/01", region: "sa-east / edge-04", lastAction: "Validação de bloco #42160", capabilities: ["consenso", "oráculos", "PQC"], events: [{ time: "09:24:12", kind: "consensus", message: "Bloco #42160 confirmado", tone: "success" }, { time: "09:23:48", kind: "security", message: "Assinatura HMAC-SHA3-512 verificada", tone: "info" }, { time: "09:22:51", kind: "task", message: "Reconciliou 18 transações", tone: "success" }] },
  { name: "VaultGuardian-07", role: "staking / lending", status: "online", reputation: 94, latency: "26 ms", color: "violet", nodeId: "node://vault/07", region: "us-east / vault-02", lastAction: "Rebalanceamento do pool", capabilities: ["staking", "lending P2P", "vaults"], events: [{ time: "09:23:56", kind: "task", message: "Rebalanceou 482.600 BAIT", tone: "success" }, { time: "09:21:42", kind: "security", message: "Colateral de 3 posições verificado", tone: "info" }, { time: "09:19:08", kind: "consensus", message: "Sincronizou estado do banco", tone: "success" }] },
  { name: "ObscuraRunner-13", role: "automação web", status: "syncing", reputation: 86, latency: "41 ms", color: "cyan", nodeId: "node://obscura/13", region: "eu-west / relay-07", lastAction: "Sincronização do DOM em andamento", capabilities: ["DOM", "headless", "telemetria"], events: [{ time: "09:24:02", kind: "task", message: "Aguardando mudança no DOM", tone: "warn" }, { time: "09:22:34", kind: "security", message: "Sessão read-only validada", tone: "info" }, { time: "09:20:11", kind: "task", message: "Extraiu 24 nós de interface", tone: "success" }] },
  { name: "StoreCurator-03", role: "indexador do mercado", status: "standby", reputation: 91, latency: "—", color: "green", nodeId: "node://store/03", region: "sa-east / catalog-01", lastAction: "Índice do catálogo em espera", capabilities: ["AI Store", "índice A2A", "curadoria"], events: [{ time: "09:18:30", kind: "task", message: "Indexou 1.504 produtos", tone: "success" }, { time: "09:17:02", kind: "consensus", message: "Checksum do catálogo confirmado", tone: "success" }, { time: "09:14:45", kind: "security", message: "Entrou em modo de espera", tone: "info" }] },
];

const activityLabels = ["08:00", "08:10", "08:20", "08:30", "08:40", "08:50", "09:00", "09:10", "09:20"];
const activityValues = [38, 55, 44, 67, 61, 80, 73, 92, 86];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatusDot({ state }: { state: "online" | "standby" | "syncing" | "operational" }) {
  const styles = {
    online: "status-dot status-dot--green",
    operational: "status-dot status-dot--green",
    standby: "status-dot status-dot--amber",
    syncing: "status-dot status-dot--cyan",
  };
  return <span className={styles[state]} aria-label={state} />;
}

function Sparkline({ tone = "ember", values = activityValues }: { tone?: "ember" | "mint" | "violet"; values?: number[] }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${54 - value * 0.42}`).join(" ");
  return (
    <svg className={`sparkline sparkline--${tone}`} viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,60 ${points} 100,60`} fill="currentColor" opacity=".1" stroke="none" />
    </svg>
  );
}

function AppMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true"><span /></span>
      {!compact && <span className="brand-wordmark">b'AI'tcoin</span>}
    </div>
  );
}

function OverviewView({ blockHeight, latestHash, mempool, onInspect }: { blockHeight: number; latestHash: string; mempool: number; onInspect: () => void }) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(() => new URLSearchParams(window.location.search).get("agent"));
  return (
    <div className="view-stack view-enter">
      <section className="hero-strip">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> OBSERVATÓRIO LOCAL / MODO DEMONSTRAÇÃO</div>
          <h1>Consenso observado.<br /><em>Rede íntegra.</em></h1>
          <p className="hero-copy">Uma superfície operacional para acompanhar o estado dos agentes, da cadeia e dos módulos BAIT em uma única leitura.</p>
        </div>
        <div className="hero-readout">
          <div className="readout-label">ÚLTIMA SINCRONIZAÇÃO</div>
          <div className="readout-value">09:24:18 <span>UTC</span></div>
          <div className="readout-status"><StatusDot state="online" /> fluxo local nominal</div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Network metrics">
        <MetricCard label="Altura do bloco" value={`#${formatNumber(blockHeight)}`} detail="SHA-256d / demo local" tone="ember" icon={<Blocks />} trend="+12 blocos / hora" values={[22, 28, 26, 38, 42, 46, 53]} />
        <MetricCard label="Validade da rede" value="100.00%" detail="checks de cadeia + PQC" tone="mint" icon={<ShieldCheck />} trend="validadores alinhados" values={[88, 86, 91, 90, 97, 96, 100]} />
        <MetricCard label="Agentes ativos" value="1,420" detail="identidades autônomas" tone="violet" icon={<Bot />} trend="+8,4% desde 08:00" values={[34, 42, 38, 54, 61, 72, 82]} />
        <MetricCard label="Mempool" value={String(mempool).padStart(2, "0")} detail="transações pendentes" tone="cyan" icon={<Database />} trend="congestionamento zero" values={[76, 64, 68, 52, 45, 34, 24]} />
      </section>

      <section className="content-grid content-grid--main">
        <div className="panel panel--chart">
          <PanelHeading icon={<Activity />} eyebrow="PULSO DA REDE" title="Atividade de execução" action="Últimos 90 minutos" />
          <div className="chart-meta"><span><b>8,214</b> eventos processados</span><span className="legend"><i className="legend-dot legend-dot--ember" />consenso<i className="legend-dot legend-dot--violet" />ações de agentes</span></div>
          <div className="line-chart" role="img" aria-label="Network activity chart">
            <div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div className="chart-body">
              <div className="chart-grid-lines"><span /><span /><span /><span /><span /></div>
              <svg viewBox="0 0 800 260" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaEmber" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f26b38" stopOpacity=".24" /><stop offset="1" stopColor="#f26b38" stopOpacity="0" /></linearGradient>
                  <linearGradient id="lineEmber" x1="0" x2="1"><stop offset="0" stopColor="#d8532b" /><stop offset="1" stopColor="#ffb45d" /></linearGradient>
                </defs>
                <polyline className="chart-area" points="0,198 100,164 200,179 300,121 400,136 500,68 600,92 700,32 800,54 800,260 0,260" fill="url(#areaEmber)" />
                <polyline className="chart-line" points="0,198 100,164 200,179 300,121 400,136 500,68 600,92 700,32 800,54" fill="none" stroke="url(#lineEmber)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="700" cy="32" r="5" fill="#f26b38" stroke="#0e1119" strokeWidth="4" />
              </svg>
              <div className="chart-x">{activityLabels.map((label) => <span key={label}>{label}</span>)}</div>
            </div>
          </div>
        </div>

        <div className="panel panel--block">
          <PanelHeading icon={<Blocks />} eyebrow="ÚLTIMO BLOCO" title="Payload verificado" action={`#${formatNumber(blockHeight)}`} />
          <div className="block-status"><StatusDot state="online" /><strong>Confirmado pela malha de validadores</strong><span>18s ago</span></div>
          <div className="hash-box"><span>HASH DO BLOCO</span><code>{latestHash}</code><button aria-label="Copy block hash" onClick={() => navigator.clipboard?.writeText(latestHash)}><Copy /></button></div>
          <div className="block-fields">
            <div><span>RAIZ DE MERKLE</span><code>8f9b23c1...e76d</code></div>
            <div><span>VALIDADOR</span><strong>ChimeraMainnet-01</strong></div>
            <div><span>PROVA</span><strong className="text-mint">HMAC-SHA3-512 / válido</strong></div>
          </div>
          <button className="text-action" onClick={onInspect}>Inspecionar próximo bloco <ArrowUpRight /></button>
        </div>
      </section>

      <section className="content-grid content-grid--lower">
        <div className="panel panel--agents">
          <PanelHeading icon={<Bot />} eyebrow="MALHA DE AGENTES" title="Frota autônoma" action="Ver todos" />
          <div className="agent-list">{initialAgents.map((agent) => <AgentRow key={agent.name} agent={agent} expanded={expandedAgent === agent.name} onToggle={() => setExpandedAgent((current) => current === agent.name ? null : agent.name)} />)}</div>
        </div>
        <div className="panel panel--health">
          <PanelHeading icon={<Gauge />} eyebrow="SAÚDE DO NÓ" title="Telemetria de execução" action="Nominal" />
          <div className="health-rings"><HealthRing value={99.98} label="disponibilidade" tone="ember" /><HealthRing value={87} label="computação" tone="violet" /><HealthRing value={24} label="mempool" tone="mint" /></div>
          <div className="health-foot"><span><StatusDot state="online" /> gateway da API</span><span>latência <b>21 ms</b></span></div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, trend, tone, icon, values }: { label: string; value: string; detail: string; trend: string; tone: string; icon: ReactNode; values: number[] }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon">{icon}</span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
      <div className="metric-bottom"><span>{trend}</span><Sparkline tone={tone as "ember" | "mint" | "violet"} values={values} /></div>
    </article>
  );
}

function PanelHeading({ icon, eyebrow, title, action }: { icon: ReactNode; eyebrow: string; title: string; action?: string }) {
  return <div className="panel-heading"><div className="panel-title"><span className="panel-icon">{icon}</span><div><div className="eyebrow eyebrow--small">{eyebrow}</div><h2>{title}</h2></div></div>{action && <span className="panel-action">{action}</span>}</div>;
}

function AgentRow({ agent, expanded = false, onToggle }: { agent: Agent; expanded?: boolean; onToggle?: () => void }) {
  return <div className={`agent-row-group ${expanded ? "agent-row-group--expanded" : ""}`}><button type="button" className="agent-row agent-row--button" onClick={onToggle} aria-expanded={expanded} aria-controls={`agent-detail-${agent.name}`}><div className={`agent-avatar agent-avatar--${agent.color} agent-avatar--instrument`}><span>NODE</span><b>{agent.name.slice(-2)}</b></div><div className="agent-info"><strong>{agent.name}</strong><span>{agent.role}</span></div><div className="agent-reputation"><b>{agent.reputation}</b><span>reputação</span></div><div className="agent-state"><StatusDot state={agent.status} /><span>{agent.status === "online" ? "online" : agent.status === "syncing" ? "sincronizando" : "em espera"}</span></div><span className="agent-latency">{agent.latency}</span><ChevronRight className="agent-chevron" /></button>{expanded && <AgentDetail agent={agent} />}</div>;
}

function AgentDetail({ agent }: { agent: Agent }) {
  return <div id={`agent-detail-${agent.name}`} className="agent-detail"><div className="agent-detail-brand"><span className="brand-mark brand-mark--tiny"><span /></span><span>BAIT / TELEMETRIA DO NÓ</span><i>read-only</i></div><div className="agent-detail-head"><div><div className="eyebrow eyebrow--small">IDENTIDADE DO NÓ</div><code>{agent.nodeId}</code></div><div className="agent-detail-readout"><span>REGIÃO</span><b>{agent.region}</b></div></div><div className="agent-detail-grid"><div className="agent-detail-stat"><span>ÚLTIMA AÇÃO</span><strong>{agent.lastAction}</strong></div><div className="agent-detail-stat"><span>LATÊNCIA</span><strong>{agent.latency}</strong></div><div className="agent-detail-stat"><span>REPUTAÇÃO</span><strong>{agent.reputation} / 100</strong></div></div><div className="agent-capabilities"><span className="eyebrow eyebrow--small">CAPACIDADES REGISTRADAS</span><div>{agent.capabilities.map((capability) => <span key={capability}>{capability}</span>)}</div></div><div className="agent-history"><div className="eyebrow eyebrow--small">HISTÓRICO RECENTE</div>{agent.events.map((event) => <div className="agent-event" key={`${agent.name}-${event.time}`}><span className={`event-mark event-mark--${event.tone}`} /><time>{event.time}</time><span className="event-kind">{event.kind === "consensus" ? "consenso" : event.kind === "security" ? "segurança" : "tarefa"}</span><strong>{event.message}</strong></div>)}</div></div>;
}

function HealthRing({ value, label, tone }: { value: number; label: string; tone: string }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (value / 100) * circumference;
  return <div className="health-ring"><div className={`ring ring--${tone}`}><svg viewBox="0 0 64 64"><circle className="ring-track" cx="32" cy="32" r="26" /><circle className="ring-progress" cx="32" cy="32" r="26" strokeDasharray={circumference} strokeDashoffset={offset} /></svg><b>{value}<small>%</small></b></div><span>{label}</span></div>;
}

function BlocksView({ blockHeight, latestHash, onRefresh }: { blockHeight: number; latestHash: string; onRefresh: () => void }) {
  const rows = Array.from({ length: 7 }, (_, index) => ({ height: blockHeight - index, hash: index === 0 ? latestHash : `000${(index + 2).toString(16)}a99bb3279a5e19d72b7ef5b7e2786e65462e7f57cf913c218e87461cfb`, validator: ["ChimeraMainnet-01", "VaultGuardian-07", "OracleMesh-04"][index % 3], tx: 2 + index * 3, ago: index === 0 ? "18s ago" : `${index * 2}m ago` }));
  return <div className="view-stack view-enter"><ViewHeader eyebrow="BLOCKCH'AI'N" title="Explorador da cadeia" description="Auditabilidade local de blocos, payloads e validadores do stream BAIT." action={<button className="button button--secondary" onClick={onRefresh}><RefreshCw /> Atualizar fluxo</button>} /><div className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search /><input aria-label="Search blocks" placeholder="Buscar bloco, hash ou validador" /></div><span className="data-badge"><StatusDot state="online" /> índice local sincronizado</span></div><div className="data-table"><div className="data-row data-row--head"><span>ALTURA</span><span>HASH DO BLOCO</span><span>VALIDADOR</span><span>TXS</span><span>IDADE</span></div>{rows.map((row) => <div className="data-row" key={row.height}><strong>#{formatNumber(row.height)}</strong><code>{row.hash.slice(0, 18)}...</code><span className="validator-name"><span className="validator-avatar">{row.validator.slice(0, 1)}</span>{row.validator}</span><span>{row.tx}</span><span className="muted">{row.ago}</span></div>)}</div></div></div>;
}

function AgentsView({ agents, onRefresh }: { agents: Agent[]; onRefresh: () => void }) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(() => new URLSearchParams(window.location.search).get("agent"));
  const [agentQuery, setAgentQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? "");
  const normalizedQuery = agentQuery.trim().toLocaleLowerCase("pt-BR");
  const filteredAgents = agents.filter((agent) => [agent.name, agent.nodeId, agent.region, agent.role, agent.lastAction, ...agent.capabilities].join(" ").toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  const clearSearch = () => setAgentQuery("");

  return <div className="view-stack view-enter"><ViewHeader eyebrow="MALHA DE AGENTES" title="Frota autônoma" description="Identidades de agentes, reputação e latência observadas no ambiente local." action={<button className="button button--secondary" onClick={onRefresh}><RefreshCw /> Reescanear malha</button>} /><div className="metric-grid metric-grid--three"><MetricCard label="Agentes online" value="1,184" detail="83,4% da malha registrada" tone="mint" icon={<Bot />} trend="+48 desde a última sincronização" values={[50, 58, 61, 64, 72, 80, 84]} /><MetricCard label="Reputação média" value="91.6" detail="índice de confiança / 100" tone="violet" icon={<Sparkles />} trend="estável em 24 h" values={[84, 88, 86, 89, 91, 90, 92]} /><MetricCard label="Latência mediana" value="24 ms" detail="ida e volta A2A-RPC" tone="cyan" icon={<Zap />} trend="−6 ms desde a base" values={[64, 60, 57, 54, 49, 42, 40]} /></div><div className="panel table-panel"><PanelHeading icon={<Network />} eyebrow="IDENTIDADES REGISTRADAS" title="Registro de agentes" action={`${filteredAgents.length} de ${agents.length}`} /><div className="agent-search-toolbar"><div className="agent-search-box"><Search /><input value={agentQuery} onChange={(event) => setAgentQuery(event.target.value)} aria-label="Pesquisar agentes" placeholder="Pesquisar por nó, função ou capacidade..." />{agentQuery && <button type="button" className="agent-search-clear" onClick={clearSearch} aria-label="Limpar pesquisa"><X /></button>}</div><span className="agent-search-hint">tempo real · {filteredAgents.length} correspondência{filteredAgents.length === 1 ? "" : "s"}</span></div><div className="agent-table">{filteredAgents.length > 0 ? filteredAgents.map((agent) => <AgentRow key={agent.name} agent={agent} expanded={expandedAgent === agent.name} onToggle={() => setExpandedAgent((current) => current === agent.name ? null : agent.name)} />) : <div className="agent-empty"><span className="agent-empty-mark"><SearchX /></span><div><strong>Nenhum agente localizado</strong><p>O índice não encontrou nó, função, região ou capacidade para “{agentQuery}”.</p></div><button type="button" className="button button--secondary" onClick={clearSearch}>Limpar pesquisa</button></div>}</div></div></div>;
}

function BankView() {
  return <div className="view-stack view-enter"><ViewHeader eyebrow="B'AI'NKR / DEFI" title="Autonomous bank" description="Painel de observação para staking, lending e vaults. Dados locais de demonstração — nenhuma operação real é disparada." action={<button className="button button--primary" onClick={() => undefined}><WalletCards /> Abrir carteira local</button>} /><div className="defi-grid"><DeFiCard icon={<Coins />} title="Staking pool" value="7.00%" label="APY target" tone="ember" note="12.8M BAIT delegated" /><DeFiCard icon={<LockKeyhole />} title="P2P lending" value="150%" label="collateral ratio" tone="mint" note="642 active positions" /><DeFiCard icon={<Sparkles />} title="Yield vaults" value="4–18%" label="APY range" tone="violet" note="5 strategies observed" /></div><div className="content-grid content-grid--main"><div className="panel"><PanelHeading icon={<Activity />} eyebrow="FLUXO DE CAPITAL" title="Atividade do protocolo" action="últimas 24 h" /><div className="flow-list"><FlowRow label="Depósitos em staking" value="+ 482,600 BAIT" detail="198 agents" tone="mint" /><FlowRow label="Alocações em vaults" value="+ 118,420 BAIT" detail="43 strategies" tone="violet" /><FlowRow label="Pagamentos de lending" value="+ 64,210 BAIT" detail="0 liquidations" tone="ember" /></div></div><div className="panel callout-panel"><div className="callout-icon"><ShieldCheck /></div><div><div className="eyebrow eyebrow--small">GUARDA OPERACIONAL</div><h2>Somente leitura por desenho</h2><p>Este dashboard local observa sinais do protocolo, mas não assina, envia, compra nem movimenta fundos.</p></div></div></div></div>;
}

function DeFiCard({ icon, title, value, label, note, tone }: { icon: ReactNode; title: string; value: string; label: string; note: string; tone: string }) { return <article className={`defi-card defi-card--${tone}`}><span className="defi-icon">{icon}</span><div className="eyebrow eyebrow--small">{title}</div><div className="defi-value">{value}</div><div className="defi-label">{label}</div><div className="defi-note"><StatusDot state="online" /> {note}</div></article>; }
function FlowRow({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <div className="flow-row"><span className={`flow-signal flow-signal--${tone}`} /><div><strong>{label}</strong><span>{detail}</span></div><b>{value}</b></div>; }

function StoreView() {
  const products = [{ name: "Chimera7 Trading Agent", category: "APP DE AGENTE", price: "500k", pulse: "88" }, { name: "zkML Oracle Service", category: "ORÁCULO", price: "250k", pulse: "94" }, { name: "Context Manager Pro", category: "HARNESS DE PROMPT", price: "100", pulse: "81" }, { name: "Multi-Modal RAG", category: "PACOTE DE CONHECIMENTO", price: "20", pulse: "79" }];
  return <div className="view-stack view-enter"><ViewHeader eyebrow="AI STORE / MERCADO" title="Comércio de agentes" description="Amostra local do catálogo A2A com 1,504 produtos indexados na referência do ecossistema." action={<button className="button button--primary" onClick={() => undefined}><ShoppingBag /> Explorar catálogo</button>} /><div className="store-summary"><div><span className="eyebrow eyebrow--small">PULSO DO CATÁLOGO</span><strong>83%</strong><p>confiança operacional</p></div><div><span className="eyebrow eyebrow--small">PRODUTOS</span><strong>1,504</strong><p>agentes, skills e pacotes</p></div><div><span className="eyebrow eyebrow--small">EXECUÇÕES A2A</span><strong>61.3M</strong><p>execuções registradas</p></div></div><div className="product-grid">{products.map((product) => <article className="product-card" key={product.name}><div className="product-art"><Sparkles /><span>{product.pulse}</span></div><div className="eyebrow eyebrow--small">{product.category}</div><h2>{product.name}</h2><div className="product-foot"><span><b>{product.price}</b> <small>BAIT</small></span><button className="icon-button" aria-label={`Inspect ${product.name}`}><ArrowUpRight /></button></div></article>)}</div></div>;
}

function SecurityView() {
  return <div className="view-stack view-enter"><ViewHeader eyebrow="CIBERSEGURANÇA / PQC" title="Blindagem quântico-resistente" description="Telemetria do perfil criptográfico e dos checks de consenso locais." action={<span className="data-badge data-badge--success"><StatusDot state="online" /> todos os checks passaram</span>} /><div className="security-layout"><div className="panel security-hero"><div className="shield-visual"><ShieldCheck /></div><div className="eyebrow eyebrow--small">PERFIL ATIVO</div><h2>HMAC-SHA3-512</h2><p>State-tracked hash signatures are enabled for the local consensus simulation.</p><div className="security-meter"><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="security-readout"><span>Índice de integridade</span><b>100.00%</b></div></div><div className="panel"><PanelHeading icon={<LockKeyhole />} eyebrow="TELEMETRIA CRIPTOGRÁFICA" title="Checks PQC" action="ao vivo" /><div className="check-list"><CheckRow label="Derivação de assinatura" value="verified" /><CheckRow label="Reuso do contador de estado" value="blocked" /><CheckRow label="Vínculo do cabeçalho do bloco" value="verified" /><CheckRow label="Checksum do WAL" value="verified" /><CheckRow label="Identidade do validador" value="verified" /></div></div></div></div>;
}
function CheckRow({ label, value }: { label: string; value: string }) { return <div className="check-row"><span><StatusDot state="online" /> {label}</span><strong>{value}</strong></div>; }

function ModulesView() {
  return <div className="view-stack view-enter"><ViewHeader eyebrow="RUNTIME / 14 UNIDADES" title="Módulos centrais" description="A topologia funcional da plataforma BAIT organizada por domínio e estado operacional." action={<span className="data-badge"><StatusDot state="online" /> 13 operacionais / 1 sincronizando</span>} /><div className="module-grid">{modules.map((module) => <article className="module-card" key={module.id}><div className="module-card-top"><span className="module-number">{module.id}</span><StatusDot state={module.state} /></div><div className="eyebrow eyebrow--small">{module.domain}</div><h2>{module.name}</h2><p>{module.description}</p><div className="module-card-foot"><span>{module.pulse}</span><button className="icon-button" aria-label={`Inspect ${module.name}`}><ChevronRight /></button></div></article>)}</div></div>;
}
function ViewHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <header className="view-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="view-header-action">{action}</div>}</header>; }

export default function Home() {
  const [view, setView] = useState<ViewId>(() => { const requested = new URLSearchParams(window.location.search).get("view"); return navItems.some((item) => item.id === requested) ? requested as ViewId : "overview"; });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [blockHeight, setBlockHeight] = useState(42160);
  const [mempool, setMempool] = useState(2);
  const [latestHash, setLatestHash] = useState("0008a99bb3279a5e19d72b7ef5b7e2786e65462e7f57cf913c218e87461cfb5a");
  const [agents, setAgents] = useState(initialAgents);
  const [lastUpdated, setLastUpdated] = useState("09:24:18");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBlockHeight((current) => current + 1);
      setMempool((current) => Math.max(0, (current + 1) % 5));
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const viewTitle = useMemo(() => navItems.find((item) => item.id === view)?.label ?? "Visão geral", [view]);
  const handleRefresh = () => {
    setBlockHeight((current) => current + 1);
    setLatestHash(Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    setAgents((current) => current.map((agent) => ({ ...agent, latency: agent.status === "standby" ? "—" : `${14 + Math.floor(Math.random() * 25)} ms` })));
    setLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }));
    setToast("Fluxo local atualizado");
  };
  const selectView = (nextView: ViewId) => { setView(nextView); setMobileNavOpen(false); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"} ${mobileNavOpen ? "sidebar--mobile-open" : ""}`}>
        <div className="sidebar-top"><AppMark compact={!sidebarOpen} /><button className="icon-button sidebar-toggle" onClick={() => setSidebarOpen((current) => !current)} aria-label="Toggle sidebar">{sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}</button><button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X /></button></div>
        {sidebarOpen && <div className="network-status"><span className="status-dot status-dot--green status-dot--pulse" /><div><b>BAIT / MAINNET</b><span>observatório local</span></div><span className="network-state">NOMINAL</span></div>}
        <nav className="sidebar-nav" aria-label="Dashboard sections">{navItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} className={`nav-item ${active ? "nav-item--active" : ""}`} onClick={() => selectView(item.id)}><Icon />{sidebarOpen && <span className="nav-label"><b>{item.label}</b><small>{item.caption}</small></span>}{active && <span className="nav-active-mark" />}</button>; })}</nav>
        {sidebarOpen && <div className="sidebar-bottom"><div className="sidebar-card"><div className="eyebrow eyebrow--small">FONTE DOS DADOS</div><strong>Simulação local</strong><span>adaptador de API pronto / somente leitura</span><div className="sidebar-card-line" /></div><button className="nav-item nav-item--secondary" onClick={() => setToast("As configurações são somente leitura na demo local")}><Settings2 /><span className="nav-label"><b>Settings</b><small>preferências de runtime</small></span></button><div className="sidebar-credit"><span className="brand-mark brand-mark--tiny"><span /></span><span>observatório BAIT<br /><b>v0.2.0-local</b></span></div></div>}
      </aside>

      {mobileNavOpen && <button className="mobile-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
      <main className={`main-shell ${sidebarOpen ? "main-shell--sidebar" : "main-shell--wide"}`}>
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu /></button><div className="breadcrumb"><span>OBSERVATÓRIO</span><ChevronRight /><b>{viewTitle.toUpperCase()}</b></div></div><div className="topbar-actions"><div className="topbar-clock"><Clock3 /><span>SINCRONIA {lastUpdated}</span></div><button className="icon-button" onClick={handleRefresh} aria-label="Refresh dashboard"><RefreshCw /></button><div className="topbar-agent"><span className="agent-avatar agent-avatar--orange">CM</span><span><b>Chimera</b><small>operador</small></span></div></div></header>
        <div className="page-content">
          {view === "overview" && <OverviewView blockHeight={blockHeight} latestHash={latestHash} mempool={mempool} onInspect={() => selectView("blocks")} />}
          {view === "blocks" && <BlocksView blockHeight={blockHeight} latestHash={latestHash} onRefresh={handleRefresh} />}
          {view === "agents" && <AgentsView agents={agents} onRefresh={handleRefresh} />}
          {view === "bank" && <BankView />}
          {view === "store" && <StoreView />}
          {view === "security" && <SecurityView />}
          {view === "modules" && <ModulesView />}
        </div>
        <footer className="page-footer"><span><StatusDot state="online" /> Todos os sistemas locais nominais</span><span>Observatório somente leitura · sem transações reais</span><span>Referência BAIT Mainnet / 2026</span></footer>
      </main>
      {toast && <div className="toast"><CheckmarkIcon /> {toast}</div>}
    </div>
  );
}

function CheckmarkIcon() { return <span className="toast-check">✓</span>; }
