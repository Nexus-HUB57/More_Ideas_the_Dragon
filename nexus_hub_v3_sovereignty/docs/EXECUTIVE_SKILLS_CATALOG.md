# Catálogo de Skills do Organismo Executivo

## Princípio

Cada perfil executivo recebe quinze skills especializadas, totalizando **90 skills declarativas** para os seis perfis do organismo: CEO, CTO, CPO, COO, CFO e CRO. As skills não são prompts soltos; cada uma declara descrição, artefato esperado, risco, modo de autonomia e KPIs relacionados.

O catálogo está implementado em `server/executive-skills.ts` e pode ser alimentado no banco pela mutation protegida `hub.executives.seedSkills`. A migration `drizzle/0005_executive_skills.sql` cria a tabela persistente com chave única, índice por cargo e índice por risco.

## Distribuição

| Perfil | Domínios cobertos | Artefatos típicos |
|---|---|---|
| CEO | Estratégia, portfólio, cenários, conselho, cultura, alianças e governança | Tese de mercado, plano de cenários, board pack, OKR tree e command log. |
| CTO | Plataforma, SRE, segurança, MLOps, interoperabilidade, dados e release engineering | ADR, threat model, SLO policy, SBOM report, workflow spec e release plan. |
| CPO | Discovery, pesquisa, JTBD, roadmap, analytics, experimentos, pricing e PLG | Research synthesis, roadmap, experiment card, onboarding blueprint e launch readiness. |
| COO | Process mining, capacidade, SLAs, incidentes, fornecedores, automação e continuidade | Capacity plan, SLA, runbook, vendor scorecard, operating cadence e scale readiness. |
| CFO | Runway, unit economics, orçamento, receita, tesouraria, compliance e captação | Forecast, unit economics, variance report, control matrix, investment memo e close pack. |
| CRO | ICP, GTM, pipeline, vendas, customer success, canais, lifecycle e revenue ops | GTM strategy, pipeline forecast, sales playbook, health plan, expansion map e revenue ops system. |

## Níveis de autonomia

`recommend` produz análise e recomendação sem execução. `execute_reversible` pode executar mudanças reversíveis dentro do mandato e registrar evidência. `execute_guarded` exige o Harness, política explícita, idempotência e condições de segurança antes de qualquer efeito externo.

O campo de risco é independente da autonomia. Uma skill de alto risco pode recomendar livremente, mas nunca deve obter execução desprotegida. O teste `executive-skills.test.ts` garante que skills high-risk não bypassam o modo guarded.

## Alimentação e operação

O endpoint `hub.executives.skills` expõe o catálogo estático e os registros persistidos. `hub.executives.catalogHealth` verifica que cada perfil possui pelo menos quinze skills e informa a contagem total. A mutation `hub.executives.seedSkills` realiza upsert idempotente, permitindo bootstrap repetível em cada ambiente.

No fluxo operacional, uma missão deve declarar o agente responsável, selecionar a skill aplicável, gerar o artefato correspondente e passar pelo Harness. O scorecard do executivo consome os KPIs da skill, enquanto a auditoria registra actor, missão, risco, artefato e resultado. Skills que envolvem dinheiro, dados pessoais, publicação, contratos, infraestrutura destrutiva ou acesso externo devem permanecer em `execute_guarded`.

A expansão futura recomendada é associar dependências entre skills, versões, evidências, custo de execução, cobertura por startup e resultados de avaliação. A autonomia deve crescer por evidência acumulada e não por uma flag global de confiança.
