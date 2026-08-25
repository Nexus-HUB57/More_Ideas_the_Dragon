# Varredura global — notas de pesquisa

Data da coleta: 25/08/2026.

## Fontes consultadas

1. Gartner, “40% of Enterprise Apps Will Feature Task-Specific AI Agents by 2026”. URL: https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025
2. Deloitte, “The State of AI in the Enterprise — 2026”. URL: https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/content/state-of-ai-in-the-enterprise.html
3. Federal Reserve, “Monitoring AI Adoption in the U.S. Economy”. URL: https://www.federalreserve.gov/econres/notes/feds-notes/monitoring-ai-adoption-in-the-u-s-economy-20260403.html
4. Google Cloud, “Empowering autonomous agents with advanced security governance”. URL: https://cloud.google.com/blog/topics/ai-infrastructure/state-of-ai-infrastructure-report-agent-governance-and-security/
5. Model Context Protocol, Specification 2026-07-28. URL: https://modelcontextprotocol.io/specification/2026-07-28
6. Agent2Agent Protocol, official documentation. URL: https://a2a-protocol.org/latest/

## Evidências

A Gartner projeta que 40% das aplicações empresariais terão agentes específicos por tarefa até o fim de 2026, contra menos de 5% em 2025. A mesma fonte descreve uma progressão de assistentes, agentes por tarefa, colaboração intra-aplicação, ecossistemas entre aplicações e experiências agentivas. Também projeta que agentes poderiam representar aproximadamente 30% da receita de software empresarial em 2035 no melhor cenário, acima de US$450 bilhões.

A Deloitte informa que o acesso de trabalhadores a AI subiu 50% em 2025 e que a quantidade de empresas com pelo menos 40% dos projetos em produção deve dobrar em seis meses. O relatório também registra que apenas um em cada cinco negócios possui um modelo maduro de governança para agentes autônomos; 42% consideram a estratégia muito preparada, mas a preparação operacional em infraestrutura, dados, risco e talentos está atrás. A adoção de IA física é reportada em 58% das empresas em algum nível, com projeção de 80% em dois anos.

A Federal Reserve aparece como fonte institucional para medir adoção de AI na economia norte-americana; a página consultada precisa de extração adicional do trecho estatístico completo antes de ser usada como número central no relatório.

O Google Cloud relata que 79% dos líderes de tecnologia pesquisados apontam segurança, governança ou operações como o principal desafio para escalar inferência. A fonte destaca riscos específicos de agentes: acesso multi-sistema, tool poisoning, prompt injection indireto e permissões dinâmicas. Também relata que 69% dos executivos consideram uma plataforma full-stack requisito crítico e 80% apontam compliance de dados como fator primário de escolha. A implicação é que o produto vencedor tende a ser control plane + identidade + observabilidade + governança, e não apenas um chatbot.

A especificação MCP define um protocolo aberto baseado em JSON-RPC para conectar hosts, clientes e servidores a recursos, prompts e tools. A versão consultada descreve requests stateless e negociação de capacidades por requisição, o que favorece adapters compostáveis com permissões e políticas explícitas.

A documentação oficial do A2A define um padrão aberto para comunicação entre aplicações agentivas opacas. O protocolo enfatiza interoperabilidade entre frameworks, delegação de subtarefas, colaboração em workflows complexos, preservação de memória/lógica proprietária e extensibilidade. Para o Nexus HUB, isso sugere separar tool access via MCP de coordenação agent-to-agent via A2A, com identidade, capability registry, task ledger e políticas de execução.

## Hipóteses de produto para o Nexus HUB

A oportunidade mais defensável é um control plane de autonomia empresarial com quatro camadas: identidade e autorização de agentes; grafo de contexto e tools; execução com sandbox, budgets, retries e idempotência; e governança verificável com Harness, evidência, trilhas de auditoria e rollback. “100% autônomo” deve ser tratado como autonomia técnica limitada por políticas, não como ausência de controles: ações financeiras, legais, destrutivas ou irreversíveis exigem gates específicos mesmo que o fluxo normal seja automático.

## Evidências adicionais

