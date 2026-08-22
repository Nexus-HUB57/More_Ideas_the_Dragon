# Relatório de validação end to end

## Resultado

A unidade de integração foi criada em uma branch própria e está pronta para revisão. O stage contém somente caminhos sob `incoming/legado-lucas-dashboard-safe-20260822/`. A base `origin/main` permaneceu sem alterações locais nesta operação.

## Contagens verificadas

| Verificação | Resultado |
|---|---:|
| Arquivos do projeto copiados | 127 |
| Entradas do `Documentos.zip` inventariadas | 125 |
| Caminhos staged nesta unidade | 139 |
| Arquivos staged acima de 100 MB | 0 |
| Colisões com `origin/main` no novo prefixo | 0 |
| Caminhos staged fora do prefixo | 0 |
| Marcadores de passphrase literal no diff staged | 0 |
| Marcadores PEM de chave privada no diff staged | 0 |
| Arquivos `.env*` na cópia | 0 |
| Metadados `.git` na cópia | 0 |

## Checks funcionais

O projeto fonte foi validado antes da importação: `pnpm check` passou sem erros de TypeScript e `pnpm test -- --run` passou com 1 arquivo de teste e 1 teste aprovado.

O manifesto do projeto contém 127 linhas de arquivos. O hash SHA-256 do `Documentos.zip` foi recalculado localmente e confere com o manifesto: `a0fbcb159bba03ccee8c7cf8e8016a5bd88ad5602e5db6f25ac403044c9dd5ff`. O tamanho verificado é 467.467.961 bytes.

`git diff --cached --check` identifica 52 avisos de whitespace dentro dos arquivos importados do projeto-fonte. Esses avisos pertencem ao material original copiado e não foram normalizados para preservar sua proveniência byte a byte; os artefatos de auditoria desta integração não apresentam avisos de whitespace.

## Limites e revisão humana

O ZIP bruto não está no commit porque excede o limite usual de arquivo do GitHub e contém material de carteira potencialmente sensível. O commit contém o inventário seguro, os nomes de entradas, o hash e o tamanho, permitindo verificar a proveniência sem publicar seeds, chaves privadas, WIF, xprv, wallet databases ou credenciais. O ZIP original permanece localmente disponível para uma transferência de custódia autorizada.

A revisão deve ocorrer por pull request nesta branch. Nenhum merge na `main`, exclusão de branch ou alteração de commit de terceiros foi executado.
