# Camada Executiva C-level do Nexus HUB

## Objetivo

A camada executiva transforma o control plane em uma estrutura de decisão operacional para o portfólio de startups. Ela não simula uma diretoria humana nem concede poder irrestrito a modelos: cada agente possui mandato explícito, autoridade graduada, orçamento máximo, ações permitidas, ações restritas e KPIs observáveis.

O desenho mantém **cinco núcleos de primeira linha**: CEO, CTO, COO, CFO e CRO. O CPO é uma função executiva de Produto dentro do núcleo CTO, com scorecard e mandato próprios, reportando ao CTO. Essa composição evita seis centros concorrentes de autoridade e preserva uma cadeia executiva curta.

## Hierarquia

| Núcleo | Agente | Reporta para | Tier | Autonomia | Budget máximo |
|---|---|---|---:|---|---:|
| CEO | NEXUS-CEO | Conselho | 5 | Estratégica com guardrails | 5,00% em bps de política |
| CTO | NEXUS-CTO | CEO | 4 | Técnica alta | 3,00% |
| Produto | NEXUS-CPO | CTO | 3 | Delegada ao Produto | 1,50% |
| COO | NEXUS-COO | CEO | 4 | Operacional alta | 2,50% |
| CFO | NEXUS-CFO | CEO | 4 | Financeira protegida | 1,00% |
| CRO | NEXUS-CRO | CEO | 4 | Comercial alta | 2,50% |

`maxBudgetBps` é um limite de política, não uma autorização para transferir dinheiro. Transferências, trading, dívida, contratos, ações destrutivas e alteração de políticas de tesouraria continuam restritos a fluxos específicos do HUB.

## Responsabilidades

O CEO define visão, estratégia, priorização do portfólio e coordenação interfuncional. Pode delegar a qualquer núcleo, mas não pode executar diretamente movimentação financeira, compromisso jurídico, exclusão de dados ou deployment sem revisão.

O CTO governa arquitetura, confiabilidade, segurança, escalabilidade, Processing Core e Engineering Harness. O CPO opera dentro deste núcleo para discovery, roadmap, experimentos e sinais de cliente; não pode alterar arquitetura, comprometer orçamento ou publicar alegações jurídicas.

O COO cuida de capacidade, SLAs, throughput, reconciliação de missões e runbooks de incidentes. O CFO opera forecast, runway, margem, reconciliação e propostas de orçamento, mas não executa transferências, trades ou dívida. O CRO integra aquisição, vendas, expansão e sucesso do cliente, sem prometer termos não aprovados, ultrapassar políticas de desconto ou compartilhar dados privados.

## Autonomia e delegação

A autonomia é implementada como autorização por ação, não como uma instrução textual vaga. A função `assertExecutiveAction` rejeita ações fora do mandato. A função `canDelegate` permite que o CEO delegue a qualquer núcleo e que o CTO delegue ao CPO; pares não podem ampliar sua própria autoridade nem delegar entre si.

Todas as missões originadas por um agente devem usar o mesmo ciclo `backlog → ready → running → review → completed`. O Harness impede conclusão quando não há Definition of Done, ownership, risco aceitável ou prazo válido. Adapters externos usam idempotência, allowlist e auditoria. Os jobs usam ledger por bucket para impedir duplicação de efeitos.

## Scorecards

Cada executivo tem KPIs específicos normalizados para `[0, 100]`. O scorecard é a média aritmética dos KPIs declarados, com estados `leading` para 80–100, `on_track` para 60–79, `at_risk` para 40–59 e `critical` para 0–39. Métricas ausentes valem zero para evitar score artificialmente otimista.

A camada deve ser expandida futuramente com pesos por estágio da startup, metas por geração, evidências vinculadas a missões, budgets consumidos e um mecanismo de revisão temporal. Nenhuma dessas extensões deve remover o princípio de separação entre recomendação, autorização e execução.

## Operação

A migration `0005_executive_agents.sql` cria a persistência dos executivos. A mutation protegida `hub.executives.initialize` faz seed idempotente dos seis perfis persistidos — cinco núcleos mais o CPO subordinado — e `hub.executives.orgChart` expõe o catálogo e o estado persistido ao painel do Orquestrador.

O primeiro rollout recomendado é somente leitura: aplicar a migration, inicializar os agentes, observar scorecards e registrar missões com `owner` explícito. A habilitação de adapters externos, ações financeiras ou automações destrutivas deve permanecer desligada até que existam políticas específicas, testes de integração e auditoria de produção.
