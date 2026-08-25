# Processing Core — ordenação topológica e detecção de ciclos

## Modelo

O Processing Core representa uma pipeline como um grafo direcionado. Cada `ProcessingNode` possui um `id`, uma lista opcional `dependsOn` e uma função `run(input, context)`. Uma aresta `A → B` significa que **B depende de A** e, portanto, A precisa produzir seu output antes de B.

O algoritmo não executa um node até conhecer a ordem válida de todo o grafo. Primeiro ele valida identidade e dependências; depois resolve a ordem; por fim executa os nós sequencialmente, entregando a cada nó um `ReadonlyMap` com os outputs dos predecessores.

## Fase 1 — índice e identidade

A lista é transformada em `Map<id, node>`:

```ts
const byId = new Map(nodes.map((node) => [node.id, node]));
if (byId.size !== nodes.length) throw new Error("IDs duplicados");
```

Se o tamanho do mapa for menor que o tamanho da lista, dois nodes possuem o mesmo identificador. A rejeição ocorre antes de qualquer execução para impedir resultados ambíguos ou sobrescrita de output.

## Fase 2 — DFS com três estados implícitos

A implementação usa duas coleções:

| Coleção | Significado |
|---|---|
| `visiting` | Node descoberto no caminho DFS atual, mas ainda não finalizado. |
| `visited` | Node completamente processado, incluindo todas as dependências. |
| Ausente nas duas | Node ainda não descoberto. |

O procedimento `visit(id)` segue esta lógica:

```text
visit(id):
  se id ∈ visited:
    retornar
  se id ∈ visiting:
    lançar "ciclo detectado"
  se id ∉ byId:
    lançar "dependência ausente"

  adicionar id a visiting
  para cada dependency em node[id].dependsOn:
    visit(dependency)
  remover id de visiting
  adicionar id a visited
  adicionar id ao final de order
```

A checagem de `visiting` identifica um back-edge. Por exemplo, no grafo `A depende de B` e `B depende de A`, a busca entra em A, depois B, e ao tentar visitar A novamente encontra A ainda em `visiting`. Isso é diferente de uma dependência compartilhada: se `C` e `D` dependem de `A`, a segunda visita encontra A em `visited` e retorna sem erro.

## Por que a ordem é topológica

Um node só entra em `order` depois que todas as suas dependências foram visitadas e adicionadas. Portanto, para cada aresta `dependency → node`, a dependência aparece antes do node. A ordem é topológica por construção.

A implementação inicia `visit` para cada node da lista, e não apenas para um root. Isso cobre grafos desconectados: dois pipelines independentes continuam sendo ordenados no mesmo resultado sem exigir um super-root artificial.

## Fase 3 — execução dos outputs

Depois da DFS, o Core cria `outputs = new Map()` e percorre `order`:

```text
para cada id em order:
  node = byId[id]
  outputs[id] = await node.run(input, outputs)
```

O contexto é somente leitura no tipo (`ReadonlyMap`), e o Core controla a escrita no mapa. O node pode consultar os outputs de seus predecessores, mas não pode reordenar, remover ou substituir resultados anteriores por meio do contrato público.

O pipeline SaaS atual tem esta forma:

```text
normalize → readiness → routing
       └──────────────→ routing
```

`normalize` converte receita, tração, reputação e ciclo de vida para uma escala comparável. `readiness` calcula o score ponderado. `routing` usa o score e a reputação para escolher `validate`, `accelerate`, `scale` ou `stabilize`.

## Propriedades e complexidade

Com `V` nodes e `E` referências de dependência, a construção do índice custa `O(V)`, a DFS custa `O(V + E)` e a execução custa `O(V)` chamadas de node, sem contar o custo interno de cada `run`. O espaço auxiliar é `O(V + E)` considerando mapa, conjuntos, lista de ordem e mapa de outputs.

A execução é deliberadamente sequencial mesmo quando dois nós não possuem dependência entre si. Isso mantém determinismo, ordem de auditoria e isolamento simples. Uma futura versão poderá executar componentes independentes em paralelo, mas deverá preservar política de recursos, limites de concorrência, cancelamento e ordenação determinística dos eventos.

## Casos de erro

| Entrada | Resultado |
|---|---|
| IDs duplicados | Falha imediata antes de executar qualquer node. |
| `dependsOn` aponta para ID inexistente | Falha com dependência ausente. |
| Ciclo direto `A → B → A` | Falha quando A é reencontrado em `visiting`. |
| Ciclo indireto `A → B → C → A` | Falha no primeiro ancestor reencontrado. |
| Dependência compartilhada | Permitida; o node é executado uma vez graças a `visited`. |
| Grafo desconectado | Permitido; cada componente é visitado pelo loop externo. |
| Node assíncrono | Permitido; execução aguarda `await node.run(...)`. |

A suíte `server/processing-core.test.ts` cobre ordem topológica, dependências ausentes, ciclos, roteamento de baixa prontidão, escala de startup saudável e estabilização de startups arquivadas ou com reputação baixa.
