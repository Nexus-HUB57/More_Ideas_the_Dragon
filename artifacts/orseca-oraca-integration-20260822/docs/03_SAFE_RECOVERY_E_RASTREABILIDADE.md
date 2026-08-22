# Protocolo Safe Recovery — Integração ORSECA / ORACA

## Objetivo

Este protocolo assegura que a integração acrescente valor ao repositório sem sobrepor, excluir, renomear ou reescrever qualquer commit, branch, pasta ou arquivo produzido por outras equipes.

## Regras operacionais

| Controle | Regra |
|---|---|
| Checkout inicial | Trabalhar somente após confirmar branch e estado do checkout. |
| Branch | Usar branch exclusiva, derivada de uma base identificada por hash. |
| Área de escrita | Gravar apenas em `artifacts/orseca-oraca-integration-20260822/`. |
| Colisão | Se um caminho existir, não substituir; registrar a colisão e interromper a cópia. |
| Fontes | Preservar nomes e hashes dos materiais recebidos quando estiverem disponíveis. |
| Commit | Criar commit atômico apenas com arquivos novos desta área. |
| Publicação | Não fazer push forçado, rebase destrutivo, reset destrutivo ou alteração de branch alheia. |
| Validação | Executar inventário, SHA-256, `git diff --check` e verificação pós-commit. |

## Evidência da auditoria inicial

A base auditada foi o commit `e9bc1e92eb61ed891115a74c27e4472ee370a127`, na branch `main`, com 41.380 arquivos rastreados, 313 commits alcançáveis e 114 referências locais/remotas no momento da auditoria. O checkout inicial estava limpo.

O repositório já continha artefatos ORSECA relacionados a livros, capas, textos e ZIPs em caminhos próprios. Esses materiais permanecem intactos e são apenas indexados pela presente integração.

## Anexos não disponíveis

Os PDFs e o arquivo de áudio mencionados na conversa não apareceram no diretório de anexos acessível nem no checkout auditado. Portanto, não serão fabricadas cópias, conteúdos ou hashes para eles. A importação posterior deve seguir este fluxo:

1. copiar os arquivos para uma nova subpasta `sources/received/`;
2. verificar colisão de nomes antes de copiar;
3. calcular SHA-256;
4. registrar nome, tamanho, tipo, origem e hash em TSV;
5. extrair conteúdo somente para análise passiva;
6. manter os originais sem alteração;
7. revisar o diff e gerar novo ZIP versionado.

## Matriz de rastreabilidade

| Requisito da tarefa | Evidência nesta branch |
|---|---|
| Identidade ORSECA própria | Especificação editorial do Livro das Sementes. |
| Três livros e contagens 7/9/11 | Seção de arquitetura editorial. |
| Primeiro livro dos iniciados | Finalidade e jornada do Livro das Sementes. |
| Acolhimento e necessidades | Sermões 1 a 3 e jornada inicial. |
| Alinhamento ser/desejo/necessidade | Sermão 4. |
| Hábitos e realização | Sermão 5. |
| Objetivos e planos acessíveis | Sermão 6. |
| Autonomia e segurança | Critérios de qualidade e protocolo Safe Recovery. |
| Organograma ORACA | Arquitetura do organismo. |
| Validação end-to-end | Script e manifestos. |
| Preservação do trabalho paralelo | Área isolada e branch exclusiva. |

## Critério de aprovação

A integração somente está pronta quando os arquivos fundamentais existirem, o validador terminar com `VALIDATION=PASS`, o diff não apresentar erro, o commit contiver exclusivamente a área isolada, o ZIP puder ser aberto e a verificação pós-commit confirmar os mesmos hashes.
