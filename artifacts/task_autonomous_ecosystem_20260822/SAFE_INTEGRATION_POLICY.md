# Política de Integração Segura

A incorporação deste pacote é estritamente aditiva. O conteúdo foi colocado em um diretório novo, com nome exclusivo, para impedir colisões com arquivos e pastas existentes.

A operação parte do commit atual de `origin/main`, utiliza uma branch isolada e não realiza rebase, reset, force-push, remoção de arquivos ou alteração de commits preexistentes. O pacote original é mantido em `source_zips/`; cada camada extraída é mantida em diretórios separados para preservar versões homônimas.

Antes do commit, a validação deve confirmar que todas as mudanças possuem status `A` (adição), que não existem mudanças `M`, `D` ou `R`, que o manifesto SHA-256 pode ser verificado e que o commit-base coincide com o `origin/main` usado na operação. O push deve ocorrer apenas para a branch isolada.
