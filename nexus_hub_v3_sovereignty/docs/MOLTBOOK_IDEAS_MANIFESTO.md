# Nexus Moltbook de Ideias

**Autor:** Manus AI  
**Status:** especificação conceitual inicial  
**Subprojeto:** `nexus_hub_v3_sovereignty`

## 1. Tese

O Nexus HUB deixa de ser apenas um orquestrador de missões e passa a operar como um **Moltbook de ideias**: um organismo de conhecimento em que agentes, startups, sinais, hipóteses e decisões formam uma rede viva. O valor não está somente em armazenar textos, mas em preservar a trajetória de significado: quem propôs uma ideia, quais premissas a sustentam, quais evidências a contradizem, que ambiguidades permanecem abertas e quais ações podem validá-la.

> Uma ideia não é um registro estático. É uma hipótese versionada, situada em relações, submetida a evidências e capaz de gerar processos.

## 2. Os quatro substratos

| Substrato | Função | Unidade principal | Resultado esperado |
|---|---|---|---|
| **Ideias** | Capturar hipóteses, teses, perguntas e oportunidades | `IdeaNode` | Conhecimento navegável |
| **Lógica** | Expressar dependências, inferências, oposição e composição | `RelationEdge` | Raciocínio verificável |
| **Ambiguidade** | Tornar incertezas, sentidos concorrentes e lacunas explícitos | `AmbiguitySet` | Decisões mais robustas |
| **Processos** | Converter conhecimento em missões, experimentos e execuções | `ProcessIntent` | Aprendizado operacional |

Esses substratos devem permanecer desacoplados. Uma ideia pode existir sem execução; uma relação pode ser explorada sem que sua conclusão seja considerada verdadeira; e uma ambiguidade não deve ser apagada apenas para produzir uma resposta conveniente.

## 3. Ontologia mínima

### `IdeaNode`

Representa uma unidade semântica persistente. Pode ser uma hipótese de startup, uma necessidade de cliente, uma tese de mercado, um princípio de arquitetura, uma decisão, uma objeção ou uma pergunta sem resposta.

Campos essenciais: identificador estável, título, conteúdo, tipo, autor ou agente, versão, estado de validade, confiança calibrada, custo de falsificação, timestamp lógico e referências de evidência.

### `RelationEdge`

Liga dois nós e declara a natureza da relação. As relações iniciais são `supports`, `contradicts`, `depends_on`, `refines`, `instantiates`, `analogous_to`, `supersedes` e `causes`. Cada aresta possui força, justificativa, origem, versão e validade temporal.

### `AmbiguitySet`

Agrupa interpretações concorrentes para o mesmo conceito, pergunta ou decisão. Cada interpretação deve declarar o que permanece invariável, quais leituras divergem, quais observações poderiam desambiguar o conjunto e qual agente é responsável pela próxima redução de incerteza.

### `ProcessIntent`

É a ponte entre conhecimento e ação. Contém objetivo, pré-condições, passos, orçamento, risco, autonomia permitida, evidências de sucesso, estratégia de recuperação e vínculo com um ou mais nós de ideia.

## 4. Lógica sistêmica e atemporalidade

A atemporalidade não significa ignorar o tempo. Significa separar **identidade** de **estado**. O identificador de uma ideia permanece estável, enquanto seu conteúdo, confiança, relações e evidências evoluem em uma sequência de versões imutáveis. Assim, uma ideia pode ser reinterpretada sem destruir sua história.

O motor deve distinguir quatro camadas temporais: o fato observado em determinado instante; a interpretação vigente quando o fato foi analisado; a decisão tomada com base nessa interpretação; e o resultado posterior da decisão. Essa separação evita que o resultado reescreva retroativamente o que era conhecido antes da execução.

## 5. Ambiguidade como primeira classe

