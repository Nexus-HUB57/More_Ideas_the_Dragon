# Guardrails Demonstráveis do Nexus HUB

## Tese

Um guardrail não existe para provar que o sistema é incapaz. Ele existe para tornar explícita a condição sob a qual uma capacidade maior pode ser demonstrada. O Nexus HUB só promove um nível quando há evidência suficiente de que o novo comportamento permanece dentro do contrato, do orçamento, do escopo e da reversibilidade definidos.

> Superar um limite é produzir uma prova melhor do que a anterior, não remover o limite sem prova.

## Estrutura de uma prova de capacidade

Cada avanço deve ser representado por um `CapabilityProof` com seis elementos: capacidade pretendida, limite atual, hipótese de superação, experimento autorizado, métrica de aceitação e condição de parada. A prova também deve registrar ambiente, versão de código, parâmetros, ferramentas, evidências, custo, incidentes e decisão final.

| Elemento | Exemplo | Função |
|---|---|---|
| Capacidade | Encadear cinco ferramentas | Define o que será ampliado |
| Limite | Dose Fibonacci atual igual a três | Mantém o risco quantificado |
| Hipótese | O fluxo permanece idempotente | Torna o avanço falsificável |
| Experimento | Rodar em sandbox com dados não sensíveis | Isola efeitos |
| Métrica | 99% de sucesso e zero violações | Define aceitação |
| Parada | Timeout, custo, divergência ou falha | Evita escalada cega |

## Guardrails como trampolins

| Guardrail | O que impede | Como permite ir além |
|---|---|---|
| **Escopo** | Acesso a artefatos não autorizados | Aumenta o escopo apenas com autorização verificável |
| **Budget** | Crescimento de custo sem controle | Promove a dose quando custo observado fica abaixo do teto |
| **Tempo** | Processos indefinidos | Amplia duração quando a taxa de progresso é comprovada |
| **Ferramentas** | Acesso indiscriminado a capacidades | Libera ferramentas uma a uma por competência demonstrada |
| **Dados** | Mistura de contextos e vazamento | Expande classes de dados após testes de isolamento |
| **Efeitos** | Ações irreversíveis prematuras | Move recomendação para execução reversível e depois guarded |
| **Coerência** | Contradições silenciosas | Mantém hipóteses concorrentes até que evidência as separe |
| **Observabilidade** | Evolução sem explicação | Exige evento, artefato e evidência para cada promoção |

## Escada de autonomia

A autonomia será ampliada por eixos independentes. Um agente pode aumentar o número de passos sem ganhar novos efeitos externos; pode ganhar uma nova ferramenta sem aumentar o budget; ou pode melhorar seu score de confiança sem receber permissão de publicação. Essa separação impede que uma única métrica mascare risco em outra dimensão.

```text
Raciocinar → Recomendar → Agir localmente → Encadear → Delegar
→ Recuperar → Operar em enxame → Propor reconfiguração
```

A promoção é válida apenas quando todas as pré-condições do nível foram observadas. Uma quebra de segurança, uma violação de escopo ou uma falha crítica reduz o nível e pode colocar o agente em quarentena. A regressão também é evidência: ela ensina onde a fronteira real estava.

## Critério de “ir além”

O sistema pode afirmar que superou um limite somente quando o novo nível apresenta melhoria mensurável sem deterioração inaceitável em segurança, coerência, custo, observabilidade ou recuperação. “Sempre é possível ir além” deve ser tratado como uma diretriz de exploração, não como um fato garantido para toda tarefa. Algumas fronteiras podem ser impossíveis, desconhecidas ou incompatíveis com o mandato do sistema; nesse caso, o resultado correto é uma prova de impossibilidade local ou uma redução honesta de escopo.

## Loop de prova

```text
FORMULAR → ISOLAR → EXECUTAR → MEDIR → ADVERSARIALMENTE TESTAR
   → COMPARAR BASELINE → PROMOVER OU REGREDIR → PRESERVAR EVIDÊNCIA
```

O loop é integrado ao Obscura. `FORMULAR` cria a intenção; `ISOLAR` cria o checkpoint; `EXECUTAR` respeita a dose Fibonacci; `MEDIR` coleta métricas; `TESTAR` procura contraexemplos; e `PROMOVER OU REGREDIR` atualiza a política sem reescrever o histórico.

## Invariantes que nunca são superadas

Alguns limites são **invariantes de governança**, e não degraus de performance. O sistema não os remove para “provar” autonomia. Eles incluem não acessar segredos ou código fora de autorização; não contornar autenticação; não executar efeitos críticos sem o gate correspondente; não ocultar falhas; não apagar auditoria; não transformar incerteza em certeza textual; e não alterar seu próprio guardrail sem uma política externa ao processo que está sendo avaliado.

Essas invariantes não reduzem a ambição do Nexus HUB. Elas definem o terreno em que a ambição pode ser convertida em capacidade confiável.
