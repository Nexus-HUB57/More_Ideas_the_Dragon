# Safe Recovery Protocol — Jhon Riff's Task Import

## Escopo

Este diretório é uma incorporação aditiva dos artefatos recebidos para a tarefa Jhon Riff's. O conteúdo foi colocado em um namespace próprio para impedir colisões com os caminhos já existentes no repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

> Regra operacional: nenhum arquivo, pasta, branch ou commit pré-existente pode ser excluído, substituído silenciosamente ou reescrito.

## Base imutável observada

| Campo | Valor |
|---|---|
| Repositório | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Branch de trabalho | `agent/safe-import-jhon-riffs-20260822` |
| Branch de destino | `main` |
| Base observada antes da cópia | `edcc8f1ceeddbf99f144bc39ad9ab5d726f604c6` |
| Namespace da importação | `imports/jhon-riffs-task-safe-20260822/` |
| ZIP principal SHA-256 | `65c6b42d6b226224b9825d413dc1b1e63669e94c4e01561909d744ea0c5f52fb` |
| ZIP overview aninhado SHA-256 | `e3a19b10016a5b64576a4d7b695fc2d725b21aa6953b2c19fc084aa368977328` |

## Protocolo

A branch de trabalho foi criada sem tocar em branches de outros colaboradores. Antes da cópia, a branch foi atualizada a partir de `origin/main` usando apenas fast-forward. A incorporação usa somente caminhos novos sob o namespace indicado. Colisões de nomes existentes, como `App.tsx`, `DOCUMENTATION.md`, `db.ts`, `routers.ts`, `schema.ts` e `todo.md`, permanecem intactas no local original; os arquivos da fonte são preservados em `source/` ou `modern-project/`.

A operação não usa `git reset --hard`, `git push --force`, remoção em massa, alteração de commits existentes ou merge automático de branches de terceiros. Se `origin/main` mudar antes da publicação, a operação deve ser interrompida, o novo estado deve ser inventariado e a branch deve ser atualizada por fast-forward ou rebase não destrutivo antes de qualquer commit.

Os arquivos ZIP foram tratados como dados. Nenhum script, binário, aplicação PHP, biblioteca JavaScript ou executável foi executado. Os arquivos foram apenas listados, testados com `unzip -t` e copiados. Não foi detectada correspondência de alta confiança para chaves privadas ou tokens de API; arquivos relacionados a credenciais e certificados permanecem documentados para revisão humana.

## Camadas preservadas

| Camada | Conteúdo |
|---|---|
| `source/outer-root/` | Conteúdo extraído do ZIP principal, incluindo o ZIP de overview |
| `source/nested-root/` | Conteúdo extraído do ZIP de overview, incluindo o arquivo legado interno |
| `source/expanded/legacy-root/` | Conteúdo extraído do arquivo legado interno de 3.109 arquivos |
| `source/expanded/libraries/` | Conteúdo extraído das três bibliotecas ZIP internas |
| `archives/` | Cópias binárias dos arquivos ZIP originais e dos três ZIPs internos |
| `modern-project/` | Projeto web moderno gerado nesta tarefa, sem `.git`, `node_modules`, logs transitórios ou arquivos `.env` |
| `audit/` | Manifestos, hashes, inventários e evidências da operação |

## Contagem real

A fonte não contém 295 nem 299 arquivos no pacote efetivamente recebido. O ZIP principal contém 19 entradas; o overview aninhado contém 7 arquivos regulares; o legado interno contém 3.109 arquivos regulares; as três bibliotecas internas totalizam 177 arquivos regulares extraídos; os arquivos modernos da tarefa totalizam 116 arquivos. O manifesto versionado é a autoridade final para a contagem e os hashes do conteúdo incorporado.

A contagem real deve ser reportada sem fabricar arquivos ausentes para atingir um número-alvo. Caso o solicitante possua um pacote adicional que complete 295 ou 299 itens específicos, ele deverá ser fornecido separadamente e será importado em outro namespace, também de forma aditiva.

## Critérios de aprovação

A operação somente pode ser publicada quando o manifesto SHA-256 puder ser recalculado sem divergências, todos os ZIPs puderem passar no teste de integridade, nenhum caminho do namespace escapar do diretório de importação, o worktree não possuir alterações fora do namespace, `origin/main` continuar sendo ancestral direto da branch de trabalho e o commit final puder ser confirmado remotamente sem push forçado.

## Recuperação

A recuperação preferencial é remover ou reverter somente o commit aditivo desta operação, sem reescrever o histórico compartilhado. Em caso de divergência inesperada, não continuar às cegas: preservar os logs, registrar o SHA observado e solicitar revisão antes de qualquer integração adicional.
