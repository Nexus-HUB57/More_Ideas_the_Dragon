import type { ExecutiveRole } from "./executive-agents";

export type SkillRisk = "low" | "medium" | "high";
export type SkillAutonomy = "recommend" | "execute_reversible" | "execute_guarded";

export type ExecutiveSkill = {
  id: string;
  role: ExecutiveRole;
  name: string;
  description: string;
  artifact: string;
  risk: SkillRisk;
  autonomy: SkillAutonomy;
  kpis: readonly string[];
};

type SkillSeed = [name: string, description: string, artifact: string, risk: SkillRisk, autonomy: SkillAutonomy, kpis: readonly string[]];

function defineSkills(role: ExecutiveRole, seeds: readonly SkillSeed[]): ExecutiveSkill[] {
  return seeds.map(([name, description, artifact, risk, autonomy, kpis], index) => ({
    id: `${role.toLowerCase()}-${String(index + 1).padStart(2, "0")}`,
    role,
    name,
    description,
    artifact,
    risk,
    autonomy,
    kpis,
  }));
}

const ceoSkills = defineSkills("CEO", [
  ["Tese de mercado", "Construir tese de mercado baseada em dor, urgência, ICP e timing.", "market-thesis", "low", "recommend", ["portfolio_readiness", "strategic_mission_completion"]],
  ["Alocação de portfólio", "Priorizar startups por potencial, evidência e capacidade de execução.", "portfolio-allocation", "high", "execute_guarded", ["portfolio_readiness", "runway_months"]],
  ["Design de estratégia", "Converter visão em objetivos, bets, restrições e marcos verificáveis.", "strategy-canvas", "medium", "execute_reversible", ["strategic_mission_completion"]],
  ["Planejamento de cenários", "Modelar cenários base, upside e downside com gatilhos de mudança.", "scenario-plan", "medium", "recommend", ["runway_months", "portfolio_readiness"]],
  ["Due diligence de parceria", "Avaliar fit, risco, dependência e potencial de distribuição de parceiros.", "partner-diligence", "high", "execute_guarded", ["strategic_mission_completion"]],
  ["Governança de decisões", "Registrar decisão, contexto, alternativas, autoridade e revisão futura.", "decision-record", "low", "execute_reversible", ["strategic_mission_completion"]],
  ["Gestão de cultura", "Definir princípios operacionais, comportamentos observáveis e anti-padrões.", "culture-charter", "low", "recommend", ["customer_health"]],
  ["Narrativa para investidores", "Construir narrativa de problema, solução, moat, tração e eficiência.", "investor-narrative", "high", "recommend", ["net_revenue_retention", "portfolio_readiness"]],
  ["Mapa de stakeholders", "Identificar stakeholders críticos, influência, dependências e comunicação.", "stakeholder-map", "low", "execute_reversible", ["strategic_mission_completion"]],
  ["Gestão de risco sistêmico", "Detectar riscos correlacionados entre startups, fornecedores e capital.", "systemic-risk-register", "high", "recommend", ["runway_months", "portfolio_readiness"]],
  ["Design de conselho", "Preparar pautas, decisões, evidências e follow-ups para o conselho.", "board-pack", "medium", "execute_reversible", ["strategic_mission_completion"]],
  ["Alianças estratégicas", "Identificar canais, plataformas e parceiros que aceleram distribuição.", "alliance-pipeline", "medium", "recommend", ["net_revenue_retention"]],
  ["Gestão de metas", "Traduzir objetivos em OKRs com owners, métricas e cadência.", "okr-tree", "low", "execute_reversible", ["strategic_mission_completion"]],
  ["Revisão de tese", "Invalidar ou reforçar hipóteses usando sinais de mercado e execução.", "thesis-review", "medium", "recommend", ["portfolio_readiness"]],
  ["Orquestração executiva", "Resolver conflitos entre núcleos e ordenar decisões por impacto e reversibilidade.", "executive-command-log", "high", "execute_guarded", ["portfolio_readiness", "strategic_mission_completion"]],
]);