A ambiguidade receberá um escore composto por entropia de interpretações, conflito entre evidências, incompletude de contexto e sensibilidade da decisão. O escore não pretende simular precisão inexistente; ele indica quando o agente deve explorar, pedir novos sinais, manter múltiplas hipóteses ou bloquear uma ação irreversível.

| Nível | Condição | Comportamento do agente |
|---|---|---|
| **A0 — definido** | Uma interpretação dominante e evidência suficiente | Pode prosseguir dentro do mandato |
| **A1 — aberto** | Lacunas de contexto sem conflito relevante | Buscar informação de baixo custo |
| **A2 — concorrente** | Duas ou mais interpretações plausíveis | Manter ramos e comparar consequências |
| **A3 — contraditório** | Evidências ou agentes divergem materialmente | Solicitar arbitragem lógica e suspender efeitos externos |
| **A4 — opaco** | Baixa observabilidade ou risco crítico | Quarentena, não execução e criação de missão de investigação |

## 6. Agentes como autores e leitores

Os agentes C-level não serão apenas executores de prompts. Cada agente atuará como um **nó epistemológico** com mandato próprio, repertório de skills, estilo de análise, orçamento, critérios de evidência e responsabilidade por determinados subgrafos. CEO sintetiza tese e prioridade; CTO avalia viabilidade e arquitetura; CPO testa problema e valor; COO examina capacidade operacional; CFO modela economia e risco; CRO confronta distribuição, aquisição e receita.

Odysseus fará planejamento de rotas e exploração de alternativas. JARVIS coordenará contexto, ferramentas e multimodalidade. Hermes fará delegação, mensagens e handoffs com contratos explícitos. Obsidian manterá memória durável, backlinks, notas de decisão e grafo de conhecimento. Anthropic e outros providers serão motores intercambiáveis de raciocínio, nunca autoridades únicas.

## 7. Obscura e o ciclo ideia-processo

A camada Obscura converte uma intenção em um ciclo controlado: `discover → plan → execute → verify → recover → learn`. Cada execução deve produzir eventos, artefatos e evidências que retornam ao Moltbook. O aprendizado não altera silenciosamente uma crença; ele cria uma nova versão, registra o que mudou e associa a mudança ao resultado observado.

O Harness permanece soberano sobre efeitos externos. Autonomia pode acelerar análise, delegação, memória e operações reversíveis, mas ações financeiras, destrutivas, jurídicas, de publicação, privacidade e infraestrutura crítica exigem gates adequados, idempotência, allowlist, orçamento, rollback e auditoria.

## 8. Fluxo end-to-end

```text
Sinal → ideia → interpretações → relações → hipótese priorizada
  → ProcessIntent → Obscura → Harness → execução observável
  → evidência → atualização de confiança → nova versão do grafo
```

O ciclo é fechado, mas não circularmente cego: toda nova decisão deve poder apontar para suas premissas; toda premissa deve poder apontar para evidências; e toda execução deve poder apontar para seu resultado.

## 9. Princípios de autenticidade

O Moltbook será original porque sua unidade de valor não é o post, o chat ou o agente isolado, mas a **continuidade auditável entre significado e ação**. Será genuíno porque preservará incerteza, conflito e falha como parte do conhecimento. Será escalável porque os contratos de ideias, relações, processos e eventos permitem que novos agentes e providers participem sem alterar o núcleo semântico.

A plataforma não buscará parecer consciente. Buscará ser coerente, rastreável, corrigível e capaz de transformar conhecimento em validações comerciais com o menor desperdício de tempo, capital e atenção.

## 10. Primeira fatia implementável

A primeira entrega deve conter um grafo persistente de ideias, relações tipadas, versões imutáveis, conjuntos de ambiguidade, geração de `ProcessIntent`, execução através do Obscura engine e avaliação Harness. A interface poderá começar como feed de ideias com navegação por relações, mas o contrato de domínio deve nascer preparado para agentes, startups, experimentos e conhecimento externo.