A OECD registra que, em 2025, AI recebeu 61% do valor global de venture capital, equivalente a USD 258,7 bilhões, e que infraestrutura/hosting de IT para AI recebeu USD 109,3 bilhões. A mesma publicação alerta que 73% do valor de investimento em AI em 2025 esteve concentrado em mega deals acima de USD 100 milhões e que o mercado é cíclico; portanto, capital capturado não é sinônimo de valuation sustentável.

O SVB reporta que 65% do venture capital de enterprise software nos EUA foi para AI startups em 2025, mas também observa pressão de rentabilidade, 356 unicórnios apoiados por VC e mudança de pricing de assentos para modelos híbridos, usage-based e outcome-based. O relatório informa que apenas 26% esperam continuar exclusivamente em assinatura, ante 37% hoje, e alerta para “zombiecorns” com crescimento baixo.

O relatório da Menlo Ventures estima USD 37 bilhões de gasto empresarial em generative AI em 2025, com USD 19 bilhões na camada de aplicações. Também reporta que 76% dos casos de uso de AI passaram a ser comprados, não construídos internamente, e que deals de AI chegam à produção em 47% dos casos contra 25% para SaaS tradicional. A fonte descreve PLG como canal relevante e startups ganhando espaço em product/engineering, sales e finance/operations; os números são de pesquisa privada e devem ser tratados como evidência de mercado, não como garantia.

A análise da Aventis registra mediana EV/Revenue de SaaS público próxima de 3,4x em março de 2026 e reforça que crescimento, margem, retenção, eficiência e diferenciação por dados proprietários sustentam prêmio; wrappers simples de AI enfrentam risco de substituição. Essa referência é indicativa de mercado público e não deve ser aplicada mecanicamente a uma startup privada.

A documentação do Kubernetes define CronJob como recurso nativo que cria Jobs recorrentes, com `concurrencyPolicy`, `startingDeadlineSeconds`, limites de histórico e timezone. Ela também alerta que a criação de Jobs é aproximada e pode duplicar ou perder uma ocorrência, razão pela qual workloads devem ser idempotentes. Para Docker Swarm, a referência consultada foi `crazy-max/swarm-cronjob`, um scheduler adicional que observa serviços via Docker API e usa labels; isso indica maior dependência operacional que o CronJob nativo do Kubernetes.

## Implicação de plataforma

A recomendação preliminar é priorizar Kubernetes para produção por oferecer CronJob nativo, políticas de concorrência, histórico e timezone no mesmo control plane. Docker Swarm pode receber um stack equivalente com scheduler dedicado, mas deve manter o ledger idempotente do Nexus HUB e exigir operação explícita do scheduler. Em ambos os casos, deployment real depende de cluster, registry, DNS, secret manager e credenciais fornecidos pelo operador.

A documentação do Kubernetes consultada em https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ define CronJob como recurso estável para criar Jobs recorrentes. Os campos relevantes para produção são `concurrencyPolicy: Forbid`, `startingDeadlineSeconds`, `successfulJobsHistoryLimit`, `failedJobsHistoryLimit` e `timeZone: Etc/UTC`; a própria documentação alerta que o agendamento é aproximado e pode criar duas ocorrências ou nenhuma, exigindo idempotência no workload. A documentação de execução é https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/.

Para Docker Swarm, a referência https://github.com/crazy-max/swarm-cronjob informa que `swarm-cronjob` é um componente adicional que observa serviços pela Docker API e cria execuções recorrentes com base em labels. A dependência no Docker API e a ausência de um objeto CronJob nativo tornam Kubernetes a escolha preferencial para este workload; Swarm permanece possível com scheduler dedicado e o ledger idempotente do Nexus HUB.

A documentação raw do swarm-cronjob confirmou os labels `swarm.cronjob.enable`, `swarm.cronjob.schedule`, `swarm.cronjob.skip-running`, `swarm.cronjob.replicas`, `swarm.cronjob.registry-auth` e `swarm.cronjob.query-registry`. O exemplo oficial usa `replicas: 0` e `restart_policy.condition: none` no serviço agendado, enquanto o scheduler cria as execuções.
