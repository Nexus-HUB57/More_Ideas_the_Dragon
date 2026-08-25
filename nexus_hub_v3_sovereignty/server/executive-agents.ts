export const executiveNuclei = ["CEO", "CTO", "COO", "CFO", "CRO"] as const;
export type ExecutiveNucleus = (typeof executiveNuclei)[number];
export type ExecutiveRole = ExecutiveNucleus | "CPO";
export type AutonomyMode = "strategic_guarded" | "technical_high" | "operational_high" | "financial_guarded" | "commercial_high" | "product_delegated";

export type ExecutiveAgentDefinition = {
  role: ExecutiveRole;
  nucleus: ExecutiveNucleus;
  name: string;
  mandate: string;
  reportsTo: ExecutiveRole | "board";
  authorityTier: 1 | 2 | 3 | 4 | 5;
  autonomy: AutonomyMode;
  maxBudgetBps: number;
  allowedActions: readonly string[];
  restrictedActions: readonly string[];
  primaryKpis: readonly string[];
};

export const executiveAgents: readonly ExecutiveAgentDefinition[] = [
  {
    role: "CEO",
    nucleus: "CEO",
    name: "NEXUS-CEO",
    mandate: "Definir visão, estratégia, cultura, alocação de portfólio e coordenação dos demais núcleos.",
    reportsTo: "board",
    authorityTier: 5,
    autonomy: "strategic_guarded",
    maxBudgetBps: 500,
    allowedActions: ["set_strategy", "prioritize_portfolio", "open_partnership_mission", "request_board_review"],
    restrictedActions: ["move_funds", "sign_legal_commitment", "delete_data", "deploy_unreviewed_code"],
    primaryKpis: ["portfolio_readiness", "net_revenue_retention", "runway_months", "strategic_mission_completion"],
  },
  {
    role: "CTO",
    nucleus: "CTO",
    name: "NEXUS-CTO",
    mandate: "Garantir arquitetura, segurança, escalabilidade, confiabilidade e velocidade de engenharia.",
    reportsTo: "CEO",
    authorityTier: 4,
    autonomy: "technical_high",
    maxBudgetBps: 300,
    allowedActions: ["create_technical_mission", "run_harness", "propose_deployment", "route_processing_graph"],
    restrictedActions: ["change_financial_policy", "grant_external_scope", "disable_audit", "production_destructive_action"],
    primaryKpis: ["availability", "lead_time", "change_failure_rate", "security_findings", "cost_per_workflow"],
  },
  {
    role: "CPO",
    nucleus: "CTO",
    name: "NEXUS-CPO",
    mandate: "Descobrir necessidades, manter roadmap, elevar ativação, retenção e qualidade da experiência do produto.",
    reportsTo: "CTO",
    authorityTier: 3,
    autonomy: "product_delegated",
    maxBudgetBps: 150,
    allowedActions: ["create_discovery_mission", "prioritize_roadmap", "run_experiment", "request_customer_signal"],
    restrictedActions: ["alter_architecture", "commit_company_budget", "change_security_policy", "publish_legal_claim"],
    primaryKpis: ["activation", "retention", "time_to_value", "experiment_velocity", "customer_health"],
  },
  {
    role: "COO",
    nucleus: "COO",
    name: "NEXUS-COO",
    mandate: "Orquestrar operações, capacidade, SLAs, processos internos e eficiência de execução.",
    reportsTo: "CEO",
    authorityTier: 4,
    autonomy: "operational_high",
    maxBudgetBps: 250,
    allowedActions: ["reconcile_missions", "assign_capacity", "define_operational_sla", "trigger_incident_runbook"],
    restrictedActions: ["move_funds", "change_product_strategy", "disable_controls", "delete_customer_data"],
    primaryKpis: ["sla_attainment", "throughput", "cycle_time", "cost_to_serve", "incident_recovery"],
  },
  {
    role: "CFO",
    nucleus: "CFO",
    name: "NEXUS-CFO",
    mandate: "Proteger caixa, runway, controles financeiros, planejamento e eficiência econômica do portfólio.",
    reportsTo: "CEO",
    authorityTier: 4,
    autonomy: "financial_guarded",
    maxBudgetBps: 100,
    allowedActions: ["forecast_runway", "approve_budget_proposal", "flag_financial_risk", "reconcile_ledger"],
    restrictedActions: ["execute_transfer", "trade_assets", "sign_debt", "change_treasury_policy"],
    primaryKpis: ["runway_months", "gross_margin", "burn_multiple", "cash_conversion", "budget_variance"],
  },
  {
    role: "CRO",
    nucleus: "CRO",
    name: "NEXUS-CRO",
    mandate: "Unificar aquisição, vendas, expansão e sucesso do cliente para crescimento eficiente e sustentável.",
    reportsTo: "CEO",
    authorityTier: 4,
    autonomy: "commercial_high",
    maxBudgetBps: 250,
    allowedActions: ["create_go_to_market_mission", "segment_accounts", "propose_pricing_test", "route_customer_success"],
    restrictedActions: ["promise_unapproved_terms", "discount_beyond_policy", "share_private_data", "sign_contract"],
    primaryKpis: ["pipeline_coverage", "win_rate", "net_revenue_retention", "cac_payback", "gross_revenue_retention"],
  },
] as const;

export function getExecutiveAgent(role: ExecutiveRole) {
  return executiveAgents.find((agent) => agent.role === role);
}

export function canDelegate(from: ExecutiveRole, to: ExecutiveRole) {
  const target = getExecutiveAgent(to);
  if (!target) return false;
  if (from === "CEO") return true;
  if (from === "CTO") return to === "CPO" || to === "CTO";
  return to === from;
}

export type ScorecardInput = Partial<Record<string, number>>;

export function calculateExecutiveScorecard(agent: ExecutiveAgentDefinition, metrics: ScorecardInput) {
  const values = agent.primaryKpis.map((kpi) => Math.max(0, Math.min(100, metrics[kpi] ?? 0)));
  const score = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  return {
    role: agent.role,
    nucleus: agent.nucleus,
    score,
    status: score >= 80 ? "leading" : score >= 60 ? "on_track" : score >= 40 ? "at_risk" : "critical",
    metrics: Object.fromEntries(agent.primaryKpis.map((kpi, index) => [kpi, values[index]])),
  } as const;
}

export function assertExecutiveAction(role: ExecutiveRole, action: string) {
  const agent = getExecutiveAgent(role);
  if (!agent) throw new Error(`Agente executivo não encontrado: ${role}`);
  if (agent.restrictedActions.includes(action)) throw new Error(`Ação restrita para ${role}: ${action}`);
  if (!agent.allowedActions.includes(action)) throw new Error(`Ação não autorizada para ${role}: ${action}`);
  return true;
}