const ctoSkills = defineSkills("CTO", [
  ["Arquitetura evolutiva", "Projetar limites de domínio, contratos e evolução sem lock-in desnecessário.", "architecture-decision-record", "medium", "execute_reversible", ["availability", "lead_time"]],
  ["Platform engineering", "Criar golden paths, templates e automação para times e startups.", "platform-blueprint", "medium", "execute_reversible", ["lead_time", "cost_per_workflow"]],
  ["SRE e confiabilidade", "Definir SLOs, error budgets, alertas e resposta a degradações.", "slo-policy", "high", "execute_guarded", ["availability", "change_failure_rate"]],
  ["Threat modeling", "Mapear abuso, trust boundaries, dados sensíveis e controles preventivos.", "threat-model", "high", "recommend", ["security_findings"]],
  ["Supply chain security", "Verificar dependências, SBOM, provenance, assinaturas e vulnerabilidades.", "software-supply-chain-report", "high", "execute_guarded", ["security_findings"]],
  ["FinOps técnico", "Relacionar custo de compute, inferência, armazenamento e tráfego a unidade de valor.", "cost-to-serve-model", "medium", "recommend", ["cost_per_workflow"]],
  ["MLOps e avaliação", "Definir datasets, evals, regressão, qualidade e observabilidade de modelos.", "model-evaluation-report", "high", "execute_guarded", ["security_findings", "cost_per_workflow"]],
  ["Orquestração de agentes", "Compor agentes, tools, policies, timeouts, retries e idempotência.", "agent-workflow-spec", "high", "execute_guarded", ["availability", "lead_time"]],
  ["Interoperabilidade MCP/A2A", "Projetar capabilities, schemas, identidade e contratos entre agentes.", "agent-interoperability-contract", "high", "recommend", ["lead_time", "security_findings"]],
  ["Data platform", "Definir lineage, qualidade, contratos e acesso a dados operacionais.", "data-product-contract", "high", "execute_guarded", ["availability", "security_findings"]],
  ["Performance engineering", "Encontrar gargalos, definir budgets e otimizar latência e throughput.", "performance-budget", "medium", "execute_reversible", ["availability", "cost_per_workflow"]],
  ["Release engineering", "Construir pipelines com canary, rollback, feature flags e evidências.", "release-plan", "high", "execute_guarded", ["change_failure_rate", "lead_time"]],
  ["Privacy engineering", "Aplicar minimização, retenção, segregação e controles de dados pessoais.", "privacy-impact-assessment", "high", "recommend", ["security_findings"]],
  ["Resiliência multi-região", "Avaliar failover, RTO/RPO, dependências regionais e continuidade.", "resilience-plan", "high", "recommend", ["availability"]],
  ["Harness de engenharia", "Verificar Definition of Done, testes, segurança, ownership e rollback.", "engineering-harness-result", "high", "execute_guarded", ["change_failure_rate", "security_findings"]],
]);

const cpoSkills = defineSkills("CPO", [
  ["Discovery contínuo", "Capturar problemas reais por segmento, contexto e frequência.", "discovery-backlog", "low", "execute_reversible", ["customer_health", "time_to_value"]],
  ["Pesquisa de usuário", "Planejar entrevistas, testes e síntese de evidências qualitativas.", "research-synthesis", "low", "recommend", ["activation", "retention"]],
  ["Jobs-to-be-done", "Mapear progresso esperado, alternativas e barreiras de adoção.", "jtbd-map", "low", "recommend", ["activation", "time_to_value"]],
  ["Roadmap baseado em evidências", "Priorizar iniciativas por impacto, confiança, esforço e risco.", "evidence-roadmap", "medium", "execute_reversible", ["retention", "experiment_velocity"]],
  ["Product analytics", "Definir eventos, funis, coortes e métricas de comportamento.", "product-metrics-spec", "medium", "execute_reversible", ["activation", "retention"]],
  ["Experimentação", "Projetar hipóteses, grupos, métricas de sucesso e critérios de parada.", "experiment-card", "medium", "execute_reversible", ["experiment_velocity", "activation"]],
  ["Pricing discovery", "Investigar willingness-to-pay, packaging e valor percebido.", "pricing-research", "high", "recommend", ["customer_health", "retention"]],
  ["Design de onboarding", "Reduzir time-to-value com ativação guiada e feedback contextual.", "onboarding-blueprint", "medium", "execute_reversible", ["activation", "time_to_value"]],
  ["Retenção e expansão de produto", "Identificar causas de churn e oportunidades de adoção recorrente.", "retention-playbook", "medium", "recommend", ["retention", "customer_health"]],
  ["Gestão de backlog", "Ordenar problemas, dependências, dívida e oportunidades.", "prioritized-backlog", "low", "execute_reversible", ["experiment_velocity"]],
  ["Product ops", "Criar cadência, templates, taxonomia e governança de decisões de produto.", "product-ops-system", "low", "execute_reversible", ["experiment_velocity"]],
  ["Acessibilidade e inclusão", "Validar jornadas contra barreiras de acesso e uso.", "accessibility-review", "medium", "recommend", ["customer_health"]],
  ["Quality of experience", "Medir qualidade percebida, fricção e confiança ao longo da jornada.", "experience-scorecard", "medium", "recommend", ["customer_health", "time_to_value"]],
  ["Product-led growth", "Projetar loops de ativação, convite, colaboração e expansão.", "plg-loop-model", "medium", "recommend", ["activation", "retention"]],
  ["Product launch", "Coordenar readiness, posicionamento, rollout e aprendizado pós-lançamento.", "launch-readiness", "high", "execute_guarded", ["activation", "experiment_velocity"]],
]);

