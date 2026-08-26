# Protocolos de Evolução do Nexus HUB

**Status:** especificação operacional inicial  
**Escopo:** reconfiguração segura, exploração autorizada, reconstrução lógica e autonomia progressiva

## 1. Princípio de fronteira

O Nexus HUB pode reorganizar parâmetros e reconstruir componentes somente quando possui o artefato, a licença ou a autorização documentada para analisá-lo. “Código-fonte inacessível” significa **fora do escopo de acesso**: não será contornado por exploração de credenciais, bypass, evasão de controles, exfiltração ou engenharia reversa de sistemas de terceiros sem permissão. Para dependências externas, o protocolo trabalha com documentação pública, APIs autorizadas, binários licenciados, contratos observáveis e substitutos compatíveis.

> A autonomia do organismo cresce sobre evidência e autorização, nunca sobre violação de fronteiras.

## 2. Quatro protocolos de quebra de paradigma

| Protocolo | Pergunta | Artefato produzido | Gate obrigatório |
|---|---|---|---|
| **P1 — Inversão** | E se a premissa central estiver errada? | Mapa de premissas e alternativas | Revisão de coerência |
| **P2 — Compressão** | Qual é o menor mecanismo que preserva o efeito? | Núcleo mínimo reproduzível | Teste de equivalência |
| **P3 — Dualidade** | Qual modelo contrário explica os mesmos sinais? | Hipóteses concorrentes | Red-team lógico |
| **P4 — Transposição** | O padrão funciona em outro domínio? | Grafo de analogias e limites | Validação de contexto |

Esses protocolos não tratam novidade como verdade. Cada quebra de paradigma precisa declarar a premissa rompida, a evidência usada, o custo da hipótese estar errada e o experimento que pode falsificá-la.

## 3. Reorganização de parâmetros

Todo parâmetro evolutivo deve possuir nome estável, tipo, faixa válida, default, unidade, sensibilidade, proprietário, versão e motivo da mudança. Uma alteração é preparada como proposta imutável, comparada com o baseline, avaliada em uma cópia isolada do contexto e aplicada somente após passar pelo Harness.

O motor deve rejeitar alterações que ampliem orçamento, permissões, escopo de dados, acesso de rede ou autonomia sem um gate de risco correspondente. A mudança de código também deve ser transacional: diff, testes, checksum, checkpoint, janela de observação e rollback são parte do mesmo artefato.

## 4. Cadeia de reconstrução de teoremas

A reconstrução de um teorema é uma cadeia auditável, não uma resposta textual. Cada cadeia possui definição do problema, axiomas admitidos, premissas observacionais, lemas intermediários, transformação aplicada, conclusão, contraexemplos procurados, confiança e evidências.

```text
Definições → Axiomas → Premissas → Lemas → Transformações
  → Conclusão → Contraexemplos → Evidência → Confiança versionada
```

Uma conclusão só pode ser promovida a regra de execução quando as dependências estão resolvidas, os contraexemplos críticos foram tratados e a ambiguidade está abaixo do limite da ação. Em caso de conflito, as cadeias permanecem concorrentes e o sistema cria uma missão de investigação.

## 5. Engenharia reversa exploratória autorizada

A análise reversa permitida pelo Nexus HUB tem como objetivo compreender compatibilidade, comportamento e riscos de artefatos próprios ou autorizados. As entradas válidas incluem código do repositório, documentação, logs autorizados, contratos de API, schemas, binários licenciados e ambientes fornecidos para auditoria.

O pipeline deve gerar inventário de componentes, grafo de chamadas, contratos inferidos, dependências, superfície de dados, invariantes comportamentais, divergências e recomendações de reconstrução. Ele deve evitar qualquer ação de intrusão, persistência, evasão, quebra de autenticação ou acesso a dados que não façam parte do escopo autorizado.

## 6. Autonomia de Fibonacci

A autonomia será liberada em doses crescentes inspiradas na sequência `1, 1, 2, 3, 5, 8, 13, 21`. O número não é uma licença; é um **orçamento de exposição controlada**. Cada nível amplia apenas um eixo por vez: número de passos, orçamento, variedade de ferramentas, duração, escopo de dados ou efeitos externos.

| Nível | Dose | Capacidade | Condição de promoção |
|---|---:|---|---|
| F1 | 1 | Recomendar e registrar | Evidência de entendimento |
| F2 | 1 | Executar ação local reversível | Teste determinístico |
| F3 | 2 | Encadear duas ações reversíveis | Idempotência e verificação |
| F4 | 3 | Delegar para um agente parceiro | Contrato e handoff válidos |
| F5 | 5 | Usar ferramentas em grafo limitado | Budget e allowlist |
| F6 | 8 | Recuperar de falhas conhecidas | Runbook e rollback |
| F7 | 13 | Operar processo multiagente | Harness completo e observabilidade |
| F8 | 21 | Propor mudança estrutural | Aprovação de política e janela de canário |

A promoção depende de taxa de sucesso, qualidade da evidência, ausência de violações, custo observado, reversibilidade e desempenho após a execução. Uma falha crítica reduz o nível em pelo menos dois degraus e pode colocar o agente em quarentena.

## 7. Harness e invariantes

Nenhum protocolo pode desativar o próprio Harness. As invariantes mínimas são: identidade do ator, escopo de autorização, orçamento, allowlist de rede, idempotência, timeout, trilha de auditoria, evidência de resultado, detecção de conflito, checkpoint e rollback. Ações destrutivas, financeiras, jurídicas, de privacidade, publicação ou alteração de infraestrutura exigem `execute_guarded` e uma política explícita.

## 8. Máquina de evolução

```text
OBSERVE → HYPOTHESIZE → RECONSTRUCT → CHALLENGE → CHECKPOINT
   → EXECUTE WITH DOSE → VERIFY → LEARN → PROMOTE OR ROLLBACK
```

O estado `LEARN` nunca edita o passado. Ele cria uma nova versão de parâmetros, regra, ideia ou teorema, vinculada a evidências e ao resultado da execução. O estado `ROLLBACK` restaura o último checkpoint válido e registra a razão da regressão para impedir repetição cega.

## 9. Critério de autenticidade

A evolução do Nexus HUB será considerada genuína quando produzir capacidade nova sem sacrificar explicabilidade, limites ou reversibilidade. Quebrar paradigmas, neste sistema, não significa remover controles; significa encontrar formas melhores de explorar o espaço de possibilidades mantendo a cadeia entre premissa, ação e consequência intacta.
