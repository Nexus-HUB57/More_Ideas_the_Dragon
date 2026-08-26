import type { ExecutiveRole } from "./executive-agents";

export const nexusAegisThesis = {
  name: "Nexus Aegis",
  description: "AI-native Operations & Compliance Fabric para empresas B2B SaaS e fintechs que operam agentes e workflows automatizados em ambientes regulados.",
  status: "planning" as const,
  isCore: false,
  traction: 0,
  revenue: 0,
  reputation: 0,
  generation: 1,
  icp: "B2B SaaS e fintechs de 50 a 2.000 funcionários com agentes em produção, múltiplos provedores de modelo/API e exigências enterprise de segurança, evidência e auditoria.",
  valueProposition: "Colocar workflows agentivos em produção com velocidade, controle, evidência e operação auditável.",
  expansionPath: ["B2B SaaS/fintech", "healthcare operations", "supply chain", "industrial physical AI"],
};

export type StartupMissionSeed = {
  title: string;
  description: string;
  stage: "discovery" | "validation" | "build" | "launch" | "scale";
  priority: "critical" | "high" | "medium" | "low";
  owner: string;
  executiveRole: ExecutiveRole;
  skillKey: string;
  externalSideEffect: boolean;
};

export const nexusAegisMissions: readonly StartupMissionSeed[] = [
  {
    title: "Entrevistar compradores de AI governance em B2B SaaS e fintech",
    description: "Resultado esperado: entrevistar 20 compradores, identificar 3 dores recorrentes e selecionar 5 design partners potenciais.",
    stage: "discovery",
    priority: "high",
    owner: "NEXUS-CRO",
    executiveRole: "CRO",
    skillKey: "cro-09",
    externalSideEffect: false,
  },
  {
    title: "Definir taxonomia de risco para workflows agentivos",
    description: "Resultado esperado: taxonomia low/medium/high/guarded, policy por risco e evidência obrigatória para cada classe.",
    stage: "validation",
    priority: "critical",
    owner: "NEXUS-CTO",
    executiveRole: "CTO",
    skillKey: "cto-04",
    externalSideEffect: false,
  },
  {
    title: "Prototipar inventário de agentes e policy registry",
    description: "Resultado esperado: schema versionado, inventário de agentes/tools, policy registry e Harness mínimo navegável.",
    stage: "build",
    priority: "high",
    owner: "NEXUS-CTO",
    executiveRole: "CTO",
    skillKey: "cto-08",
    externalSideEffect: false,
  },
  {
    title: "Validar workflow de compliance e evidência",
    description: "Resultado esperado: workflow multiestágio com aprovação, evidência, rollback, adapter e timeline auditável.",
    stage: "validation",
    priority: "critical",
    owner: "NEXUS-COO",
    executiveRole: "COO",
    skillKey: "coo-09",
    externalSideEffect: false,
  },
  {
    title: "Testar onboarding e time-to-value do control plane",
    description: "Resultado esperado: onboarding blueprint, evento de ativação, métrica de time-to-value e experimento definido.",
    stage: "discovery",
    priority: "medium",
    owner: "NEXUS-CPO",
    executiveRole: "CPO",
    skillKey: "cpo-08",
    externalSideEffect: false,
  },
  {
    title: "Modelar unit economics e pricing enterprise",
    description: "Resultado esperado: três hipóteses de packaging, custo por workflow, payback e critérios de decisão comercial.",
    stage: "validation",
    priority: "high",
    owner: "NEXUS-CFO",
    executiveRole: "CFO",
    skillKey: "cfo-02",
    externalSideEffect: false,
  },
  {
    title: "Construir investor narrative e plano de alocação",
    description: "Resultado esperado: tese, moat, riscos, milestones e plano de capital condicionados a evidência de clientes.",
    stage: "discovery",
    priority: "medium",
    owner: "NEXUS-CEO",
    executiveRole: "CEO",
    skillKey: "ceo-08",
    externalSideEffect: false,
  },
];