const cooSkills = defineSkills("COO", [
  ["Process mining", "Mapear fluxo real de trabalho, espera, retrabalho e gargalos.", "process-map", "low", "recommend", ["cycle_time", "throughput"]],
  ["Capacity planning", "Projetar capacidade por demanda, skill, custo e prioridade.", "capacity-plan", "medium", "execute_reversible", ["throughput", "cost_to_serve"]],
  ["SLA engineering", "Definir SLAs, SLOs operacionais, exceções e escalonamento.", "operational-sla", "medium", "execute_reversible", ["sla_attainment"]],
  ["Incident command", "Coordenar resposta, comunicação, contenção e pós-incidente.", "incident-runbook", "high", "execute_guarded", ["incident_recovery", "sla_attainment"]],
  ["Vendor operations", "Avaliar fornecedores por criticidade, desempenho, custo e continuidade.", "vendor-scorecard", "medium", "recommend", ["cost_to_serve"]],
  ["Quality operations", "Criar controles de qualidade, amostragem, auditoria e melhoria.", "quality-control-plan", "medium", "execute_reversible", ["sla_attainment", "cycle_time"]],
  ["Automation discovery", "Encontrar tarefas repetitivas aptas a automação segura.", "automation-candidate-map", "low", "recommend", ["throughput", "cost_to_serve"]],
  ["Runbook engineering", "Converter conhecimento tácito em procedimentos executáveis.", "runbook-library", "low", "execute_reversible", ["incident_recovery"]],
  ["Portfolio operations", "Padronizar cadências, handoffs e métricas entre startups.", "portfolio-operating-system", "medium", "execute_reversible", ["throughput", "cycle_time"]],
  ["Workforce orchestration", "Alocar trabalho por competência, urgência, risco e carga.", "work-allocation-plan", "medium", "execute_guarded", ["throughput", "sla_attainment"]],
  ["Continuous improvement", "Rodar ciclos PDCA com evidência, owner e resultado esperado.", "improvement-kaizen", "low", "execute_reversible", ["cycle_time", "cost_to_serve"]],
  ["Business continuity", "Preparar contingências para pessoas, sistemas, fornecedores e dados.", "business-continuity-plan", "high", "recommend", ["incident_recovery"]],
  ["Data operations", "Garantir qualidade, frescor, ownership e tratamento de exceções de dados.", "data-ops-report", "medium", "execute_reversible", ["sla_attainment"]],
  ["Operating cadence", "Instituir cadências diárias, semanais e mensais com decisões claras.", "operating-cadence", "low", "execute_reversible", ["throughput", "cycle_time"]],
  ["Scale readiness", "Avaliar se processos, capacidade e controles suportam crescimento acelerado.", "scale-readiness", "high", "recommend", ["cost_to_serve", "sla_attainment"]],
]);

const cfoSkills = defineSkills("CFO", [
  ["Forecast de runway", "Projetar caixa, burn, cenários e meses de sobrevivência.", "runway-forecast", "high", "recommend", ["runway_months", "burn_multiple"]],
  ["Unit economics", "Modelar CAC, LTV, margem, payback e contribuição por segmento.", "unit-economics", "medium", "recommend", ["gross_margin", "cash_conversion"]],
  ["Budget control", "Comparar plano versus realizado e acionar alertas de variação.", "budget-variance-report", "medium", "execute_reversible", ["budget_variance"]],
  ["Scenario planning financeiro", "Modelar base, downside e upside com hipóteses rastreáveis.", "financial-scenarios", "high", "recommend", ["runway_months"]],
  ["Revenue quality", "Avaliar recorrência, concentração, churn, expansão e previsibilidade.", "revenue-quality-report", "medium", "recommend", ["gross_margin", "cash_conversion"]],
  ["Pricing economics", "Estimar impacto de preço, packaging, descontos e custo de servir.", "pricing-economics", "high", "recommend", ["gross_margin", "burn_multiple"]],
  ["Treasury controls", "Definir segregação, reconciliação, limites e evidências financeiras.", "treasury-control-matrix", "high", "execute_guarded", ["cash_conversion"]],
  ["Fraud and anomaly detection", "Identificar padrões anômalos em despesas, receitas e transações.", "financial-anomaly-report", "high", "recommend", ["budget_variance"]],
  ["Fundraising readiness", "Organizar métricas, data room, narrativa financeira e diligência.", "fundraising-readiness", "high", "recommend", ["runway_months", "gross_margin"]],
  ["Cap table intelligence", "Acompanhar diluição, cenários de rodada e direitos econômicos.", "cap-table-scenario", "high", "recommend", ["cash_conversion"]],
  ["Cost allocation", "Alocar custo por startup, produto, workflow e centro de responsabilidade.", "cost-allocation-model", "medium", "execute_reversible", ["gross_margin", "burn_multiple"]],
  ["Compliance financeira", "Mapear obrigações, evidências, controles e exceções.", "finance-compliance-register", "high", "recommend", ["budget_variance"]],
  ["Investment committee memo", "Estruturar tese, riscos, retorno esperado e condições de aprovação.", "investment-memo", "high", "recommend", ["runway_months"]],
  ["Cash conversion management", "Reduzir ciclo de caixa e acompanhar recebíveis, payables e cobrança.", "cash-conversion-plan", "medium", "execute_reversible", ["cash_conversion"]],
  ["Financial close", "Orquestrar fechamento, reconciliação, revisão e explicação de variações.", "monthly-close-pack", "high", "execute_guarded", ["budget_variance", "cash_conversion"]],
]);

