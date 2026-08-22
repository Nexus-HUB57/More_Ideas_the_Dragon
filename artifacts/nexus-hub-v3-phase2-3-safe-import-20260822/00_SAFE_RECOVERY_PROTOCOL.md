# Safe Recovery — Importação Nexus Hub V3 (Fases 2–3)

## Objetivo

Este pacote preserva os artefatos disponíveis da implementação do Nexus Hub V3, incluindo backend, dashboard, infraestrutura de agentes, WebSocket, persistência de DNA, motor de missões, testes, documentação e o pacote ZIP sanitizado. A integração é **exclusivamente aditiva** e ocorre em um diretório novo, versionado e isolado.

## Garantias operacionais

| Controle | Regra aplicada |
|---|---|
| Commits existentes | Nenhum commit será reescrito, removido ou alterado. |
| Branches existentes | Nenhuma branch será excluída, renomeada ou sobrescrita. |
| Arquivos existentes | Nenhum arquivo já versionado será substituído; o import usa um caminho novo. |
| Histórico | A operação será um commit novo, descendente de `main`, sem `reset --hard` e sem `push --force`. |
| Conteúdo sensível | Segredos brutos, credenciais e scripts de configuração potencialmente sensíveis não serão publicados. Serão registrados apenas como bloqueados, com hash e motivo. |
| Validação | Serão gerados manifesto de caminhos, lista de hashes SHA-256, contagens e relatório final antes do commit. |
| Recuperação | O commit novo poderá ser revertido por um commit inverso normal, sem modificar o histórico anterior. |

## Mapeamento da fonte

A fonte principal é `/home/ubuntu/nexus-hub-v3`, restaurada do checkpoint `78c9c28c`. A fonte complementar é `/home/ubuntu/upload`, que contém o relatório ZIP fornecido e o `todo.md` anexado. Os artefatos são copiados para `source/` e `incoming/` dentro deste pacote; o projeto local original permanece intacto.

## Exclusões deliberadas

Os diretórios gerados `node_modules/`, `dist/`, caches, logs e metadados de execução não fazem parte do código-fonte portável. O arquivo de credenciais existente no ZIP fornecido e qualquer arquivo de configuração que possa conter segredos ficam fora do pacote publicado. Essa exclusão protege tokens e chaves sem apagar ou alterar a fonte local.

## Critério de conclusão

A integração somente será considerada concluída quando a cópia aditiva estiver completa, o pacote ZIP sanitizado for gerado, os hashes forem calculados, a contagem de arquivos for reconciliada, o conteúdo sensível estiver documentado, o teste de whitespace for executado e seus avisos forem documentados, o commit for criado e o `git push` normal para `origin/main` for confirmado pelo hash remoto. Os artefatos de origem são preservados byte a byte; portanto, não serão normalizados para remover trailing whitespace. Qualquer aviso desse tipo fica registrado em `reports/WHITESPACE_PRESERVED.txt` e não representa corrupção do conteúdo.

## Escopo dos artefatos

O pacote inclui a implementação técnica das fases 2–3, os arquivos auxiliares do projeto, o relatório ZIP sanitizado, o `todo.md`, documentação de origem e os manifestos de auditoria. Nenhum arquivo é executado durante a importação; todos os conteúdos de entrada são tratados como dados.

**Status:** estratégia definida; cópia e geração dos manifestos pendentes.