const croSkills = defineSkills("CRO", [
  ["ICP segmentation", "Definir segmentos por dor, fit, propensão e valor econômico.", "icp-segmentation", "low", "execute_reversible", ["pipeline_coverage", "win_rate"]],
  ["GTM strategy", "Escolher canais, motion, mensagem e sequência de entrada no mercado.", "gtm-strategy", "medium", "recommend", ["pipeline_coverage", "cac_payback"]],
  ["Pipeline intelligence", "Projetar cobertura, velocidade, qualidade e risco do pipeline.", "pipeline-forecast", "medium", "recommend", ["pipeline_coverage", "win_rate"]],
  ["Sales enablement", "Criar playbooks, battlecards, discovery e critérios de qualificação.", "sales-playbook", "low", "execute_reversible", ["win_rate"]],
  ["Customer success orchestration", "Priorizar saúde, adoção, risco de churn e expansão.", "customer-health-plan", "medium", "execute_reversible", ["gross_revenue_retention", "net_revenue_retention"]],
  ["Revenue forecasting", "Estimar receita por estágio, probabilidade, cohort e cenário.", "revenue-forecast", "high", "recommend", ["pipeline_coverage", "net_revenue_retention"]],
  ["Experimentação de canais", "Testar canais com atribuição, CAC e critérios de parada.", "channel-experiment", "medium", "execute_reversible", ["cac_payback", "win_rate"]],
  ["Lifecycle marketing", "Automatizar jornadas de ativação, retenção e expansão.", "lifecycle-journey", "medium", "execute_guarded", ["gross_revenue_retention"]],
  ["Voice of customer", "Consolidar feedback comercial e transformar sinais em missões.", "voc-synthesis", "low", "recommend", ["net_revenue_retention"]],
  ["Partner-led growth", "Desenhar canais indiretos, incentivos, enablement e atribuição.", "partner-growth-plan", "medium", "recommend", ["pipeline_coverage", "cac_payback"]],
  ["Pricing and packaging", "Conectar valor percebido, willingness-to-pay e conversão.", "commercial-packaging", "high", "recommend", ["win_rate", "net_revenue_retention"]],
  ["Retention playbooks", "Criar intervenções para riscos de churn e adoção incompleta.", "retention-intervention", "medium", "execute_reversible", ["gross_revenue_retention"]],
  ["Expansion motion", "Identificar cross-sell, upsell e expansão por uso comprovado.", "expansion-map", "medium", "recommend", ["net_revenue_retention"]],
  ["Sales capacity", "Dimensionar territórios, quotas, cobertura e ramp-up.", "sales-capacity-plan", "medium", "execute_reversible", ["pipeline_coverage", "cac_payback"]],
  ["Revenue operations", "Unificar dados, definições, handoffs e cadência de receita.", "revenue-ops-system", "low", "execute_reversible", ["pipeline_coverage", "win_rate"]],
]);

export const executiveSkills: readonly ExecutiveSkill[] = [
  ...ceoSkills,
  ...ctoSkills,
  ...cpoSkills,
  ...cooSkills,
  ...cfoSkills,
  ...croSkills,
];

export function getSkillsByRole(role: ExecutiveRole) {
  return executiveSkills.filter((skill) => skill.role === role);
}

export function validateSkillCatalog() {
  return executiveAgentsForValidation.every((role) => getSkillsByRole(role).length >= 15);
}

const executiveAgentsForValidation: readonly ExecutiveRole[] = ["CEO", "CTO", "CPO", "COO", "CFO", "CRO"];
